import { getCourseStudents, getTeacherCourses } from './backend/services/teacher.service.js';
import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    try {
        const { data: tc } = await supabaseAdmin.from('teacher_courses').select('*').limit(1);
        const courseId = tc[0].course_id;
        const { data: en } = await supabaseAdmin.from('enrollments')
            .select('academic_year, semester, section')
            .eq('course_id', courseId).limit(1);

        if (en.length > 0) {
            console.log("querying with", courseId, en[0].academic_year, en[0].semester, en[0].section);
            const data = await getCourseStudents(courseId, en[0].academic_year, en[0].semester, en[0].section);
            console.log("Mapped Data:", JSON.stringify(data, null, 2));
        } else {
            console.log("no enrollments found");
        }
    } catch (err) {
        console.error(err);
    }
}

test();
