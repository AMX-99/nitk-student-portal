import supabaseAdmin from '../config/supabase.js';

export const listEnrollments = async (filters = {}) => {
  let query = supabaseAdmin.from('enrollments')
    .select(`
      *,
      student:students(id, name, roll_no),
      course:courses(id, name, code)
    `, { count: 'exact' });
  if (filters.student_id) query = query.eq('student_id', filters.student_id);
  if (filters.course_id) query = query.eq('course_id', filters.course_id);
  if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
  if (filters.semester) query = query.eq('semester', filters.semester);
  if (filters.section) query = query.eq('section', filters.section);
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order('enrolled_at', { ascending: false });
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count, page, limit };
};

export const createEnrollment = async (data) => {
  const { student_id, course_id, academic_year, semester, section } = data;
  const { data: existing, error: checkError } = await supabaseAdmin.from('enrollments')
    .select('id')
    .eq('student_id', student_id)
    .eq('course_id', course_id)
    .eq('academic_year', academic_year)
    .eq('semester', semester)
    .eq('section', section)
    .maybeSingle();
  if (checkError) throw checkError;
  if (existing) {
    throw new Error('Student already enrolled in this course for the given semester and section');
  }
  const { data: enrollment, error } = await supabaseAdmin.from('enrollments')
    .insert({
      student_id,
      course_id,
      academic_year,
      semester,
      section,
    })
    .select()
    .single();
  if (error) throw error;
  return enrollment;
};

export const getEnrollmentById = async (id) => {
  const { data, error } = await supabaseAdmin.from('enrollments')
    .select(`
      *,
      student:students(id, name, roll_no),
      course:courses(id, name, code)
    `)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateEnrollment = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('enrollments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteEnrollment = async (id) => {
  const { error } = await supabaseAdmin.from('enrollments')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};