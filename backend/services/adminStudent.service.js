import supabaseAdmin from '../config/supabase.js';

export const listStudents = async (filters) => {
  let query = supabaseAdmin.from('students')
    .select(`
      id, name, roll_no, email, batch_year, current_semester, section,
      student_category, income_slab, income_verified, is_active,
      departments!inner (id, name, code)
    `, { count: 'exact' });
  if (filters.department_id) query = query.eq('department_id', filters.department_id);
  if (filters.batch_year) query = query.eq('batch_year', filters.batch_year);
  if (filters.semester) query = query.eq('current_semester', filters.semester);
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,roll_no.ilike.%${filters.search}%`);
  }
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  query = query.range(from, to);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count, page: filters.page, limit: filters.limit };
};

export const createStudent = async (studentData) => {
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: studentData.email,
    password: studentData.password,
    email_confirm: true,
    user_metadata: { role: 'student', name: studentData.name }
  });
  if (authError) throw authError;
  const { id: authId } = authUser.user;
  const { data, error } = await supabaseAdmin.from('students')
    .insert({
      auth_id: authId,
      name: studentData.name,
      roll_no: studentData.roll_no,
      email: studentData.email,
      department_id: studentData.department_id,
      batch_year: studentData.batch_year,
      current_semester: studentData.current_semester,
      section: studentData.section,
      student_category: studentData.student_category,
      income_slab: studentData.income_slab,
      income_verified: studentData.income_verified || false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateStudent = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteStudent = async (id) => {
  const { data, error } = await supabaseAdmin.from('students')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};