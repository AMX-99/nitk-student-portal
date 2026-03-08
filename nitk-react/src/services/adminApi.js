import api from './api';

// ──────────────── Admin Profile ────────────────
export const updateProfile = (data) => api.patch('/admin/me', data).then(r => r.data.data);
export const uploadAvatar = () => api.post('/admin/me/avatar').then(r => r.data);
export const changePassword = (data) => api.patch('/admin/me/password', data).then(r => r.data);

// ──────────────── Stats ────────────────
// Stats controller: res.json(stats) → axios r.data = stats object
export const getStats = () => api.get('/admin/stats').then(r => r.data);
export const getDashboardStats = () => getStats();
// DeptDist controller: res.json(data) → axios r.data = array
export const getDeptDistribution = () => api.get('/admin/dept-distribution').then(r => r.data);

// ──────────────── Students ────────────────
// Controller: res.json(result) where result = { data: [...], total, page, limit }
export const listStudents = (params) => api.get('/admin/students', { params }).then(r => r.data);
export const getStudents = (params) => listStudents(params).then(r => r?.data || []);
export const createStudent = (data) => api.post('/admin/students', data).then(r => r.data);
export const updateStudent = (id, data) => api.patch(`/admin/students/${id}`, data).then(r => r.data);
export const deleteStudent = (id) => api.delete(`/admin/students/${id}`).then(r => r.data);

// ──────────────── Teachers ────────────────
// Controller: res.json(result) where result = { data: [...], total, page, limit }
export const listTeachers = (params) => api.get('/admin/teachers', { params }).then(r => r.data);
export const getTeachers = (params) => listTeachers(params).then(r => r?.data || []);
export const createTeacher = (data) => api.post('/admin/teachers', data).then(r => r.data);
export const updateTeacher = (id, data) => api.patch(`/admin/teachers/${id}`, data).then(r => r.data);
export const deleteTeacher = (id) => api.delete(`/admin/teachers/${id}`).then(r => r.data);

// ──────────────── Departments ────────────────
export const listDepartments = () => api.get('/admin/departments').then(r => r.data?.data || r.data || []);
export const getDepartment = (id) => api.get(`/admin/departments/${id}`).then(r => r.data?.data || r.data);
export const createDepartment = (data) => api.post('/admin/departments', data).then(r => r.data?.data || r.data);
export const updateDepartment = (id, data) => api.patch(`/admin/departments/${id}`, data).then(r => r.data?.data || r.data);
export const deleteDepartment = (id) => api.delete(`/admin/departments/${id}`).then(r => r.data);

// ──────────────── Enrollments ────────────────
// Controller: res.json({ data: result }) where result = { data: [...], total, page, limit }
// So axios r.data = { data: { data: [...], total } }
export const listEnrollments = (params) => api.get('/admin/enrollments', { params }).then(r => {
  const outer = r.data;                         // { data: { data: [...], total } }
  const inner = outer?.data;                     // { data: [...], total }
  if (Array.isArray(inner)) return inner;        // if somehow just array
  return inner?.data || [];                      // [...] 
});
export const createEnrollment = (data) => api.post('/admin/enrollments', data).then(r => r.data?.data || r.data);
export const updateEnrollment = (id, data) => api.put(`/admin/enrollments/${id}`, data).then(r => r.data?.data || r.data);
export const deleteEnrollment = (id) => api.delete(`/admin/enrollments/${id}`).then(r => r.data);

// ──────────────── Teacher-Course Assignments ────────────────
// Controller: res.json({ data: assignments }) where assignments = [...]
// So axios r.data = { data: [...] }
export const getAssignments = (params) => api.get('/admin/teacher-courses', { params }).then(r => {
  const d = r.data;            // { data: [...] }
  return d?.data || (Array.isArray(d) ? d : []);
});
export const createAssignment = (data) => api.post('/admin/teacher-courses', data).then(r => r.data?.data || r.data);
export const updateAssignment = (id, data) => api.put(`/admin/teacher-courses/${id}`, data).then(r => r.data?.data || r.data);
export const deleteAssignment = (id) => api.delete(`/admin/teacher-courses/${id}`).then(r => r.data);

