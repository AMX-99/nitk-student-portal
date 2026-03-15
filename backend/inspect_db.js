import dotenv from 'dotenv';
dotenv.config();
import supabaseAdmin from './config/supabase.js';

async function test() {
    console.log("Fetching teacher courses info...");
    const { data: tc, error: tcErr } = await supabaseAdmin.from('teacher_courses').select('*').limit(5);
    console.log("teacher_courses:", tc);

    const { data: courses, error: cErr } = await supabaseAdmin.from('courses').select('*').limit(5);
    console.log("courses:", courses);
}

test();
