import supabaseAdmin from '../config/supabase.js';

export const getStats = async () => {
  const { count: totalStudents } = await supabaseAdmin.from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  const { count: totalTeachers } = await supabaseAdmin.from('teachers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  return { totalStudents, totalTeachers };
};

export const getDeptDistribution = async () => {
  const { data, error } = await supabaseAdmin.from('departments')
    .select(`
      id, name, code,
      students:students!inner(count)
    `)
    .eq('students.is_active', true);
  if (error) throw error;
  return data.map(dept => ({
    department: dept.name,
    code: dept.code,
    count: dept.students[0].count
  }));
};