import { supabaseAdmin } from '../config/supabase.js';

const getTeacherId = async (authId) => {
  const { data, error } = await supabaseAdmin.from('teachers')
    .select('id')
    .eq('auth_id', authId)
    .single();
  if (error || !data) throw new Error('Teacher not found');
  return data.id;
};

const verifyTeacherAssignment = async (teacherId, courseId, academicYear, semester, section) => {
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('course_id', courseId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .eq('section', section)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('You are not assigned to this course section');
  return true;
};

export const getTeacherProfile = async (authId) => {
  const { data, error } = await supabaseAdmin.from('teachers')
    .select(`
      *,
      departments:department_id (name, code)
    `)
    .eq('auth_id', authId)
    .single();
  if (error) throw error;
  if (!data) throw new Error('Teacher not found');
  const teacher = {
    ...data,
    department_name: data.departments?.name,
    department_code: data.departments?.code,
  };
  delete teacher.departments;
  return teacher;
};

export const getTeacherCourses = async (authId) => {
  const teacherId = await getTeacherId(authId);
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .select(`
      course_id,
      section,
      academic_year,
      semester,
      progress,
      courses (
        id,
        name,
        code,
        credits,
        description
      )
    `)
    .eq('teacher_id', teacherId)
    .order('academic_year', { ascending: false })
    .order('semester', { ascending: false });
  if (error) throw error;
  const coursesWithStats = await Promise.all(
    data.map(async (tc) => {
      const { count } = await supabaseAdmin.from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', tc.course_id)
        .eq('academic_year', tc.academic_year)
        .eq('semester', tc.semester)
        .eq('section', tc.section); 
      return {
        ...tc.courses,
        section: tc.section,
        academic_year: tc.academic_year,
        semester: tc.semester,
        studentCount: count || 0,
        progress: tc.progress, // already a JSON array
      };
    })
  );
  return coursesWithStats;
};

export const getCourseStudents = async (courseId, academicYear, semester, section) => {
  const { data, error } = await supabaseAdmin.from('enrollments')
    .select(`
      student_id,
      students (
        id,
        name,
        roll_no,
        email
      )
    `)
    .eq('course_id', courseId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .eq('section', section)
    .order('students(roll_no)');
  if (error) throw error;
  return data.map((item) => ({
    id: item.students.id,
    name: item.students.name,
    roll: item.students.roll_no,
    email: item.students.email,
  }));
};

export const markAttendance = async (authId, courseId, academicYear, semester, section, date, records) => {
  const teacherId = await getTeacherId(authId);
  await verifyTeacherAssignment(teacherId, courseId, academicYear, semester, section);
  const attendanceData = records.map((r) => ({
    student_id: r.student_id,
    course_id: courseId,
    teacher_id: teacherId,
    academic_year: academicYear,
    semester,
    section,
    date,
    status: r.status,
  }));
  const { error } = await supabaseAdmin.from('attendance')
    .upsert(attendanceData, { onConflict: 'student_id, course_id, date' });
  if (error) throw error;
  return { message: 'Attendance saved successfully' };
};

export const enterMarks = async (authId, courseId, academicYear, semester, section, marks) => {
  const teacherId = await getTeacherId(authId);
  await verifyTeacherAssignment(teacherId, courseId, academicYear, semester, section);
  const resultsData = marks.map((m) => ({
    student_id: m.student_id,
    course_id: courseId,
    teacher_id: teacherId,
    academic_year: academicYear,
    semester,
    section,
    internal_marks: m.internal_marks,
    external_marks: m.external_marks,
  }));
  const { error } = await supabaseAdmin
    .from('results')
    .upsert(resultsData, { onConflict: 'student_id, course_id, semester, academic_year' });
  if (error) throw error;
  return { message: 'Marks saved successfully' };
};

export const getCourseResults = async (courseId, academicYear, semester, section) => {
  const { data, error } = await supabaseAdmin.from('results')
    .select(`
      *,
      students ( name, roll_no )
    `)
    .eq('course_id', courseId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .eq('section', section)
    .order('students(roll_no)');
  if (error) throw error;
  return data.map((r) => ({
    student_id: r.student_id,
    name: r.students.name,
    roll: r.students.roll_no,
    internal_marks: r.internal_marks,
    external_marks: r.external_marks,
    total: r.total_marks,
    grade: r.grade,
    grade_points: r.grade_points,
  }));
};

export const getCourseBaseDetails = async (courseId) => {
  const { data, error } = await supabaseAdmin.from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  if (error) throw error;
  return data;
};

export const getTeacherProgress = async (teacherId, courseId, academicYear, semester, section) => {
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .select('progress')
    .eq('teacher_id', teacherId)
    .eq('course_id', courseId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .eq('section', section)
    .maybeSingle();
  if (error) throw error;
  return data?.progress || null;
};

export const updateTeacherProgress = async (teacherId, courseId, academicYear, semester, section, progress) => {
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .update({ progress })
    .eq('teacher_id', teacherId)
    .eq('course_id', courseId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .eq('section', section)
    .select('progress')
    .single();
  if (error) throw error;
  return data.progress;
};

export const createTeacherNotice = async (noticeData) => {
  const { data, error } = await supabaseAdmin.from('notices')
    .insert(noticeData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAllTeachersPublic = async () => {
  const { data, error } = await supabaseAdmin.from('v_teacher_public')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

export const getPublicTeacherById = async (teacherId) => {
  const { data, error } = await supabaseAdmin.from('v_teacher_public')
    .select('*')
    .eq('id', teacherId)
    .maybeSingle();
  if (error) throw error;
  return data;
};