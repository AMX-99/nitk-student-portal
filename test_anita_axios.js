import supabaseAdmin from './backend/config/supabase.js';
import axios from 'axios';

async function test() {
    try {
        const { data: teacher } = await supabaseAdmin.from('teachers').select('*').ilike('name', '%Anita%').single();

        // Auth bypass to avoid password errors: we can just impersonate the token, but Supabase auth for tests might be tricky.
        // Let's reset her password for the sake of the test or use service role.
        const { data: user, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
            teacher.auth_id,
            { password: "password123" }
        );

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: teacher.email,
            password: 'password123'
        });

        if (error) { throw error; }
        const token = data.session.access_token;
        console.log("Logged in as Anita");

        // 1. Fetch courses
        const coursesRes = await axios.get(`http://127.0.0.1:5000/api/teachers/me/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const teacherCourses = coursesRes.data.data;
        console.log("Teacher Courses:", teacherCourses.map(c => `${c.code} (Sem ${c.semester}, Sec ${c.section}) - ID: ${c.id}`));

        // 2. Simulate selecting CS-401
        const selectedCourse = teacherCourses.find(c => c.code === 'CS-401');
        console.log("Selected Course:", selectedCourse);

        const courseId = selectedCourse.id;
        const section = selectedCourse.section;
        const semester = selectedCourse.semester || 5;

        console.log(`Fetching students with courseId=${courseId}, semester=${semester}, section=${section}`);

        // 3. Fetch students
        const response = await axios.get(`http://127.0.0.1:5000/api/teachers/courses/${courseId}/students`, {
            params: {
                academic_year: '2024-25',
                semester: semester,
                section: section
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Students API Response:", JSON.stringify(response.data.data, null, 2));

    } catch (err) {
        console.error("FAILURE:", err?.response?.data || err.message);
    }
}
test();
