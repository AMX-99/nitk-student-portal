import supabaseAdmin from '../config/supabase.js';

export const createComplaint = async (studentId, data) => {
  const { title, description, category } = data;
  const { data: complaint, error } = await supabaseAdmin.from('complaints')
    .insert({
      student_id: studentId,
      title,
      description,
      category
    })
    .select()
    .single();
  if (error) throw error;
  return complaint;
};

export const getComplaintsByStudent = async (studentId) => {
  const { data, error } = await supabaseAdmin.from('complaints')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAllComplaints = async (filters = {}) => {
  let query = supabaseAdmin.from('complaints')
    .select(`
      *,
      students!inner (name, roll_no)
    `);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.student_id) query = query.eq('student_id', filters.student_id);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + filters.limit - 1);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getComplaintById = async (complaintId, includeComments = true) => {
  let query = supabaseAdmin.from('complaints')
    .select('*')
    .eq('id', complaintId)
    .single();
  const { data: complaint, error } = await query;
  if (error) throw error;
  if (!complaint) return null;
  if (includeComments) {
    const { data: comments, error: commentsError } = await supabaseAdmin.from('complaint_comments')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });
    if (commentsError) throw commentsError;
    complaint.comments = comments;
  }
  return complaint;
};

export const updateComplaintStatus = async (complaintId, status) => {
  const { data, error } = await supabaseAdmin.from('complaints')
    .update({ status, updated_at: new Date() })
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteComplaint = async (complaintId) => {
  const { error } = await supabaseAdmin.from('complaints')
    .delete()
    .eq('id', complaintId);
  if (error) throw error;
  return true;
};

export const addComment = async (complaintId, userId, userRole, comment) => {
  const { data, error } = await supabaseAdmin.from('complaint_comments')
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      user_role: userRole,
      comment
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getComments = async (complaintId) => {
  const { data, error } = await supabaseAdmin.from('complaint_comments')
    .select('*')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};