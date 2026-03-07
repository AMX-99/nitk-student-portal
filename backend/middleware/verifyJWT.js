import supabaseAdmin from '../config/supabase.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Disformed token' });
    }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const role = user.user_metadata?.role;
    let profileId = null;
    if (role === 'student') {
      const { data } = await supabaseAdmin.from('students')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      profileId = data?.id;
    } else if (role === 'teacher') {
      const { data } = await supabaseAdmin.from('teachers')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      profileId = data?.id;
    } else if (role === 'admin') {
      const { data } = await supabaseAdmin.from('admins')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      profileId = data?.id;
    }

    req.user = { ...user, role, studentId: profileId, teacherId: profileId, adminId: profileId };
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};