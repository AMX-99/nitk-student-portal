import supabaseAdmin from '../config/supabase.js';

export const getAllDepartments = async () => {
  const { data, error } = await supabaseAdmin.from('departments')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

export const getDepartmentById = async (id) => {
  const { data, error } = await supabaseAdmin.from('departments')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createDepartment = async (data) => {
  const { data: newDept, error } = await supabaseAdmin.from('departments')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return newDept;
};

export const updateDepartment = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteDepartment = async (id) => {
  const { count: studentCount, error: studentError } = await supabaseAdmin.from('students')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id);
  if (studentError) throw studentError;

  const { count: teacherCount, error: teacherError } = await supabaseAdmin.from('teachers')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id);
  if (teacherError) throw teacherError;

  const { count: courseCount, error: courseError } = await supabaseAdmin.from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', id);
  if (courseError) throw courseError;

  if (studentCount > 0 || teacherCount > 0 || courseCount > 0) {
    throw new Error('Cannot delete department with existing students, teachers, or courses. Archive instead.');
  }

  const { error } = await supabaseAdmin
    .from('departments')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};