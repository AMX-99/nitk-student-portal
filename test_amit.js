import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data: teacher } = await supabaseAdmin.from('teachers').select('id, auth_id, name').eq('auth_id', 'a1fbdde7-3932-4217-a065-276f7f631cd4').single();
    const { data: tCourses } = await supabaseAdmin.from('teacher_courses').select('course_id, section, semester').eq('teacher_id', teacher.id);
    console.log("Teacher courses:", tCourses);
}
test();
