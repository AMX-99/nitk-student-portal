import supabaseAdmin from '../config/supabase.js';

export const listExams = async (filters = {}) => {
  let query = supabaseAdmin.from('exam_schedules')
    .select(`
      *,
      course:courses (id, code, name)
    `, { count: 'exact' });
  if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
  if (filters.semester) query = query.eq('semester', filters.semester);
  if (filters.course_id) query = query.eq('course_id', filters.course_id);
  if (filters.from_date) query = query.gte('exam_date', filters.from_date);
  if (filters.to_date) query = query.lte('exam_date', filters.to_date);
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  query = query.range(from, to).order('exam_date').order('start_time');
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count, page: filters.page, limit: filters.limit };
};

export const createExam = async (examData) => {
  const { data, error } = await supabaseAdmin.from('exam_schedules')
    .insert(examData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getExamById = async (id) => {
  const { data, error } = await supabaseAdmin.from('exam_schedules')
    .select(`
      *,
      course:courses (id, code, name)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const updateExam = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('exam_schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteExam = async (id) => {
  const { error } = await supabaseAdmin.from('exam_schedules')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};