import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data } = await supabaseAdmin.from('attendance')
        .select('count', { count: 'exact', head: true });
    console.log("Total attendance rows:", data);

    const { data: records } = await supabaseAdmin.from('attendance')
        .select('*')
        .eq('student_id', '577ea3e9-d836-4e09-b52e-484008fc0205')
        .eq('course_id', 59);

    console.log("Student course 59 attendance size:", records.length);
    const todays = records.filter(r => r.date === new Date().toISOString().split('T')[0]);
    console.log("Today attendance:", todays);
}

test();
