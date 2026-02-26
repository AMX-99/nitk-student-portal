import { supabaseAdmin } from '../config/supabase.js';

export const getAllCourses = async (filters = {}) => {
  let query = supabaseAdmin.from('courses')
    .select(`
      *,
      departments!inner (name, code)
    `)
    .eq('is_active', true);
  if (filters.department_id) {
    query = query.eq('department_id', filters.department_id);
  }
  if (filters.semester) {
    query = query.eq('semester', filters.semester);
  }
  const { data, error } = await query.order('code');
  if (error) throw error;
  return data;
};

export const getCourseById = async (courseId) => {
  const { data, error } = await supabaseAdmin.from('courses')
    .select(`
      *,
      departments!inner (name, code),
      teacher_courses (
        teacher_id,
        teachers!inner (name, employee_id)
      )
    `)
    .eq('id', courseId)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
};