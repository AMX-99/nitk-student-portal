import * as dotenv from 'dotenv';
dotenv.config();
import supabaseAdmin from './config/supabase.js';

async function testSQL() {
  const sql = `
    ALTER TABLE public.exam_schedules 
    ADD COLUMN IF NOT EXISTS exam_type text,
    ADD COLUMN IF NOT EXISTS max_marks integer DEFAULT 100;
  `;
  
  // Supabase postgREST sometimes exposes an exec_sql RPC
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.error("RPC exec_sql failed, trying run_sql...", error.message);
    const { data: d2, error: e2 } = await supabaseAdmin.rpc('run_sql', { sql: sql });
    if (e2) console.error("RPC run_sql failed:", e2.message);
    else console.log("Success with run_sql");
  } else {
    console.log("Success with exec_sql");
  }
}

testSQL();
