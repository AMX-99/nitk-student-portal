import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    try {
        const { data: teacher } = await supabaseAdmin.from('teachers').select('*').ilike('name', '%Anita%').single();

        console.log("Teacher email is:", teacher.email);

        // Get a valid token
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: teacher.email,
            password: 'password123'
        });

        if (error) {
            console.log("Auth Error!", error.message);
            // we can generate a short-lived token using admin if password fails, but let's try this
            return;
        }

        const token = data.session.access_token;

        // CS-401 is course_id 60, semester 4, section A
        const query = new URLSearchParams({
            academic_year: '2024-25',
            semester: 4,
            section: 'A'
        }).toString();

        const response = await fetch(`http://localhost:5000/api/teachers/courses/60/students?${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const text = await response.text();
        console.log("HTTP STATUS:", response.status);
        console.log("HTTP BODY:", text);

    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}
test();
