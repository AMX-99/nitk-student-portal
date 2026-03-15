import supabaseAdmin from '../config/supabase.js';

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

export const updateProfile = async (authId, updates) => {
  const allowed = ['phone', 'name', 'profile_pic'];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }
  const { data, error } = await supabaseAdmin
    .from("admins")
    .update(filtered)
    .eq("auth_id", authId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const generateAvatarUploadUrl = async (authId) => {
  const fileName = `avatars/${authId}-${Date.now()}.jpg`;
  const { data, error } = await supabaseAdmin.storage
    .from("profiles")
    .createSignedUploadUrl(fileName, {
      upsert: true,
      contentType: "image/*",
    });
  if (error) throw error;
  const publicUrl = supabaseAdmin.storage
    .from("profiles")
    .getPublicUrl(fileName).data.publicUrl;
  return { signedUrl: data.signedUrl, publicUrl };
};