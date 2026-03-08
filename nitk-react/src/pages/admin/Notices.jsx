import { useState } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, Button, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

const priorityVariant = { high: 'red', normal: 'blue', low: 'grey' };

export default function AdminNotices() {
  const { data: notices, loading, error, refetch } = useApi(adminApi.getNotices);
  const { data: departments } = useApi(adminApi.listDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', body: '', priority: 'normal', is_pinned: false,
    target_department_id: '', target_semester: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const allNotices = notices || [];
  const pinnedCount = allNotices.filter(n => n.is_pinned).length;
  const highCount = allNotices.filter(n => n.priority === 'high').length;

  const resetForm = () => {
    setFormData({ title: '', body: '', priority: 'normal', is_pinned: false, target_department_id: '', target_semester: '' });
    setEditing(null);
  };

  const handleOpenAdd = () => { resetForm(); setModalOpen(true); };
  const handleOpenEdit = (n) => {
    setEditing(n);
    setFormData({
      title: n.title || '', body: n.body || '', priority: n.priority || 'normal',
      is_pinned: n.is_pinned || false, target_department_id: n.target_department_id || '',
      target_semester: n.target_semester || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    const payload = { ...formData };
    if (!payload.target_department_id) delete payload.target_department_id;
    if (!payload.target_semester) delete payload.target_semester;
    try {
      if (editing) {
        await adminApi.updateNotice(editing.id, payload);
        showToast('Notice updated', 'success');
      } else {
        await adminApi.createNotice(payload);
        showToast('Notice published', 'success');
      }
      setModalOpen(false); refetch();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice permanently?')) return;
    try { await adminApi.deleteNotice(id); showToast('Notice deleted', 'success'); refetch(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const handleTogglePin = async (n) => {
    try {
      await adminApi.updateNotice(n.id, { is_pinned: !n.is_pinned });
      showToast(n.is_pinned ? 'Unpinned' : 'Pinned', 'success');
      refetch();
    } catch { showToast('Failed', 'error'); }
  };

  if (loading) return <LoadingState message="Loading notices..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-3 gap-4" variants={stagger.item}>
        <StatCard label="Total Notices" value={String(allNotices.length)} sub="Published" color="var(--color-blue)" delay={0} />
        <StatCard label="Pinned" value={String(pinnedCount)} sub="Shown at top" color="var(--color-amber)" delay={0.05} />
        <StatCard label="High Priority" value={String(highCount)} sub="Urgent" color="var(--color-red)" delay={0.1} />
      </motion.div>

      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <h2 className="font-display text-xl font-bold">📢 Notice Board</h2>
        <Button variant="primary" small onClick={handleOpenAdd}>+ Post Notice</Button>
      </motion.div>

      <motion.div className="space-y-3" variants={stagger.item}>
        {allNotices.length === 0 && (
          <Card><CardBody><p className="py-8 text-center text-[var(--t3)]">No notices posted yet</p></CardBody></Card>
        )}
        {allNotices.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className={n.is_pinned ? 'border-amber/30!' : ''}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}>
                    <div className="flex items-center gap-2.5 mb-1">
                      {n.is_pinned && <span className="text-xs">📌</span>}
                      <h3 className="font-display text-[15px] font-bold">{n.title}</h3>
                      <Badge variant={priorityVariant[n.priority] || 'blue'}>{n.priority}</Badge>
                      {n.author_name && <span className="text-[11px] text-[var(--t3)]">by {n.author_name}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--t3)]">
                      {n.target_department_id && <span>Dept #{n.target_department_id}</span>}
                      {n.target_semester && <span>Sem {n.target_semester}</span>}
                      <span>{n.created_at ? new Date(n.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handleTogglePin(n)}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${n.is_pinned ? 'bg-amber/15 text-amber hover:bg-amber/25' : 'bg-[var(--s4)] text-[var(--t3)] hover:bg-[var(--s5)]'}`}>
                      {n.is_pinned ? '📌 Unpin' : '📌 Pin'}
                    </button>
                    <button onClick={() => handleOpenEdit(n)}
                      className="rounded-md bg-blue/10 px-2.5 py-1.5 text-[11px] font-semibold text-blue hover:bg-blue/20 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(n.id)}
                      className="rounded-md bg-red/10 px-2.5 py-1.5 text-[11px] font-semibold text-red hover:bg-red/20 transition-colors">Delete</button>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedId === n.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-3 overflow-hidden border-t border-[var(--bd1)] pt-3">
                      <p className="text-[13px] text-[var(--t2)] whitespace-pre-wrap">{n.body}</p>
                      {n.expires_at && (
                        <p className="mt-2 text-[11px] text-[var(--t3)]">Expires: {new Date(n.expires_at).toLocaleDateString()}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Notice' : 'Post Notice'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Body</label>
            <textarea required rows={5} value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Target Dept</label>
              <select value={formData.target_department_id} onChange={e => setFormData({...formData, target_department_id: e.target.value ? parseInt(e.target.value) : ''})}>
                <option value="">All Departments</option>
                {(departments || []).map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Target Semester</label>
              <select value={formData.target_semester} onChange={e => setFormData({...formData, target_semester: e.target.value ? parseInt(e.target.value) : ''})}>
                <option value="">All</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pinCheck" checked={formData.is_pinned} onChange={e => setFormData({...formData, is_pinned: e.target.checked})} />
            <label htmlFor="pinCheck" className="text-[12px] text-[var(--t2)]">📌 Pin this notice</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editing ? 'Update' : 'Publish')}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
