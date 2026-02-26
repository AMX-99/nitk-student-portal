import { supabaseAdmin } from '../config/supabase.js';

export const getAuthIdFromProfile = async (profileId) => {
  const { data: student, error: studentError } = await supabaseAdmin.from('students')
    .select('auth_id')
    .eq('id', profileId)
    .maybeSingle();
  if (studentError) throw studentError;
  if (student) return student.auth_id;
  const { data: teacher, error: teacherError } = await supabaseAdmin.from('teachers')
    .select('auth_id')
    .eq('id', profileId)
    .maybeSingle();
  if (teacherError) throw teacherError;
  if (teacher) return teacher.auth_id;
  const { data: admin, error: adminError } = await supabaseAdmin.from('admins')
    .select('auth_id')
    .eq('id', profileId)
    .maybeSingle();
  if (adminError) throw adminError;
  if (admin) return admin.auth_id;
  return null;
};

export const revokeUserSessions = async (authId) => {
  const { error } = await supabaseAdmin.auth.admin.signOut(authId);
  if (error) throw error;
  return true;
};