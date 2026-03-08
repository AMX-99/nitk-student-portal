import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Avatar, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { useSortable, SortHeader, stagger, showToast } from '../../components/ui/animations';
import { motion } from 'framer-motion';

const avatarColors = ['var(--color-orange)', 'var(--color-blue)', 'var(--color-green)', 'var(--color-purple)', 'var(--color-amber)', 'var(--color-red)'];

export default function Teachers() {
  const { data: apiTeachers, loading, error, refetch } = useApi(adminApi.getTeachers);
  const { data: departments } = useApi(adminApi.listDepartments);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', employee_id: '',
    department_id: '', designation: 'Assistant Professor',
  });
  const [submitting, setSubmitting] = useState(false);

  const teachers = (apiTeachers || []).map((t, i) => {
    const name = t.name || '—';
    return {
      ...t, name,
      initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      dept: t.departments?.code || t.department_code || '—',
      designation: t.designation || 'Faculty',
      email: t.email || '—',
      status: t.is_active === false ? 'Inactive' : 'Active',
      color: avatarColors[i % avatarColors.length],
    };
  });

  const depts = ['All', ...new Set(teachers.map(t => t.dept).filter(d => d !== '—'))];

  const filtered = teachers.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || t.dept === deptFilter;
    return matchSearch && matchDept;
  });

  const { sorted, toggle, indicator } = useSortable(filtered, 'name', 'asc');

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', employee_id: '', department_id: '', designation: 'Assistant Professor' });
    setEditingTeacher(null);
  };

  const handleOpenAdd = () => { resetForm(); setModalOpen(true); };

  const handleOpenEdit = (t) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name, email: t.email, password: '',
      employee_id: t.employee_id || '', department_id: t.department_id || t.departments?.id || '',
      designation: t.designation || 'Assistant Professor',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTeacher) {
        const { password, email, ...updates } = formData;
        await adminApi.updateTeacher(editingTeacher.id, updates);
        showToast('Faculty updated', 'success');
      } else {
        await adminApi.createTeacher(formData);
        showToast('Faculty created', 'success');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Operation failed', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this faculty member?')) return;
    try { await adminApi.deleteTeacher(id); showToast('Faculty deactivated', 'success'); refetch(); }
    catch { showToast('Failed', 'error'); }
  };

  if (loading) return <LoadingState message="Loading teachers..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-3" variants={stagger.item}>
        <input type="text" placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none focus:border-orange transition-colors" />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3.5 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          {depts.map((d) => <option key={d} value={d}>{d === 'All' ? 'All Dept' : d}</option>)}
        </select>
        <Button variant="primary" small onClick={handleOpenAdd}>+ Add Faculty</Button>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">👨‍🏫 Faculty Records</h3><Badge variant="grey">{sorted.length} faculty</Badge></CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-[var(--bd1)]">
                <SortHeader sortKey="name" onSort={toggle} indicator={indicator}>Faculty</SortHeader>
                <SortHeader sortKey="dept" onSort={toggle} indicator={indicator}>Department</SortHeader>
                <SortHeader sortKey="designation" onSort={toggle} indicator={indicator}>Designation</SortHeader>
                <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Email</th>
                <SortHeader sortKey="status" onSort={toggle} indicator={indicator}>Status</SortHeader>
                <th className="bg-[var(--s3)] px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Actions</th>
              </tr></thead>
              <tbody>
                {sorted.map((t, i) => (
                  <motion.tr key={t.email + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-[var(--bd1)] hover:bg-[var(--s3)] transition-colors">
                    <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Avatar initials={t.initials} color={t.color} size="sm" /><span className="font-medium">{t.name}</span></div></td>
                    <td className="px-5 py-3"><Badge variant="blue">{t.dept}</Badge></td>
                    <td className="px-5 py-3 text-[var(--t2)]">{t.designation}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-[var(--t3)]">{t.email}</td>
                    <td className="px-5 py-3"><Badge variant={t.status === 'Active' ? 'green' : 'amber'}>{t.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(t)} className="text-blue hover:text-blue/80 font-medium text-[12px]">Edit</button>
                        <button onClick={() => handleDelete(t.id)} className="text-red hover:text-red/80 font-medium text-[12px]">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {sorted.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No faculty found</td></tr>}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTeacher ? 'Edit Faculty' : 'Add New Faculty'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Email</label>
              <input type="email" required disabled={!!editingTeacher} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange disabled:opacity-50" />
            </div>
            {!editingTeacher && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Password</label>
                <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Employee ID</label>
              <input type="text" required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})}
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
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Designation</label>
            <select value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
              <option>Assistant Professor</option><option>Associate Professor</option><option>Professor</option><option>HOD</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editingTeacher ? 'Update' : 'Create Faculty')}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
