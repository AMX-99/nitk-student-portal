import { supabaseAdmin } from '../config/supabase.js';
import { getAcademicYearFromBatch } from '../utils/academicYear.js';

export const getMyExams = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let examQuery = supabaseAdmin
      .from('exam_schedules')
      .select(`
        id, exam_date, start_time, end_time, room,
        course:course_id ( code, name ), section
      `);
    if (role === 'student') {
      const { data: student, error: studentErr } = await supabaseAdmin.from('students')
        .select('id, batch_year, current_semester')
        .eq('auth_id', id)
        .single();
      if (studentErr || !student) {
        return res.status(404).json({ error: 'Student record not found' });
      }
      const academicYear = getAcademicYearFromBatch(student.batch_year, student.current_semester);
      const { data: enrollments, error: enrollErr } = await supabaseAdmin.from('enrollments')
        .select('course_id')
        .eq('student_id', student.id)
        .eq('academic_year', academicYear)
        .eq('semester', student.current_semester);
      if (enrollErr) throw enrollErr;
      const courseIds = enrollments.map(e => e.course_id);
      examQuery = examQuery
        .eq('academic_year', academicYear)
        .eq('semester', student.current_semester)
        .in('course_id', courseIds);
    } 
    else if (role === 'teacher') {
      const { data: teacher, error: teacherErr } = await supabaseAdmin.from('teachers')
        .select('id')
        .eq('auth_id', id)
        .single();
      if (teacherErr || !teacher) {
        return res.status(404).json({ error: 'Teacher record not found' });
      }
      const { data: assignments, error: assignErr } = await supabaseAdmin.from('teacher_courses')
        .select('academic_year, semester')
        .eq('teacher_id', teacher.id)
        .order('academic_year', { ascending: false })
        .order('semester', { ascending: false })
        .limit(1);
      if (assignErr) throw assignErr;
      if (!assignments || assignments.length === 0) {
        return res.json({ data: [] });
      }
      const { academic_year, semester } = assignments[0];
      const { data: tc, error: tcErr } = await supabaseAdmin.from('teacher_courses')
        .select('course_id')
        .eq('teacher_id', teacher.id)
        .eq('academic_year', academic_year)
        .eq('semester', semester);
      if (tcErr) throw tcErr;
      const courseIds = tc.map(t => t.course_id);
      examQuery = examQuery
        .eq('academic_year', academic_year)
        .eq('semester', semester)
        .in('course_id', courseIds);
    } 
    else {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { data: exams, error } = await examQuery.order('exam_date').order('start_time');
    if (error) throw error;
    const formatted = exams.map(exam => ({
      date: new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      day: new Date(exam.exam_date).toLocaleDateString('en-US', { weekday: 'short' }),
      time: `${exam.start_time.slice(0,5)}–${exam.end_time.slice(0,5)}`,
      subj: `${exam.course.code} ${exam.course.name}`,
      room: exam.room,
      type: 'Theory' // Placeholder
    }));

    res.json({ data: formatted });
  } catch (err) {
    next(err);
  }
};