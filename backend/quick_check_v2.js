import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: tc } = await supabase.from('teacher_courses').select('*').limit(1);
  console.log("TC keys:", Object.keys(tc[0] || {}));
  console.log("TC types:", tc[0] ? typeof tc[0].syllabus_progress : 'none');
  console.log("TC sample:", tc[0]);

  const { data: en } = await supabase.from('enrollments').select('*, students(*)').limit(1);
  console.log("EN sample:", JSON.stringify(en[0], null, 2));
}
check();
