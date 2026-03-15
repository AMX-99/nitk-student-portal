import 'dotenv/config';
import supabaseAdmin from './config/supabase.js';

async function run() {
    try {
        console.log("=== RESULTS DUMP ===");
        const { data, error } = await supabaseAdmin.from('results').select('*').limit(5).order('created_at', { ascending: false });
        if (error) throw error;
        console.log("Last 5 results inserted:", data);
        
        // Let's also check the student's expected semester
        if (data && data.length > 0) {
            const studentId = data[0].student_id;
            const { data: student } = await supabaseAdmin.from('students').select('current_semester, batch_year').eq('id', studentId).single();
            console.log("Student details for first result:", student);
            
            const { data: resultAgain} = await supabaseAdmin.from('results').select('*').eq('student_id', studentId).limit(5);
            console.log("Results for that specific student:", resultAgain);
        }
    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        process.exit(0);
    }
}
run();
