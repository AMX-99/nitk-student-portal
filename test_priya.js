import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data: teacher } = await supabaseAdmin.from('teachers').select('id, name').ilike('name', '%Priya%').single();
    console.log("Teacher:", teacher);

    if (teacher) {
        const { data: tc } = await supabaseAdmin.from('teacher_courses')
            .select('course_id, section, semester, academic_year, courses(code, name)')
            .eq('teacher_id', teacher.id);
        console.log("Teacher Courses:", JSON.stringify(tc, null, 2));

        for (let c of tc) {
            if (c.courses.code === 'CS-502') {
                const { data: enr } = await supabaseAdmin.from('enrollments')
                    .select('*')
                    .eq('course_id', c.course_id)
                    .eq('semester', c.semester)
                    .eq('section', c.section)
                    .eq('academic_year', c.academic_year);
                console.log(`Enrollments for ${c.courses.code} (Sem ${c.semester}, Sec ${c.section}):`, enr.length);
            }
        }
    }
}
test();
