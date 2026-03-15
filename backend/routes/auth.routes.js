import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import supabaseAdmin from '../config/supabase.js';

const router = Router();

const getUserRole = async (authId) => {
  try {
    const [student, teacher, admin] = await Promise.all([
      supabaseAdmin.from('students').select('id').eq('auth_id', authId).maybeSingle(),
      supabaseAdmin.from('teachers').select('id').eq('auth_id', authId).maybeSingle(),
      supabaseAdmin.from('admins').select('id').eq('auth_id', authId).maybeSingle(),
    ]);
    if (student.data) return 'student';
    if (teacher.data) return 'teacher';
    if (admin.data) return 'admin';
  } catch (e) {
    console.error('Error in getUserRole:', e);
  }
  return null;
};

// Public endpoints – no authentication required
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error from Supabase:', error);
      throw error;
    }

    if (data.user) {
      const role = await getUserRole(data.user.id);
      if (!data.user.user_metadata) data.user.user_metadata = {};
      data.user.user_metadata.role = role;
    }

    res.json(data); // contains user, session, access_token, refresh_token
  } catch (err) {
    console.error('Final login process error:', err);
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    if (error) throw error;

    if (data.user) {
      const role = await getUserRole(data.user.id);
      if (!data.user.user_metadata) data.user.user_metadata = {};
      data.user.user_metadata.role = role;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
    if (error) throw error;
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { access_token, new_password } = req.body;
    // Use the access token (from email link) to update the user
    const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${access_token}` } },
    });
    const { error } = await supabaseClient.auth.updateUser({ password: new_password });
    if (error) throw error;
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) throw error;

    if (user) {
      const role = await getUserRole(user.id);
      if (!user.user_metadata) user.user_metadata = {};
      user.user_metadata.role = role;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;