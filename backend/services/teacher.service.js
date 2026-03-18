import supabaseAdmin from '../config/supabase.js';

export const getTeacherId = async (authId) => {
  const { data, error } = await supabaseAdmin.from('teachers')
    .select('id')
    .eq('auth_id', authId)
    .single();
  if (error || !data) throw new Error('Teacher not found');
  return data.id;
};

export const getTeacherByAuthId = async (authId) => {
  const { data, error } = await supabaseAdmin.from('teachers')
    .select('id')
    .eq('auth_id', authId)
    .single();
  if (error || !data) throw new Error('Teacher not found');
  return data.id;
};

export const verifyTeacherAssignment = async (teacherId, courseId, academicYear, semester, section) => {
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
      syllabus_progress,
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
        .eq('section', tc.section);
      return {
        ...tc.courses,
        course_id: tc.course_id,
        section: tc.section,
        academic_year: tc.academic_year,
        semester: tc.semester,
        studentCount: count || 0,
        progress: Number(tc.syllabus_progress) || 0,
      };
    })
  );
  return coursesWithStats;
};

export const getCourseStudents = async (courseId, section, academic_year, semester) => {
  const { data, error } = await supabaseAdmin.from('enrollments')
    .select(`
      student_id,
      student:students (
        *
      )
    `)
    .eq('course_id', courseId)
    .eq('section', section)
    .eq('academic_year', academic_year)
    .eq('semester', semester);

  if (error) throw error;

  const validData = data.filter(item => item.student);

  validData.sort((a, b) => {
    return (a.student.roll_no || '').localeCompare(b.student.roll_no || '');
  });

  return validData.map(item => {
    const s = item.student;

    return {
      id: item.student_id,
      name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
      roll_no: s.roll_no,
      email: s.email,
      ...s
    };
  });
};

export const markAttendance = async (authId, courseId, academicYear, semester, section, date, records) => {
  const teacherId = await getTeacherId(authId);
  await verifyTeacherAssignment(teacherId, courseId, academicYear, semester, section);
  // Fetch existing attendance to get their IDs
  const { data: existing } = await supabaseAdmin.from('attendance')
    .select('id, student_id')
    .eq('course_id', courseId)
    .eq('date', date);
  const existingMap = new Map((existing || []).map(e => [e.student_id, e.id]));

  const attendanceData = records.map((r) => {
    const existingId = existingMap.get(r.student_id);
    const payload = {
      student_id: r.student_id,
      course_id: courseId,
      teacher_id: teacherId,
      academic_year: academicYear,
      semester,
      section,
      date,
      status: r.status,
    };
    if (existingId) payload.id = existingId;
    return payload;
  });

  const updates = attendanceData.filter(a => a.id);
  const inserts = attendanceData.filter(a => !a.id);

  if (updates.length > 0) {
    const { error } = await supabaseAdmin.from('attendance').upsert(updates);
    if (error) throw error;
  }
  if (inserts.length > 0) {
    const { error } = await supabaseAdmin.from('attendance').insert(inserts);
    if (error) throw error;
  }
  return { message: 'Attendance saved successfully' };
};

export const enterMarks = async (authId, courseId, academicYear, semester, section, marks) => {
  const teacherId = await getTeacherId(authId);
  await verifyTeacherAssignment(teacherId, courseId, academicYear, semester, section);
  // Fetch existing results to get their IDs
  const { data: existing } = await supabaseAdmin.from('results')
    .select('id, student_id')
    .eq('course_id', courseId)
    .eq('semester', semester)
    .eq('academic_year', academicYear);
  const existingMap = new Map((existing || []).map(e => [e.student_id, e.id]));

  const resultsData = marks.map((m) => {
    const existingId = existingMap.get(m.student_id);
    const internal = m.internal_marks ?? 0;
    const external = m.external_marks ?? 0;
    const payload = {
      student_id: m.student_id,
      course_id: courseId,
      teacher_id: teacherId,
      academic_year: academicYear,
      semester,
      section,
      internal_marks: internal,
      external_marks: external,
      grade: m.grade,
      grade_points: m.grade_points,
    };
    if (existingId) payload.id = existingId;
    return payload;
  });

  const updates = resultsData.filter(r => r.id);
  const inserts = resultsData.filter(r => !r.id);

  if (updates.length > 0) {
    const { error } = await supabaseAdmin.from('results').upsert(updates);
    if (error) throw error;
  }
  if (inserts.length > 0) {
    const { error } = await supabaseAdmin.from('results').insert(inserts);
    if (error) throw error;
  }
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
    .eq('section', section);
  if (error) throw error;

  // Sort manually
  const validData = data.filter(r => {
    const s = Array.isArray(r.students) ? r.students[0] : (r.students || r.student);
    return s != null;
  });

  validData.sort((a, b) => {
    const sA = Array.isArray(a.students) ? a.students[0] : (a.students || a.student);
    const sB = Array.isArray(b.students) ? b.students[0] : (b.students || b.student);
    const rA = sA?.roll_no || '';
    const rB = sB?.roll_no || '';
    return rA.localeCompare(rB);
  });

  return validData.map((r) => {
    const s = Array.isArray(r.students) ? r.students[0] : (r.students || r.student);
    return {
      student_id: r.student_id,
      name: s?.name || (s?.first_name ? `${s.first_name} ${s.last_name || ''}`.trim() : ''),
      roll: s?.roll_no,
      internal_marks: r.internal_marks ?? 0,
      external_marks: r.external_marks ?? 0,
      total: r.total_marks ?? ((r.internal_marks ?? 0) + (r.external_marks ?? 0)),
      grade: r.grade,
      grade_points: r.grade_points,
    };
  });
};

export const getCourseBaseDetails = async (courseId, academicYear, semester) => {
  const { data, error } = await supabaseAdmin.from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  if (error) throw error;

  if (academicYear && semester) {
    const { count } = await supabaseAdmin.from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .eq('academic_year', academicYear)
      .eq('semester', semester);
    data.total_course_students = count || 0;
  }

  return data;
};

export const getTeacherProgress = async (teacherId, courseId, academicYear, semester, section) => {
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .select('syllabus_progress')
    .eq('teacher_id', teacherId)
    .eq('course_id', courseId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .eq('section', section)
    .maybeSingle();
  if (error) throw error;
  return data?.syllabus_progress || null;
};

export const updateTeacherProgress = async (teacherId, courseId, academicYear, semester, section, progress) => {
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .update({ syllabus_progress: progress })
    .eq('teacher_id', teacherId)
    .eq('course_id', courseId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .eq('section', section)
    .select('syllabus_progress')
    .single();
  if (error) throw error;
  return data.syllabus_progress;
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

export const updateProfile = async (authId, updates) => {
  const allowed = ['phone', 'office', 'specialization', 'office_hours', 'profile_pic'];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }
  const { data, error } = await supabaseAdmin
    .from("teachers")
    .update(filtered)
    .eq("auth_id", authId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const generateAvatarUploadUrl = async (authId) => {
  try {
    const fileName = `avatars/${authId}-${Date.now()}.jpg`;
    const { data, error } = await supabaseAdmin.storage
      .from("profiles")
      .createSignedUploadUrl(fileName, {
        upsert: true,
        contentType: "image/*",
      });
    if (error) {
      throw error;
    }
    const publicUrl = supabaseAdmin.storage
      .from("profiles")
      .getPublicUrl(fileName).data.publicUrl;
    return { signedUrl: data.signedUrl, publicUrl };
  } catch (e) {
    throw e;
  }
};