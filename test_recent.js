import supabaseAdmin from './backend/config/supabase.js';

async function test() {
    const { data, error } = await supabaseAdmin.from('attendance')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
    console.log("Recent attendance:", data);
}

test();
