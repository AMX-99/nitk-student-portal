import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    // get course id for CS-502
    const { data: courses } = await supabaseAdmin.from('courses').select('id, code').eq('code', 'CS-502');
    console.log("courses:", courses);

    if (!courses || courses.length === 0) return;
    const courseId = courses[0].id;

    // get enrollments
    const { data: enrollments, error } = await supabaseAdmin.from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('section', 'B');
    
    console.log("Enrollments for CS-502 Section B:", enrollments.length);
    console.log(enrollments);
}

test();
