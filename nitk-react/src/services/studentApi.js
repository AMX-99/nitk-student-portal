import api from './api';

export const getProfile = () => api.get('/students/me').then(r => r.data.data);
export const updateProfile = (data) => api.patch('/students/me', data).then(r => r.data.data);
export const uploadAvatar = () => api.post('/students/me/avatar').then(r => r.data);
export const changePassword = (data) => api.patch('/students/me/password', data).then(r => r.data);

export const getCourses = () => api.get('/students/me/courses').then(r => r.data.data);
export const getCgpaTrend = () => api.get('/students/me/cgpa-trend').then(r => r.data.data);
export const getAttendance = () => api.get('/students/me/attendance').then(r => r.data.data);
export const getResults = (sem) => api.get(`/students/me/results?sem=${sem}`).then(r => r.data.data);
export const getFees = () => api.get('/students/me/fees').then(r => r.data.data);
export const getPayments = () => api.get('/students/me/payments').then(r => r.data.data);
