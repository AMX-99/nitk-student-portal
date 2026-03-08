import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayColors = { Monday: 'blue', Tuesday: 'green', Wednesday: 'amber', Thursday: 'orange', Friday: 'purple', Saturday: 'grey' };

export default function AdminTimetable() {
  const { data: apiSlots, loading, error, refetch } = useApi(adminApi.getTimetableSlots);
  const { data: courses } = useApi(adminApi.listCourses);
  const { data: departments } = useApi(adminApi.listDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '', day_of_week: 0, start_time: '09:00', end_time: '10:00',
    room: '', department_id: '', semester: 5, section: 'A', academic_year: '2024-25', slot_type: 'lecture',
  });
  const [submitting, setSubmitting] = useState(false);

  const slots = (apiSlots || []).map(s => {
    // Backend stores day_of_week as integer 0-5
    const dayIdx = typeof s.day_of_week === 'number' ? s.day_of_week : DAYS.indexOf(s.day_of_week);
    return {
      ...s,
      day_of_week: dayIdx,
      dayName: DAYS[dayIdx] || 'Unknown',
      courseName: s.courses?.name || s.course?.name || s.course_id,
      courseCode: s.courses?.code || s.course?.code || '',
      deptCode: s.departments?.code || '',
    };
  });

  const resetForm = () => {
    setFormData({ course_id: '', day_of_week: 0, start_time: '09:00', end_time: '10:00', room: '', department_id: '', semester: 5, section: 'A', academic_year: '2024-25', slot_type: 'lecture' });
    setEditing(null);
  };
  const handleOpenAdd = () => { resetForm(); setModalOpen(true); };
  const handleOpenEdit = (s) => {
    setEditing(s);
    setFormData({
      course_id: s.course_id, day_of_week: s.day_of_week ?? 0,
      start_time: s.start_time || '09:00', end_time: s.end_time || '10:00',
      room: s.room || '', department_id: s.department_id || '', semester: s.semester || 5,
      section: s.section || 'A', academic_year: s.academic_year || '2024-25', slot_type: s.slot_type || 'lecture',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editing) { await adminApi.updateTimetableSlot(editing.id, formData); showToast('Slot updated', 'success'); }
      else { await adminApi.createTimetableSlot(formData); showToast('Slot created', 'success'); }
      setModalOpen(false); refetch();
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try { await adminApi.deleteTimetableSlot(id); showToast('Slot deleted', 'success'); refetch(); }
    catch { showToast('Failed', 'error'); }
  };

  if (loading) return <LoadingState message="Loading timetable..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // Group by day
  const byDay = {};
  DAYS.forEach((d, i) => byDay[i] = []);
  slots.forEach(s => { if (byDay[s.day_of_week] !== undefined) byDay[s.day_of_week].push(s); });

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <div><h2 className="font-display text-xl font-bold">Timetable Manager</h2><p className="text-[13px] text-[var(--t2)]">Manage weekly class schedule</p></div>
        <Button variant="primary" small onClick={handleOpenAdd}>+ Add Slot</Button>
      </motion.div>

      {DAYS.map((day, di) => {
        const daySlots = byDay[di] || [];
        if (daySlots.length === 0) return null;
        return (
          <motion.div key={day} variants={stagger.item} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.05 }}>
            <Card>
              <CardHeader><h3 className="font-display text-[15px] font-bold">{day}</h3><Badge variant={dayColors[day]}>{daySlots.length} slots</Badge></CardHeader>
              <CardBody className="p-0!">
                <div className="divide-y divide-[var(--bd1)]">
                  {daySlots.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).map((s, i) => (
                    <div key={s.id || i} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--s3)] transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[12px] text-[var(--t3)] w-24">{s.start_time} – {s.end_time}</span>
                        <div>
                          <span className="font-medium text-[13px]">{s.courseCode} </span>
                          <span className="text-[12px] text-[var(--t2)]">{s.courseName}</span>
                        </div>
                        <Badge variant={s.slot_type === 'lab' ? 'purple' : s.slot_type === 'tutorial' ? 'green' : 'blue'}>{s.slot_type}</Badge>
                        {s.room && <span className="text-[11px] text-[var(--t3)] font-mono">📍 {s.room}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenEdit(s)} className="text-blue text-[12px] font-medium">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="text-red text-[12px] font-medium">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
      {slots.length === 0 && <Card><CardBody><p className="py-8 text-center text-[var(--t3)]">No timetable slots. Click "+ Add Slot" to start building the schedule.</p></CardBody></Card>}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Timetable Slot' : 'Add Timetable Slot'}>
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
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Day</label>
              <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Slot Type</label>
              <select value={formData.slot_type} onChange={e => setFormData({...formData, slot_type: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                <option value="lecture">Lecture</option><option value="lab">Lab</option><option value="tutorial">Tutorial</option>
              </select>
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
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Department</label>
              <select value={formData.department_id} onChange={e => setFormData({...formData, department_id: parseInt(e.target.value) || ''})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                <option value="">All</option>
                {(departments || []).map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Semester</label>
              <input type="number" min="1" max="8" value={formData.semester} onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Section</label>
              <input type="text" maxLength={1} value={formData.section} onChange={e => setFormData({...formData, section: e.target.value.toUpperCase()})}
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
