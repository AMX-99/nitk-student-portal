import 'dotenv/config';
import supabaseAdmin from './config/supabase.js';

async function run() {
    try {
        const { data: courses, error } = await supabaseAdmin.from('teacher_courses')
        .select(`
          course_id,
          section,
          academic_year,
          semester,
          syllabus_progress,
          courses (
            id,
            name,
            code,
            credits,
            description
          )
        `)
        
        console.log("-- ALL TEACHER COURSES --");
        console.log(JSON.stringify(courses, null, 2));

        for(const tc of courses) {
            const { count } = await supabaseAdmin.from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', tc.course_id)
            .eq('section', tc.section);
            
            console.log(`Course ${tc.course_id} Sec ${tc.section} enrolled:`, count);
        }

    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        process.exit(0);
    }
}
run();
