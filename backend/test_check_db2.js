import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("Checking newest attendance...");
  const { data: attendance, error: err1 } = await supabaseAdmin.from('attendance')
    .select('*')
    .order('date', { ascending: false })
    .limit(3);
  console.log("Newest Attendance:", attendance);
  
  console.log("\nChecking newest results...");
  const { data: results, error: err2 } = await supabaseAdmin.from('results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
  console.log("Newest Results:", results);
}
check();
