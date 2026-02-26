import * as complaintService from '../services/complaint.service.js';
import { supabaseAdmin } from '../config/supabase.js';

const getStudentIdFromAuth = async (authId) => {
  const { data, error } = await supabaseAdmin.from('students')
    .select('id')
    .eq('auth_id', authId)
    .single();
  if (error || !data) throw new Error('Student profile not found');
  return data.id;
};

export const createComplaint = async (req, res, next) => {
  try {
    const studentId = await getStudentIdFromAuth(req.user.id);
    const complaint = await complaintService.createComplaint(studentId, req.body);
    res.status(201).json({ data: complaint });
  } catch (err) {
    next(err);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const studentId = await getStudentIdFromAuth(req.user.id);
    const complaints = await complaintService.getComplaintsByStudent(studentId);
    res.json({ data: complaints });
  } catch (err) {
    next(err);
  }
};

export const getAllComplaints = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      student_id: req.query.studentId,
      limit: req.query.limit,
      offset: req.query.offset
    };
    const complaints = await complaintService.getAllComplaints(filters);
    res.json({ data: complaints });
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (req.user.role === 'student') {
      const studentId = await getStudentIdFromAuth(req.user.id);
      if (complaint.student_id !== studentId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    res.json({ data: complaint });
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = await complaintService.updateComplaintStatus(req.params.id, status);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    await complaintService.deleteComplaint(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ error: 'Comment is required' });
    if (req.user.role === 'student') {
      const studentId = await getStudentIdFromAuth(req.user.id);
      const complaint = await complaintService.getComplaintById(req.params.id, false);
      if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
      if (complaint.student_id !== studentId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const newComment = await complaintService.addComment(
      req.params.id,
      req.user.id,
      req.user.role,
      comment
    );
    res.status(201).json({ data: newComment });
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, false);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (req.user.role === 'student') {
      const studentId = await getStudentIdFromAuth(req.user.id);
      if (complaint.student_id !== studentId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const comments = await complaintService.getComments(req.params.id);
    res.json({ data: comments });
  } catch (err) {
    next(err);
  }
};