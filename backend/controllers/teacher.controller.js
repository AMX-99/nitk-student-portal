import * as teacherService from '../services/teacher.service.js';
import supabaseAdmin from '../config/supabase.js'

const getTeacherByAuthId = async (authId) => {
  const { data, error } = await supabaseAdmin.from('teachers')
    .select('id')
    .eq('auth_id', authId)
    .single();
  if (error || !data) throw new Error('Teacher not found');
  return data.id;
};

export const getMe = async (req, res, next) => {
  try {
    const teacher = await teacherService.getTeacherProfile(req.user.id);
    res.json({ data: teacher });
  } catch (err) {
    next(err);
  }
};

export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await teacherService.getTeacherCourses(req.user.id);
    res.json({ data: courses });
  } catch (err) {
    next(err);
  }
};

export const getCourseStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { academic_year, semester, section } = req.query;
    if (!academic_year || !semester || !section) {
      return res.status(400).json({ error: 'academic_year, semester, and section required' });
    }
    const students = await teacherService.getCourseStudents(id, academic_year, semester, section);
    res.json({ data: students });
  } catch (err) {
    next(err);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { course_id, academic_year, semester, section, date, records } = req.body;
    if (!section) return res.status(400).json({ error: 'section is required' });
    const result = await teacherService.markAttendance(
      req.user.id,
      course_id, academic_year, semester, section, date, records
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const enterMarks = async (req, res, next) => {
  try {
    const { course_id, academic_year, semester, section, marks } = req.body;
    if (!section) return res.status(400).json({ error: 'section is required' });
    const result = await teacherService.enterMarks(
      req.user.id,
      course_id, academic_year, semester, section, marks
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCourseResults = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { academic_year, semester, section } = req.query;
    if (!academic_year || !semester || !section) {
      return res.status(400).json({ error: 'academic_year, semester, and section required' });
    }
    const results = await teacherService.getCourseResults(courseId, academic_year, semester, section);
    res.json({ data: results });
  } catch (err) {
    next(err);
  }
};

export const getCourseDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { section, academic_year, semester } = req.query;
    const course = await teacherService.getCourseBaseDetails(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    let progress = null;
    if (req.user.role === 'teacher' && section && academic_year && semester) {
      const teacher = await teacherService.getTeacherByAuthId(req.user.id);
      if (teacher) {
        progress = await teacherService.getTeacherProgress(
          teacher.id, id, academic_year, semester, section
        );
      }
    }
    res.json({
      data: {
        ...course,
        progress,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateCourseProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { section, academic_year, semester, progress } = req.body;
    if (!section || !academic_year || !semester || !progress) {
      return res.status(400).json({ error: 'section, academic_year, semester, and progress are required' });
    }
    const teacher = await teacherService.getTeacherByAuthId(req.user.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    const isAssigned = await teacherService.verifyTeacherAssignment(
      teacher.id,
      id, academic_year, semester, section
    );
    if (!isAssigned) {
      return res.status(403).json({ error: 'You are not assigned to this course section' });
    }
    const updatedProgress = await teacherService.updateTeacherProgress(
      teacher.id,
      id, academic_year, semester, section, progress
    );
    res.json({ data: { progress: updatedProgress } });
  } catch (err) {
    next(err);
  }
};

export const createTeacherNotice = async (req, res, next) => {
  try {
    const { title, content, target_department_id, target_semester, is_pinned, expires_at } = req.body;
    const teacherAuthId = req.user.id;
    const noticeData = {
      title,
      content,
      posted_by: teacherAuthId,
      posted_by_role: 'teacher',
      target_department_id,
      target_semester,
      is_pinned: is_pinned || false,
      expires_at,
    };
    const newNotice = await teacherService.createTeacherNotice(noticeData);
    res.status(201).json({ data: newNotice });
  } catch (err) {
    next(err);
  }
};

export const getAllTeachersPublic = async (req, res, next) => {
  try {
    const teachers = await teacherService.getAllTeachersPublic();
    res.json({ data: teachers });
  } catch (err) {
    next(err);
  }
};

export const getPublicTeacherProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await teacherService.getPublicTeacherById(id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ data: teacher });
  } catch (err) {
    next(err);
  }
};

export const changeTeacherPassword = async (req, res, next) => {
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