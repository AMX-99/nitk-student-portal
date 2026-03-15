import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data, error } = await supabaseAdmin.from("enrollments")
        .select(
            `
      id,
      course_id,
      attendance(*)
    `
        )
        .eq("student_id", "577ea3e9-d836-4e09-b52e-484008fc0205")
        .eq("course_id", 63);

    console.log("enrollments with attendance:", JSON.stringify(data[0].attendance.slice(0, 3)));
    console.log("attendance length:", data[0].attendance.length);

    const { data: att } = await supabaseAdmin.from("attendance")
        .select("*")
        .eq("student_id", "577ea3e9-d836-4e09-b52e-484008fc0205")
        .eq("course_id", 63);
    console.log("Actual attendance length for this student and course:", att.length);
}

test();
