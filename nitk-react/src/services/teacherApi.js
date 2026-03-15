import api from './api';

export const getProfile = () => api.get('/teachers/me').then(r => r.data.data);
export const updateProfile = (data) => api.patch('/teachers/me', data).then(r => r.data.data);
export const uploadAvatar = () => api.post('/teachers/me/avatar').then(r => r.data);
export const changePassword = (data) => api.patch('/teachers/me/password', data).then(r => r.data);

export const getCourses = () => api.get('/teachers/me/courses').then(r => r.data.data);
export const getCourseStudents = (courseId, params) =>
  api.get(`/teachers/courses/${courseId}/students`, { params }).then(r => r.data.data);
export const getCourseResults = (courseId, params) =>
  api.get(`/teachers/courses/${courseId}/results`, { params }).then(r => r.data.data);
export const getCourseDetails = (courseId, params) =>
  api.get(`/teachers/courses/${courseId}`, { params }).then(r => r.data.data);

export const markAttendance = (data) => api.post('/teachers/attendance', data).then(r => r.data);
export const enterMarks = (data) => api.post('/teachers/marks', data).then(r => r.data);
export const updateCourseProgress = (courseId, data) =>
  api.patch(`/teachers/courses/${courseId}/progress`, data).then(r => r.data.data);
export const postNotice = (data) => api.post('/teachers/notices', data).then(r => r.data.data);
