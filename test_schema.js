import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data, error } = await supabaseAdmin.from('attendance').select('*').limit(1);
    console.log("Attendance sample:", data);
    const { data: e, error: ee } = await supabaseAdmin.from('enrollments').select('*').limit(1);
    console.log("Enrollment sample:", e);
}

test();
