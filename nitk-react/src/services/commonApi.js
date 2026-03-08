import api from './api';

// Notices
export const getNotices = (params) => api.get('/notices', { params }).then(r => r.data.data);
export const getNoticeById = (id) => api.get(`/notices/${id}`).then(r => r.data.data);

// Directory (gets all public profiles)
export const getDirectory = (params) => api.get('/directory/teachers', { params }).then(r => r.data.data);
export const searchDirectory = (query) => api.get('/directory/search', { params: { q: query } }).then(r => r.data.data);

// Timetable (student/teacher view)
export const getTimetable = (params) => api.get('/timetable/me', { params }).then(r => r.data.data);

// Exam schedule (student view)
export const getExamSchedule = (params) => api.get('/exam/me', { params }).then(r => r.data.data);

// Courses
export const getCourses = (params) => api.get('/courses', { params }).then(r => r.data.data);

// Payments
export const initiatePayment = (demandId) => api.post('/payments/initiate', { demand_id: demandId }).then(r => r.data);
export const verifyPayment = (data) => api.post('/payments/verify', data).then(r => r.data);

// Complaints
export const getMyComplaints = () => api.get('/complaints/me').then(r => r.data.data);
export const createComplaint = (data) => api.post('/complaints', data).then(r => r.data.data);
export const getAllComplaints = (params) => api.get('/complaints', { params }).then(r => r.data.data);
export const getComplaintById = (id) => api.get(`/complaints/${id}`).then(r => r.data.data);
export const getComplaintComments = (id) => api.get(`/complaints/${id}/comments`).then(r => r.data?.data || r.data || []);
export const addComplaintComment = (id, data) => api.post(`/complaints/${id}/comments`, data).then(r => r.data?.data || r.data);

