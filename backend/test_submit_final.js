import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSubmitMarks() {
  const { data: teachers } = await supabaseAdmin.from('teachers').select('*').ilike('name', '%Priya%');
  if (!teachers || !teachers.length) return console.log('Teacher not found');
  const teacherId = teachers[0].id;
  
  const { data: teacherCourse } = await supabaseAdmin.from('teacher_courses').select('*').limit(1);
  const tc = teacherCourse[0];
  const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*').eq('course_id', tc.course_id).limit(1);
  const e = enrollments[0];
  
  const courseId = tc.course_id;
  const semester = tc.semester;
  const academicYear = "2024-25";
  const section = tc.section;
  
  console.log("simulating teacher service enterMarks...");
  
  const marks = [{ student_id: e.student_id, internal_marks: 10, external_marks: 20, grade: 'B', grade_points: 8 }];
  
  const { data: existing, error: errExist } = await supabaseAdmin.from('results')
    .select('id, student_id')
    .eq('course_id', courseId)
    .eq('semester', semester)
    .eq('academic_year', academicYear);
    
  if (errExist) return console.error("Err exist:", errExist);
    
  const existingMap = new Map((existing || []).map(e => [e.student_id, e.id]));

  const resultsData = marks.map((m) => {
    const existingId = existingMap.get(m.student_id);
    const payload = {
      student_id: m.student_id,
      course_id: courseId,
      teacher_id: teacherId,
      academic_year: academicYear,
      semester,
      section,
      internal_marks: m.internal_marks,
      external_marks: m.external_marks,
      grade: m.grade,
      grade_points: m.grade_points,
    };
    if (existingId) payload.id = existingId;
    return payload;
  });
  
  const updates = resultsData.filter(r => r.id);
  const inserts = resultsData.filter(r => !r.id);

  console.log("Updates array:", updates);
  console.log("Inserts array:", inserts);

  if (updates.length > 0) {
    const { data: uData, error } = await supabaseAdmin.from('results').upsert(updates).select();
    console.log("Upsert Success/Error:", uData, error);
  }
  if (inserts.length > 0) {
    const { data: iData, error } = await supabaseAdmin.from('results').insert(inserts).select();
    console.log("Insert Success/Error:", iData, error);
  }
}
testSubmitMarks();
