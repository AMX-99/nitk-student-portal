import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: tc } = await supabase.from('teacher_courses').select('*').limit(3);
  console.log("TEACHER COURSES:", tc);

  const { data: en } = await supabase.from('enrollments').select('*').limit(3);
  console.log("ENROLLMENTS:", en);
}
check();
