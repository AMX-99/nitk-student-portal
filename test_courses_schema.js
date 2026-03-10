import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data } = await supabaseAdmin.from('courses').select('*').limit(1);
    console.log("Course Table Columns:", Object.keys(data[0] || {}).join(', '));
}
test();
