import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/ayushmangla/.gemini/antigravity/scratch/backend/.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSubmit() {
  const { data: teachers } = await supabaseAdmin.from('teachers').select('*').ilike('name', '%Priya%');
  if (!teachers || !teachers.length) return console.log('Teacher not found');
  const teacherEmail = teachers[0].email;
  console.log("Teacher email found:", teacherEmail);
  
  const authUrl = 'http://localhost:8765/api/auth/login';
  const r = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacherEmail, password: 'password123', role: 'teacher' })
  });
  const authData = await r.json();
  const token = authData.session?.access_token || authData.access_token;
  if (!token) return console.log("Login failed", authData);
  
  const rc = await fetch('http://localhost:8765/api/teachers/me/courses', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const courseData = await rc.json();
  const c = courseData.data[0];
  const courseId = c.id || c.course_id;
  
  const rs = await fetch(`http://localhost:8765/api/teachers/courses/${courseId}/students?academic_year=2024-25&semester=${c.semester}&section=${c.section}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const studentsData = await rs.json();
  const students = studentsData.data;
  if (!students.length) return console.log("No students");
  
  const payload = {
    course_id: courseId,
    academic_year: '2024-25',
    semester: c.semester,
    section: c.section,
    date: '2025-01-01',
    records: [{ student_id: students[0].id, status: 'P' }]
  };
  
  const rAtt = await fetch('http://localhost:8765/api/teachers/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  console.log("Attendance Status:", rAtt.status, await rAtt.text());
}
testSubmit();
