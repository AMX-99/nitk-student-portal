import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data: att } = await supabaseAdmin.from("attendance")
        .select("student_id")
        .eq("course_id", 63);
    console.log("Total attendance for course 63:", att.length);

    const studentIds = [...new Set(att.map(a => a.student_id))];
    console.log("Number of distinct students in course 63:", studentIds.length);
}
test();
