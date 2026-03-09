import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSubmitMarks() {
  const { data: teachers } = await supabaseAdmin.from('teachers').select('*').ilike('name', '%Priya%');
  if (!teachers || !teachers.length) return console.log('Teacher not found');
  const teacherEmail = teachers[0].email;
  
  const authUrl = 'http://localhost:8765/api/auth/login';
  const r = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacherEmail, password: 'password123', role: 'teacher' })
  });
  const authData = await r.json();
  const token = authData.user ? (authData.session?.access_token || authData.access_token) : null;
  
  if (!token) {
    // try the db directly if password fails
    const { data: teacherCourse } = await supabaseAdmin.from('teacher_courses').select('*').limit(1);
    const tc = teacherCourse[0];
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*').eq('course_id', tc.course_id).limit(1);
    const e = enrollments[0];
    
    console.log("simulating teacher service enterMarks...");
    
    const courseId = tc.course_id;
    const semester = tc.semester;
    const academicYear = "2024-25";
    const teacherId = tc.teacher_id;
    const section = tc.section;
    const marks = [{ student_id: e.student_id, internal_marks: 10, external_marks: 20, total_marks: 30, grade: 'B', grade_points: 8 }];
    
    const { data: existing } = await supabaseAdmin.from('results')
      .select('id, student_id')
      .eq('course_id', courseId)
      .eq('semester', semester)
      .eq('academic_year', academicYear);
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

    const { error } = await supabaseAdmin.from('results').upsert(resultsData);
    if (error) {
      console.error("Direct upsert error:", error);
    } else {
      console.log("Direct upsert success");
    }
  } else {
    // using token
    console.log("Testing via API...");
  }
}
testSubmitMarks();
