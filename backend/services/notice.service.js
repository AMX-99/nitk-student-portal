import { supabaseAdmin } from '../config/supabase.js';

export const getNoticesForStudent = async (departmentId, semester) => {
  let query = supabaseAdmin.from('v_notices_with_author')
    .select('*')
    .or(`target_department_id.is.null,target_department_id.eq.${departmentId}`)
    .or(`target_semester.is.null,target_semester.eq.${semester}`)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (semester) {
    query = query.or(`target_semester.is.null,target_semester.eq.${semester}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getNoticesForTeacher = async (teacherAuthId) => {
  const { data, error } = await supabaseAdmin.from('v_notices_with_author')
    .select('*')
    .or(`posted_by.eq.${teacherAuthId},target_department_id.not.is.null`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAllNotices = async (filters = {}) => {
  let query = supabaseAdmin.from('v_notices_with_author').select('*');
  if (filters.department_id) {
    query = query.eq('target_department_id', filters.department_id);
  }
  if (filters.pinned !== undefined) {
    query = query.eq('is_pinned', filters.pinned);
  }
  if (filters.expired === 'false') {
    query = query.or(`expires_at.gt.now(),expires_at.is.null`);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getNoticeById = async (noticeId) => {
  const { data, error } = await supabaseAdmin.from('v_notices_with_author')
    .select('*')
    .eq('id', noticeId)
    .single();
  if (error) throw error;
  return data;
};

export const createNotice = async (noticeData) => {
  const { data, error } = await supabaseAdmin.from('notices')
    .insert(noticeData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateNotice = async (noticeId, updates) => {
  const { data, error } = await supabaseAdmin.from('notices')
    .update(updates)
    .eq('id', noticeId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteNotice = async (noticeId) => {
  const { error } = await supabaseAdmin.from('notices')
    .delete()
    .eq('id', noticeId);
  if (error) throw error;
  return true;
};