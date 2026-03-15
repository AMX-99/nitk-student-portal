import * as dotenv from 'dotenv';
dotenv.config();
import supabaseAdmin from './config/supabase.js';

async function test() {
  const { data: students } = await supabaseAdmin.from('students').select('id, batch_year, current_semester, auth_id').limit(1);
  console.log('STUDENT:', students[0]);
  
  if (students && students.length > 0) {
     const studentId = students[0].id;
     const batch_year = students[0].batch_year;
     const current_semester = students[0].current_semester;
     
     const startYear = batch_year + Math.floor((current_semester - 1) / 2);
     const endYear = startYear + 1;
     const computedAcademicYear = `${startYear}-${endYear.toString().slice(-2)}`;
     
     console.log('COMPUTED ACADEMIC YEAR:', computedAcademicYear);
     
     const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*').eq('student_id', studentId);
     console.log('ALL ENROLLMENTS for student_id', studentId, ':', enrollments);
     
     const { data: courses } = await supabaseAdmin.from('enrollments').select('course:courses(id, code, name), attendance(status,date)').eq('student_id', studentId).eq('academic_year', computedAcademicYear).eq('semester', current_semester);
     console.log('COURSES WITH ACADEMIC_YEAR and SEMESTER:', courses);
  } else {
     console.log('No students found');
  }
}
test().catch(console.error);
