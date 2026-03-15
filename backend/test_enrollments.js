import dotenv from 'dotenv';
dotenv.config();
import supabaseAdmin from './config/supabase.js';

async function test() {
    const { data: enrollments, error } = await supabaseAdmin.from('enrollments')
        .select('*')
        .eq('course_id', 63);
        
    console.log("All Enrollments for CS-502:", error ? error : enrollments.length);
    if (!error) console.log(enrollments);
}

test();
