import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion } from 'framer-motion';

export default function Departments() {
  const { data: departments, loading, error, refetch } = useApi(adminApi.listDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', hod_name: '' });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => { setFormData({ name: '', code: '', hod_name: '' }); setEditing(null); };
  const handleOpenAdd = () => { resetForm(); setModalOpen(true); };
  const handleOpenEdit = (d) => {
    setEditing(d);
    setFormData({ name: d.name, code: d.code, hod_name: d.hod_name || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await adminApi.updateDepartment(editing.id, formData);
        showToast('Department updated', 'success');
      } else {
        await adminApi.createDepartment(formData);
        showToast('Department created', 'success');
      }
      setModalOpen(false); refetch();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? This will fail if students, teachers, or courses are still linked.')) return;
    try { await adminApi.deleteDepartment(id); showToast('Department deleted', 'success'); refetch(); }
    catch (err) { showToast(err.response?.data?.error || 'Cannot delete — has linked records', 'error'); }
  };

  if (loading) return <LoadingState message="Loading departments..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const allDepts = departments || [];

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <div><h2 className="font-display text-xl font-bold">Departments</h2><p className="text-[13px] text-[var(--t2)]">Manage academic departments</p></div>
        <Button variant="primary" small onClick={handleOpenAdd}>+ Add Department</Button>
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={stagger.item}>
        {allDepts.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardHeader>
                <h3 className="font-display text-[15px] font-bold">{d.code}</h3>
                <Badge variant="blue">{d.id}</Badge>
              </CardHeader>
              <CardBody>
                <p className="text-[13px] font-medium">{d.name}</p>
                {d.hod_name && <p className="mt-1 text-[12px] text-[var(--t3)]">HOD: {d.hod_name}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleOpenEdit(d)} className="text-[12px] text-blue font-medium hover:underline">Edit</button>
                  <button onClick={() => handleDelete(d.id)} className="text-[12px] text-red font-medium hover:underline">Delete</button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
        {allDepts.length === 0 && <p className="col-span-3 py-12 text-center text-[var(--t3)]">No departments found</p>}
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Department Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" placeholder="Computer Science & Engineering" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Code</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" placeholder="CSE" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">HOD Name</label>
              <input type="text" value={formData.hod_name} onChange={e => setFormData({...formData, hod_name: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" placeholder="Dr. Sharma" />
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
