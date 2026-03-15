import * as noticeService from '../services/notice.service.js';
import supabaseAdmin from '../config/supabase.js';

const getStudentContext = async (authId) => {
  const { data, error } = await supabaseAdmin.from('students')
    .select('department_id, current_semester')
    .eq('auth_id', authId)
    .single();
  if (error) throw error;
  return data;
};

export const getNotices = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let notices;
    if (role === 'student') {
      const { department_id, current_semester } = await getStudentContext(id);
      notices = await noticeService.getNoticesForStudent(department_id, current_semester);
    } else if (role === 'teacher') {
      notices = await noticeService.getNoticesForTeacher(id);
    } else {
      notices = await noticeService.getAllNotices();
    }
    res.json({ data: notices });
  } catch (err) {
    next(err);
  }
};

export const getNotice = async (req, res, next) => {
  try {
    const notice = await noticeService.getNoticeById(req.params.id);
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    res.json({ data: notice });
  } catch (err) {
    next(err);
  }
};

export const createNotice = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const noticeData = {
      ...req.body,
      posted_by: id,
      posted_by_role: role
    };
    if (noticeData.body && !noticeData.content) {
      noticeData.content = noticeData.body;
      delete noticeData.body;
    }
    const notice = await noticeService.createNotice(noticeData);
    res.status(201).json({ data: notice });
  } catch (err) {
    next(err);
  }
};

export const updateNotice = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const noticeId = req.params.id;
    if (role !== 'admin') {
      const existing = await noticeService.getNoticeById(noticeId);
      if (!existing) return res.status(404).json({ error: 'Notice not found' });
      if (existing.posted_by !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const updated = await noticeService.updateNotice(noticeId, req.body);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const noticeId = req.params.id;
    if (role !== 'admin') {
      const existing = await noticeService.getNoticeById(noticeId);
      if (!existing) return res.status(404).json({ error: 'Notice not found' });
      if (existing.posted_by !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    await noticeService.deleteNotice(noticeId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const adminGetAllNotices = async (req, res, next) => {
  try {
    const filters = {
      department_id: req.query.department_id,
      pinned: req.query.pinned,
      expired: req.query.expired
    };
    const notices = await noticeService.getAllNotices(filters);
    res.json({ data: notices });
  } catch (err) {
    next(err);
  }
};

export const adminTogglePin = async (req, res, next) => {
  try {
    const { pinned } = req.body;
    const updated = await noticeService.updateNotice(req.params.id, { is_pinned: pinned });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};