import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion } from 'framer-motion';

export default function CoursesEnrollment() {
  const [tab, setTab] = useState('assignments');
  const { data: assignments, loading: aLoading, refetch: refetchA } = useApi(adminApi.getAssignments);
  const { data: enrollments, loading: eLoading, refetch: refetchE } = useApi(adminApi.listEnrollments);
  const { data: teachers } = useApi(adminApi.getTeachers);
  const { data: students } = useApi(adminApi.getStudents);
  const { data: courses } = useApi(adminApi.listCourses);
  const { data: departments } = useApi(adminApi.listDepartments);


  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('assignment');
  const [assignForm, setAssignForm] = useState({ teacher_id: '', course_id: '', academic_year: '2024-25', semester: 5, section: 'A' });
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: '', academic_year: '2024-25', semester: 5 });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAssignment = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await adminApi.createAssignment(assignForm);
      showToast('Teacher assigned to course', 'success');
      setModalOpen(false); refetchA();
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCreateEnrollment = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await adminApi.createEnrollment(enrollForm);
      showToast('Student enrolled', 'success');
      setModalOpen(false); refetchE();
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try { await adminApi.deleteAssignment(id); showToast('Removed', 'success'); refetchA(); }
    catch { showToast('Failed', 'error'); }
  };

  const handleDeleteEnrollment = async (id) => {
    if (!window.confirm('Remove this enrollment?')) return;
    try { await adminApi.deleteEnrollment(id); showToast('Removed', 'success'); refetchE(); }
    catch { showToast('Failed', 'error'); }
  };

  const loading = tab === 'assignments' ? aLoading : eLoading;
  const allAssignments = assignments || [];
  const allEnrollments = enrollments || [];
  const allTeachers = teachers || [];
  const allStudents = students || [];
  const allCourses = courses || [];

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <div className="flex gap-2">
          {['assignments', 'enrollments'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-[12px] font-semibold capitalize transition-all ${tab === t ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'}`}>
              {t === 'assignments' ? '👨‍🏫 Teacher-Course' : '🎓 Student Enrollment'}
            </button>
          ))}
        </div>
        <Button variant="primary" small onClick={() => { setModalType(tab === 'assignments' ? 'assignment' : 'enrollment'); setModalOpen(true); }}>
          + {tab === 'assignments' ? 'Assign Teacher' : 'Enroll Student'}
        </Button>
      </motion.div>

      {loading ? <LoadingState message="Loading..." /> : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <h3 className="font-display text-[15px] font-bold">{tab === 'assignments' ? '👨‍🏫 Teacher-Course Assignments' : '🎓 Student Enrollments'}</h3>
              <Badge variant="grey">{tab === 'assignments' ? allAssignments.length : allEnrollments.length} records</Badge>
            </CardHeader>
            <CardBody className="overflow-x-auto p-0!">
              <table className="w-full text-[13px]">
                <thead><tr className="border-b border-[var(--bd1)]">
                  {tab === 'assignments'
                    ? ['Teacher', 'Course', 'Year', 'Sem', 'Section', 'Actions'].map(h => <th key={h} className="bg-[var(--s3)] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>)
                    : ['Student', 'Course', 'Year', 'Semester', 'Actions'].map(h => <th key={h} className="bg-[var(--s3)] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>)
                  }
                </tr></thead>
                <tbody>
                  {tab === 'assignments' ? allAssignments.map((a, i) => {
                    const tName = Array.isArray(a.teachers) ? a.teachers[0]?.name : (a.teachers?.name || a.teacher?.name);
                    const cName = Array.isArray(a.courses) ? a.courses[0]?.name : (a.courses?.name || a.course?.name);
                    return (
                      <motion.tr key={a.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-[var(--bd1)] hover:bg-[var(--s3)] transition-colors">
                        <td className="px-4 py-3 font-medium">{tName || a.teacher_id}</td>
                        <td className="px-4 py-3">{cName || a.course_id}</td>
                        <td className="px-4 py-3 font-mono text-xs">{a.academic_year}</td>
                        <td className="px-4 py-3 font-mono text-xs">{a.semester}</td>
                        <td className="px-4 py-3">{a.section}</td>
                        <td className="px-4 py-3"><button onClick={() => handleDeleteAssignment(a.id)} className="text-red text-[12px] font-medium">Remove</button></td>
                      </motion.tr>
                    );
                  }) : allEnrollments.map((e, i) => {
                    const sName = Array.isArray(e.student) ? e.student[0]?.name : (e.student?.name || e.students?.name);
                    const cName = Array.isArray(e.course) ? e.course[0]?.name : (e.course?.name || e.courses?.name);
                    return (
                      <motion.tr key={e.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-[var(--bd1)] hover:bg-[var(--s3)] transition-colors">
                        <td className="px-4 py-3 font-medium">{sName || e.student_id}</td>
                        <td className="px-4 py-3">{cName || e.course_id}</td>
                        <td className="px-4 py-3 font-mono text-xs">{e.academic_year}</td>
                        <td className="px-4 py-3 font-mono text-xs">{e.semester}</td>
                        <td className="px-4 py-3"><button onClick={() => handleDeleteEnrollment(e.id)} className="text-red text-[12px] font-medium">Remove</button></td>
                      </motion.tr>
                    );
                  })}
                  {((tab === 'assignments' && allAssignments.length === 0) || (tab === 'enrollments' && allEnrollments.length === 0)) &&
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No records found</td></tr>
                  }
                </tbody>
              </table>
            </CardBody>
          </Card>
        </motion.div>
      )}

      <Modal isOpen={modalOpen && modalType === 'assignment'} onClose={() => setModalOpen(false)} title="Assign Teacher to Course">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Teacher</label>
            <select required value={assignForm.teacher_id} onChange={e => setAssignForm({...assignForm, teacher_id: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
              <option value="">Select Teacher</option>
              {allTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Course</label>
            <select required value={assignForm.course_id} onChange={e => setAssignForm({...assignForm, course_id: parseInt(e.target.value)})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
              <option value="">Select Course</option>
              {allCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Academic Year</label>
              <select value={assignForm.academic_year} onChange={e => setAssignForm({...assignForm, academic_year: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none"><option>2024-25</option><option>2023-24</option></select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Semester</label>
              <input type="number" required min="1" max="8" value={assignForm.semester} onChange={e => setAssignForm({...assignForm, semester: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Section</label>
              <input type="text" maxLength={1} value={assignForm.section} onChange={e => setAssignForm({...assignForm, section: e.target.value.toUpperCase()})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Assigning...' : 'Assign'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalOpen && modalType === 'enrollment'} onClose={() => setModalOpen(false)} title="Enroll Student in Course">
        <form onSubmit={handleCreateEnrollment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Student</label>
            <select required value={enrollForm.student_id} onChange={e => setEnrollForm({...enrollForm, student_id: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
              <option value="">Select Student</option>
              {allStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Course</label>
            <select required value={enrollForm.course_id} onChange={e => setEnrollForm({...enrollForm, course_id: parseInt(e.target.value)})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
              <option value="">Select Course</option>
              {allCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Academic Year</label>
              <select value={enrollForm.academic_year} onChange={e => setEnrollForm({...enrollForm, academic_year: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none"><option>2024-25</option><option>2023-24</option></select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Semester</label>
              <input type="number" required min="1" max="8" value={enrollForm.semester} onChange={e => setEnrollForm({...enrollForm, semester: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Enrolling...' : 'Enroll'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
