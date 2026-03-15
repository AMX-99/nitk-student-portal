import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  // We can query information_schema if enabled, but let's try to fetch an attendance row.
  const { data: attendance, error } = await supabaseAdmin.from('attendance').select('*').limit(1);
  if (attendance && attendance.length) {
    console.log("Attendance columns:", Object.keys(attendance[0]));
  }
  
  const { data: results, error2 } = await supabaseAdmin.from('results').select('*').limit(1);
  if (results && results.length) {
    console.log("Results columns:", Object.keys(results[0]));
  }
}
checkSchema();
