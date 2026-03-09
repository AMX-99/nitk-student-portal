import * as dotenv from 'dotenv';
dotenv.config();
import supabaseAdmin from './config/supabase.js';

async function test() {
  const { data, error } = await supabaseAdmin.from('enrollments').select('academic_year').limit(5);
  console.log('Sample academic years from DB:', data);
  process.exit(0);
}
test();
