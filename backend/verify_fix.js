import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  try {
    // 1. Test student join with alias
    const { data: en } = await supabase.from('enrollments')
      .select('student:students(*)')
      .limit(1);
    
    console.log("Joined student data:", JSON.stringify(en[0], null, 2));

    // 2. Test progress update (pick a row)
    const { data: tc } = await supabase.from('teacher_courses').select('*').limit(1);
    if (tc && tc.length > 0) {
      const row = tc[0];
      const newProgress = (row.syllabus_progress || 0) + 5;
      
      console.log(`Updating TC row ${row.id} to progress ${newProgress}...`);
      
      const { data: updated, error } = await supabase.from('teacher_courses')
        .update({ syllabus_progress: newProgress })
        .eq('id', row.id)
        .select()
        .single();
      
      if (error) console.error("Update error:", error);
      else console.log("Update success:", updated.syllabus_progress);
    }

  } catch (err) {
    console.error(err);
  }
}
verify();
