import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  try {
    // 1. Check enrollment data for a specific course/section from the screenshot
    // From screenshot: CS-502, Sec B
    // We need to find the ID for CS-502 first.
    const { data: courses } = await supabase.from('courses').select('id, code, name').eq('code', 'CS-502');
    console.log("Courses CS-502:", courses);

    if (courses && courses.length > 0) {
      const courseId = courses[0].id;
      const { data: enrolls, count } = await supabase.from('enrollments')
        .select(`
          id, 
          student_id, 
          course_id, 
          section, 
          academic_year, 
          semester
        `, { count: 'exact' })
        .eq('course_id', courseId)
        .eq('section', 'B');
      
      console.log(`Enrollments for ${courseId} Sec B:`, enrolls);
      console.log("Enrollment Count:", count);

      if (enrolls && enrolls.length > 0) {
        const studentIds = enrolls.map(e => e.student_id);
        const { data: students } = await supabase.from('students').select('*').in('id', studentIds);
        console.log("Found students in DB:", students);
      }
    }

    // 2. Check teacher_courses for progress issues
    const { data: teacherCourses } = await supabase.from('teacher_courses').select('*').limit(5);
    console.log("Teacher Courses Sample:", teacherCourses);

  } catch (err) {
    console.error(err);
  }
}

inspect();