// ──────────────── Exams ────────────────
// Controller: res.json(result) where result = { data: [...], total, page, limit }
export const listExams = (params) => api.get('/admin/exams', { params }).then(r => r.data);
export const getExams = (params) => listExams(params).then(r => r?.data || []);
export const createExam = (data) => api.post('/admin/exams', data).then(r => r.data);
export const updateExam = (id, data) => api.put(`/admin/exams/${id}`, data).then(r => r.data);
export const deleteExam = (id) => api.delete(`/admin/exams/${id}`).then(r => r.data);

// ──────────────── Timetable ────────────────
// Controller: res.json(result) where result = { data: [...], total, page, limit }
export const listTimetableSlots = (params) => api.get('/admin/timetable', { params }).then(r => r.data);
export const getTimetableSlots = (params) => listTimetableSlots(params).then(r => r?.data || []);
export const createTimetableSlot = (data) => api.post('/admin/timetable', data).then(r => r.data);
export const updateTimetableSlot = (id, data) => api.put(`/admin/timetable/${id}`, data).then(r => r.data);
export const deleteTimetableSlot = (id) => api.delete(`/admin/timetable/${id}`).then(r => r.data);

// ──────────────── Fee Structures ────────────────
export const getFeeStructures = (params) => api.get('/fee/structures', { params }).then(r => r.data?.data || r.data || []);
export const createFeeStructure = (data) => api.post('/fee/structures', data).then(r => r.data?.data || r.data);
export const updateFeeStructure = (id, data) => api.patch(`/fee/structures/${id}`, data).then(r => r.data?.data || r.data);
export const deleteFeeStructure = (id) => api.delete(`/fee/structures/${id}`).then(r => r.data);

// ──────────────── Fee Demands ────────────────
export const getAllDemands = (params) => api.get('/fee/demands', { params }).then(r => r.data?.data || r.data || []);
export const getFeeDemands = (params) => getAllDemands(params);
export const generateDemand = (data) => api.post('/fee/demands/generate', data).then(r => r.data?.data || r.data);
export const generateBatchDemand = (data) => api.post('/fee/demands/raise-batch', data).then(r => r.data);
export const markDemandPaid = (id, data) => api.patch(`/fee/demands/${id}/paid`, data).then(r => r.data);

// ──────────────── Complaints ────────────────
export const getAllComplaints = (params) => api.get('/complaints', { params }).then(r => r.data?.data || r.data || []);
export const updateComplaintStatus = (id, data) => api.patch(`/complaints/${id}`, data).then(r => r.data);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`).then(r => r.data);

// ──────────────── User Management ────────────────
export const revokeUserSessions = (userId) => api.post(`/admin/users/${userId}/revoke-sessions`).then(r => r.data);

// ──────────────── Complaint Comments ────────────────
export const getComplaintComments = (id) => api.get(`/complaints/${id}/comments`).then(r => r.data?.data || r.data || []);
export const addComplaintComment = (id, data) => api.post(`/complaints/${id}/comments`, data).then(r => r.data?.data || r.data);

// ──────────────── Notices (Admin) ────────────────
export const getNotices = (params) => api.get('/notices', { params }).then(r => r.data?.data || r.data || []);
export const createNotice = (data) => api.post('/notices', data).then(r => r.data?.data || r.data);
export const updateNotice = (id, data) => api.patch(`/notices/${id}`, data).then(r => r.data?.data || r.data);
export const deleteNotice = (id) => api.delete(`/notices/${id}`).then(r => r.data);

// ──────────────── Courses list ────────────────
// Course controller: res.json({ data: courses_array })
// So axios r.data = { data: [...] }
export const listCourses = (params) => api.get('/courses', { params }).then(r => r.data?.data || r.data || []);
