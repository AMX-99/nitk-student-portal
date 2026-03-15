import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { useSortable, SortHeader, stagger, showToast } from '../../components/ui/animations';
import { motion } from 'framer-motion';

export default function AdminExams() {
  const { data: apiExams, loading, error, refetch } = useApi(adminApi.getExams);
  const { data: courses } = useApi(adminApi.listCourses);
  const { data: departments } = useApi(adminApi.listDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '', exam_type: 'mid_sem', exam_date: '', start_time: '09:00', end_time: '12:00',
    room: '', academic_year: '2024-25', semester: 5, max_marks: 100, section: 'A',
  });
  const [submitting, setSubmitting] = useState(false);

  const exams = (apiExams || []).map(e => ({
    ...e,
    courseName: e.course?.name || e.courses?.name || e.course_id,
    courseCode: e.course?.code || e.courses?.code || '',
  }));

  const { sorted, toggle, indicator } = useSortable(exams, 'exam_date', 'asc');

  const resetForm = () => {
    setFormData({ course_id: '', exam_type: 'mid_sem', exam_date: '', start_time: '09:00', end_time: '12:00', room: '', academic_year: '2024-25', semester: 5, max_marks: 100, section: 'A' });
    setEditing(null);
  };

  const handleOpenAdd = () => { resetForm(); setModalOpen(true); };
  const handleOpenEdit = (e) => {
    setEditing(e);
    setFormData({
      course_id: e.course_id, exam_type: e.exam_type || 'mid_sem',
      exam_date: e.exam_date?.split('T')[0] || '', start_time: e.start_time || '09:00', end_time: e.end_time || '12:00',
      room: e.room || '', academic_year: e.academic_year || '2024-25', semester: e.semester || 5, max_marks: e.max_marks || 100,
      section: e.section || 'A',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editing) { await adminApi.updateExam(editing.id, formData); showToast('Exam updated', 'success'); }
      else { await adminApi.createExam(formData); showToast('Exam created', 'success'); }
      setModalOpen(false); refetch();
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try { await adminApi.deleteExam(id); showToast('Exam deleted', 'success'); refetch(); }
    catch { showToast('Failed', 'error'); }
  };

  const typeLabels = { mid_sem: 'Mid-Sem', end_sem: 'End-Sem', quiz: 'Quiz', lab: 'Lab', viva: 'Viva' };
  const typeColors = { mid_sem: 'amber', end_sem: 'blue', quiz: 'green', lab: 'purple', viva: 'orange' };

  if (loading) return <LoadingState message="Loading exams..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <div><h2 className="font-display text-xl font-bold">Exam Schedule</h2><p className="text-[13px] text-[var(--t2)]">Manage all exam schedules</p></div>
        <Button variant="primary" small onClick={handleOpenAdd}>+ Add Exam</Button>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">📝 All Exams</h3><Badge variant="grey">{sorted.length} exams</Badge></CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-[var(--bd1)]">
                {['Course', 'Type', 'Date', 'Time', 'Room', 'Max Marks', 'Actions'].map(h =>
                  <th key={h} className="bg-[var(--s3)] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>
                )}
              </tr></thead>
              <tbody>
                {sorted.map((e, i) => (
                  <motion.tr key={e.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--bd1)] hover:bg-[var(--s3)] transition-colors">
                    <td className="px-4 py-3"><span className="font-medium">{e.courseCode}</span> <span className="text-[var(--t3)] text-[11px]">{e.courseName}</span></td>
                    <td className="px-4 py-3"><Badge variant={typeColors[e.exam_type] || 'grey'}>{typeLabels[e.exam_type] || e.exam_type}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs">{e.exam_date ? new Date(e.exam_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.start_time || '—'} – {e.end_time || '—'}</td>
                    <td className="px-4 py-3">{e.room || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.max_marks}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenEdit(e)} className="text-blue text-[12px] font-medium">Edit</button>
                        <button onClick={() => handleDelete(e.id)} className="text-red text-[12px] font-medium">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {sorted.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No exams scheduled</td></tr>}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Exam' : 'Schedule Exam'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Course</label>
            <select required value={formData.course_id} onChange={e => setFormData({...formData, course_id: parseInt(e.target.value)})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
              <option value="">Select Course</option>
              {(courses || []).map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Exam Type</label>
              <select value={formData.exam_type} onChange={e => setFormData({...formData, exam_type: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                <option value="mid_sem">Mid-Sem</option><option value="end_sem">End-Sem</option><option value="quiz">Quiz</option><option value="lab">Lab</option><option value="viva">Viva</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Date</label>
              <input type="date" required value={formData.exam_date} onChange={e => setFormData({...formData, exam_date: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Start Time</label>
              <input type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">End Time</label>
              <input type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Room</label>
              <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" placeholder="LH-301" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Academic Year</label>
              <select value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none"><option>2024-25</option><option>2023-24</option></select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Semester</label>
              <input type="number" min="1" max="8" value={formData.semester} onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Max Marks</label>
              <input type="number" min="1" value={formData.max_marks} onChange={e => setFormData({...formData, max_marks: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
