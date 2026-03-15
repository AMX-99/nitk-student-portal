import 'dotenv/config';
import supabaseAdmin from './config/supabase.js';

async function run() {
    try {
        const { data, error } = await supabaseAdmin.from('teacher_courses').select('syllabus_progress, academic_year');
        console.log("-- ALL TEACHER COURSES --");
        console.log(data);
    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        process.exit(0);
    }
}
run();
