import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Avatar, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { useSortable, SortHeader, stagger, showToast } from '../../components/ui/animations';
import { motion } from 'framer-motion';

const avatarColors = ['var(--color-orange)', 'var(--color-blue)', 'var(--color-green)', 'var(--color-purple)', 'var(--color-amber)', 'var(--color-red)'];

export default function Students() {
  const { data: apiStudents, loading, error, refetch } = useApi(adminApi.getStudents);
  const { data: departments } = useApi(adminApi.listDepartments);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', roll_no: '',
    department_id: '', batch_year: new Date().getFullYear(),
    current_semester: 1, section: 'A', student_category: 'General',
  });
  const [submitting, setSubmitting] = useState(false);

  const students = (apiStudents || []).map((s, i) => {
    const name = s.name || '—';
    return {
      ...s, name,
      roll: s.roll_no || '—',
      dept: s.departments?.code || s.department_code || '—',
      batch: s.batch_year || '—',
      sem: s.current_semester || '—',
      category: s.student_category || 'General',
      status: s.is_active === false ? 'Inactive' : 'Active',
      initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: avatarColors[i % avatarColors.length],
    };
  });

  const depts = ['All', ...new Set(students.map(s => s.dept).filter(d => d !== '—'))];
  const batches = ['All', ...new Set(students.map(s => String(s.batch)).filter(b => b !== '—'))];

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.dept === deptFilter;
    const matchBatch = batchFilter === 'All' || String(s.batch) === batchFilter;
    return matchSearch && matchDept && matchBatch;
  });

  const { sorted, toggle, indicator } = useSortable(filtered, 'name', 'asc');

  const resetForm = () => {
    setFormData({
      name: '', email: '', password: '', roll_no: '',
      department_id: '', batch_year: new Date().getFullYear(),
      current_semester: 1, section: 'A', student_category: 'General',
    });
    setEditingStudent(null);
  };

  const handleOpenAdd = () => { resetForm(); setModalOpen(true); };

  const handleOpenEdit = (s) => {
    setEditingStudent(s);
    setFormData({
      name: s.name, email: s.email, password: '',
      roll_no: s.roll_no, department_id: s.department_id || s.departments?.id || '',
      batch_year: s.batch_year, current_semester: s.current_semester,
      section: s.section || 'A', student_category: s.student_category || 'General',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        const { password, email, ...updates } = formData;
        await adminApi.updateStudent(editingStudent.id, updates);
        showToast('Student updated', 'success');
      } else {
        await adminApi.createStudent(formData);
        showToast('Student created', 'success');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Operation failed', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    try { await adminApi.deleteStudent(id); showToast('Student deactivated', 'success'); refetch(); }
    catch { showToast('Failed', 'error'); }
  };

  if (loading) return <LoadingState message="Loading students..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-3" variants={stagger.item}>
        <input type="text" placeholder="Search by name or roll no..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none focus:border-orange transition-colors" />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3.5 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          {depts.map((d) => <option key={d} value={d}>{d === 'All' ? 'All Dept' : d}</option>)}
        </select>
        <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3.5 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          {batches.map((b) => <option key={b} value={b}>{b === 'All' ? 'All Batches' : b}</option>)}
        </select>
        <Button variant="primary" small onClick={handleOpenAdd}>+ Add Student</Button>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">🎓 Student Records</h3><Badge variant="grey">{sorted.length} students</Badge></CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-[var(--bd1)]">
                <SortHeader sortKey="name" onSort={toggle} indicator={indicator}>Student</SortHeader>
                <SortHeader sortKey="roll" onSort={toggle} indicator={indicator}>Roll No.</SortHeader>
                <SortHeader sortKey="dept" onSort={toggle} indicator={indicator}>Dept</SortHeader>
                <SortHeader sortKey="batch" onSort={toggle} indicator={indicator}>Batch</SortHeader>
                <SortHeader sortKey="sem" onSort={toggle} indicator={indicator}>Sem</SortHeader>
                <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Category</th>
                <SortHeader sortKey="status" onSort={toggle} indicator={indicator}>Status</SortHeader>
                <th className="bg-[var(--s3)] px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Actions</th>
              </tr></thead>
              <tbody>
                {sorted.map((s, i) => (
                  <motion.tr key={s.roll + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className={`border-b border-[var(--bd1)] hover:bg-[var(--s3)] transition-colors ${s.status === 'Inactive' ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Avatar initials={s.initials} color={s.color} size="sm" /><span className="font-medium">{s.name}</span></div></td>
                    <td className="px-5 py-3 font-mono text-xs">{s.roll}</td>
                    <td className="px-5 py-3"><Badge variant="blue">{s.dept}</Badge></td>
                    <td className="px-5 py-3 font-mono text-xs">{s.batch}</td>
                    <td className="px-5 py-3 font-mono text-xs">{s.sem}</td>
                    <td className="px-5 py-3"><Badge variant="grey">{s.category}</Badge></td>
                    <td className="px-5 py-3"><Badge variant={s.status === 'Active' ? 'green' : 'red'}>{s.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(s)} className="text-blue hover:text-blue/80 font-medium text-[12px]">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="text-red hover:text-red/80 font-medium text-[12px]">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {sorted.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No students found</td></tr>}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add New Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Email</label>
              <input type="email" required disabled={!!editingStudent} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange disabled:opacity-50" />
            </div>
            {!editingStudent && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Password</label>
                <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Roll No.</label>
              <input type="text" required value={formData.roll_no} onChange={e => setFormData({...formData, roll_no: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Department</label>
              <select required value={formData.department_id} onChange={e => setFormData({...formData, department_id: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                <option value="">Select Dept</option>
                {departments?.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Batch</label>
              <input type="number" required value={formData.batch_year} onChange={e => setFormData({...formData, batch_year: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Semester</label>
              <input type="number" required min="1" max="8" value={formData.current_semester} onChange={e => setFormData({...formData, current_semester: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Section</label>
              <input type="text" required maxLength={1} value={formData.section} onChange={e => setFormData({...formData, section: e.target.value.toUpperCase()})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Category</label>
              <select value={formData.student_category} onChange={e => setFormData({...formData, student_category: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                <option>General</option><option>OBC</option><option>OBC_NCL</option><option>SC</option><option>ST</option><option>EWS</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editingStudent ? 'Update' : 'Create Student')}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
