import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const courseId = "63"; // String like Express req.params
    const academicYear = "2024-25";
    const semester = "5"; // String like Express req.query
    const section = "A";

    try {
        const { data, error } = await supabaseAdmin.from('enrollments')
            .select(`
        student_id,
        students (
          *
        )
      `)
            .eq('course_id', courseId)
            .eq('academic_year', academicYear)
            .eq('semester', semester)
            .eq('section', section);

        console.log("Returned Rows with String params:", data?.length);
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
