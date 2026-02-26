import { supabaseAdmin } from '../config/supabase.js';

export const createAssignment = async (data) => {
  const { teacher_id, course_id, section, academic_year, semester } = data;
  const { data: assignment, error } = await supabaseAdmin.from('teacher_courses')
    .insert({
      teacher_id,
      course_id,
      section,
      academic_year,
      semester
    })
    .select()
    .single();
  if (error) throw error;
  return assignment;
};

export const getAllAssignments = async (filters = {}) => {
  let query = supabaseAdmin.from('teacher_courses')
    .select(`
      *,
      teachers!inner (id, name, employee_id),
      courses!inner (id, name, code)
    `);
  if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
  if (filters.course_id) query = query.eq('course_id', filters.course_id);
  if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
  if (filters.semester) query = query.eq('semester', filters.semester);
  if (filters.section) query = query.eq('section', filters.section);
  const { data, error } = await query.order('academic_year', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAssignmentById = async (id) => {
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .select(`
      *,
      teachers!inner (id, name, employee_id),
      courses!inner (id, name, code)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const updateAssignment = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('teacher_courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAssignment = async (id) => {
  const { error } = await supabaseAdmin.from('teacher_courses')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};