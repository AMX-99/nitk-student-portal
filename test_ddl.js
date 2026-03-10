import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data, error } = await supabaseAdmin.rpc('run_sql', { sql: "SELECT columns.column_name FROM information_schema.columns WHERE table_name = 'attendance';" }).catch(() => ({}));
    console.log("SQL err?", error);

    // Fallback to fetch one record and see keys carefully
    const { data: record } = await supabaseAdmin.from('attendance').select('*').limit(1);
    console.log("Keys:", Object.keys(record[0]));

    // Fetch an enrollment record
    const { data: erecord } = await supabaseAdmin.from('enrollments').select('*').limit(1);
    console.log("Enrollment keys:", Object.keys(erecord[0]));
}

test();
