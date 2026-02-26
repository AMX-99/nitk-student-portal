import { supabaseAdmin } from '../config/supabase.js';

export const listTeachers = async (filters) => {
  let query = supabaseAdmin.from('teachers')
    .select(`
      id, name, email, employee_id, designation, phone, office_hours, is_active,
      departments!inner (id, name, code)
    `, { count: 'exact' });
  if (filters.department_id) query = query.eq('department_id', filters.department_id);
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  query = query.range(from, to);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count, page: filters.page, limit: filters.limit };
};

export const createTeacher = async (teacherData) => {
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: teacherData.email,
    password: teacherData.password,
    email_confirm: true,
    user_metadata: { role: 'teacher', name: teacherData.name }
  });
  if (authError) throw authError;
  const { id: authId } = authUser.user;
  const { data, error } = await supabaseAdmin.from('teachers')
    .insert({
      auth_id: authId,
      name: teacherData.name,
      email: teacherData.email,
      department_id: teacherData.department_id,
      designation: teacherData.designation,
      employee_id: teacherData.employee_id,
      phone: teacherData.phone,
      office_hours: teacherData.office_hours,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTeacher = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('teachers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTeacher = async (id) => {
  const { data, error } = await supabaseAdmin.from('teachers')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};