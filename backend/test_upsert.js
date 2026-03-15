import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSubmit() {
  const { data: teacherCourse } = await supabaseAdmin.from('teacher_courses').select('*').limit(1);
  if (!teacherCourse.length) return console.log('No teacher courses');
  const tc = teacherCourse[0];
  
  const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*').eq('course_id', tc.course_id).limit(1);
  if (!enrollments.length) return console.log('No enrollments');
  const e = enrollments[0];
  
  console.log("Upserting attendance...");
  const { data, error } = await supabaseAdmin.from('attendance')
    .upsert([{
      student_id: e.student_id,
      course_id: tc.course_id,
      teacher_id: tc.teacher_id,
      academic_year: '2024-25',
      semester: tc.semester,
      section: tc.section,
      date: '2025-01-01',
      status: 'P'
    }], { onConflict: 'student_id, course_id, date' })
    .select();
    
  if (error) {
    console.error("Database Error:", error);
  } else {
    console.log("Success:", data);
  }
}
testSubmit();
