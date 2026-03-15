import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: attendance, error: err1 } = await supabaseAdmin.from('attendance').select('*').limit(5);
  console.log("Attendance count:", attendance?.length, attendance);
  if (err1) console.error("Error1:", err1);
  
  const { data: results, error: err2 } = await supabaseAdmin.from('results').select('*').limit(5);
  console.log("Results count:", results?.length, results);
  if (err2) console.error("Error2:", err2);
}
check();
