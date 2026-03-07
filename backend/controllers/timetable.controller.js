import supabaseAdmin from '../config/supabase.js';
import { getAcademicYearFromBatch } from '../utils/academicYear.js';

export const getMyTimetable = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let query = supabaseAdmin
      .from("timetable_slots")
      .select(
        `
        id, day_of_week, start_time, end_time,
        course:course_id ( code, name ),
        room, section
      `,
    );
    if (role === 'student') {
      const { data: student, error: studentErr } = await supabaseAdmin.from('students')
        .select('section, batch_year, current_semester')
        .eq('auth_id', id)
        .single();
      if (studentErr || !student) {
        return res.status(404).json({ error: 'Student record not found' });
      }
      const academicYear = getAcademicYearFromBatch(student.batch_year, student.current_semester);
      query = query
        .eq('academic_year', academicYear)
        .eq('semester', student.current_semester)
        .eq('section', student.section);
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
      query = query
        .eq('academic_year', academic_year)
        .eq('semester', semester)
        .eq('teacher_id', teacher.id);
    } 
    else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: slots, error } = await query.order('day_of_week').order('start_time');
    if (error) throw error;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = days.map((day, index) => ({
      day,
      slots: slots
        .filter(slot => slot.day_of_week === index)
        .map(slot => ({
          time: slot.start_time.slice(0,5),
          courseCode: slot.course?.code,
          courseName: slot.course?.name,
          room: slot.room
        }))
    }));

    res.json({ data: grouped });
  } catch (err) {
    next(err);
  }
};