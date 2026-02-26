import { supabaseAdmin } from '../config/supabase.js';
import * as studentService from '../services/student.service.js';

// GET /students/me
export const getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getProfile(req.user.id);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};

// PATCH /students/me
export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const updated = await studentService.updateProfile(req.user.id, updates);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /students/me/avatar – generate signed upload URL
export const uploadAvatar = async (req, res, next) => {
  try {
    const { signedUrl, publicUrl } = await studentService.generateAvatarUploadUrl(req.user.id);
    res.json({ signedUrl, publicUrl });
  } catch (err) {
    next(err);
  }
};

// GET /students/me/courses
export const getCourses = async (req, res, next) => {
  try {
    const courses = await studentService.getCourses(req.user.id);
    res.json({ data: courses });
  } catch (err) {
    next(err);
  }
};

// GET /students/me/cgpa-trend
export const getCgpaTrend = async (req, res, next) => {
  try {
    const trend = await studentService.getCgpaTrend(req.user.id);
    res.json({ data: trend });
  } catch (err) {
    next(err);
  }
};

// GET /students/me/attendance
export const getAttendance = async (req, res, next) => {
  try {
    const attendance = await studentService.getAttendance(req.user.id);
    res.json({ data: attendance });
  } catch (err) {
    next(err);
  }
};

// GET /students/me/results?sem=...
export const getResults = async (req, res, next) => {
  try {
    const { sem } = req.query;
    if (!sem) return res.status(400).json({ error: 'Missing semester' });
    const results = await studentService.getResults(req.user.id, sem);
    res.json({ data: results });
  } catch (err) {
    next(err);
  }
};

// GET /students/me/fees
export const getFees = async (req, res, next) => {
  try {
    const fees = await studentService.getFees(req.user.id);
    res.json({ data: fees });
  } catch (err) {
    next(err);
  }
};

// GET /students/me/payments
export const getPayments = async (req, res, next) => {
  try {
    const payments = await studentService.getPayments(req.user.id);
    res.json({ data: payments });
  } catch (err) {
    next(err);
  }
};

export const getStudentFullProfileForTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'student') {
      const student = await studentService.getStudentByAuthId(req.user.id);
      if (student && student.id === id) {
        const fullProfile = await studentService.getFullStudentById(id);
        return res.json({ data: fullProfile });
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    if (req.user.role === 'teacher') {
      const authorized = await studentService.doesTeacherTeachStudent(req.user.id, id);
      if (!authorized) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const student = await studentService.getFullStudentById(id);
      return res.json({ data: student });
    }
    if (req.user.role === 'admin') {
      const student = await studentService.getFullStudentById(id);
      return res.json({ data: student });
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    next(err);
  }
};

export const getPublicStudentProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentService.getPublicStudentById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ data: student });
  } catch (err) {
    next(err);
  }
};

export const changeStudentPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userEmail = req.user.email;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: userEmail,
      password: oldPassword,
    });
    if (signInError) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );
    if (updateError) throw updateError;
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};