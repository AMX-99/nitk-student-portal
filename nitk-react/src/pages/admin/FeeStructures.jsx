import { useState, useEffect } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, Button, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion } from 'framer-motion';

export default function FeeStructures() {
  const [selectedSem, setSelectedSem] = useState(5);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const { data: apiStructures, loading, error, refetch } = useApi(
    () => adminApi.getFeeStructures({ semester: selectedSem, academic_year: academicYear }), [selectedSem, academicYear]
  );
  const { data: departments } = useApi(adminApi.listDepartments);
  const [editMode, setEditMode] = useState(false);
  const [localStructures, setLocalStructures] = useState([]);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    department_id: '', academic_year: '2024-25', semester: 5,
    amount: '', student_category: '', batch_year: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (apiStructures) setLocalStructures(apiStructures); }, [apiStructures]);

  const totalFees = localStructures.reduce((s, f) => s + (f.amount || 0), 0);

  const handleAmountChange = (id, newAmount) => {
    setLocalStructures(prev => prev.map(s => s.id === id ? { ...s, amount: parseFloat(newAmount) || 0 } : s));
  };

  const handleSave = async () => {
    try {
      const changed = localStructures.filter((s, i) => apiStructures[i] && s.amount !== apiStructures[i].amount);
      if (changed.length === 0) { setEditMode(false); return; }
      await Promise.all(changed.map(s => adminApi.updateFeeStructure(s.id, { amount: s.amount })));
      showToast(`${changed.length} fee structure(s) updated!`, 'success');
      setEditMode(false);
      refetch();
    } catch { showToast('Failed to save changes', 'error'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    const payload = { ...createData, semester: selectedSem, academic_year: academicYear };
    if (!payload.department_id) delete payload.department_id;
    if (!payload.student_category) delete payload.student_category;
    if (!payload.batch_year) delete payload.batch_year;
    else payload.batch_year = parseInt(payload.batch_year);
    payload.amount = parseFloat(payload.amount);
    try {
      await adminApi.createFeeStructure(payload);
      showToast('Fee structure created', 'success');
      setCreateOpen(false); refetch();
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this fee structure?')) return;
    try { await adminApi.deleteFeeStructure(id); showToast('Fee structure deactivated', 'success'); refetch(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  if (loading && !localStructures.length) return <LoadingState message="Loading fee structures..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-3 gap-4" variants={stagger.item}>
        <StatCard label="Structures" value={String(localStructures.length)} sub={`Sem ${selectedSem} · ${academicYear}`} color="var(--color-blue)" delay={0} />
        <StatCard label="Total Fees" value={`₹${totalFees.toLocaleString('en-IN')}`} sub="Per student" color="var(--color-green)" delay={0.05} />
        <StatCard label="Departments" value={String(departments?.length || 0)} sub="Active departments" color="var(--color-amber)" delay={0.1} />
      </motion.div>

      <motion.div className="flex items-center gap-4" variants={stagger.item}>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setSelectedSem(s)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${selectedSem === s ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'}`}>
              Sem {s}
            </motion.button>
          ))}
        </div>
        <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3 py-1.5 font-body text-[12px] text-[var(--t1)] outline-none">
          <option>2024-25</option><option>2023-24</option>
        </select>
        <div className="flex-1" />
        <Button variant="ghost" small onClick={() => setCreateOpen(true)}>+ Add Structure</Button>
        <Button variant={editMode ? 'success' : 'primary'} small onClick={() => { if (editMode) handleSave(); else setEditMode(true); }}>
          {editMode ? '✓ Save Changes' : '✏️ Edit Amounts'}
        </Button>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-5" variants={stagger.item}>
        {localStructures.length > 0 ? (
          localStructures.map((s, ci) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.08, type: 'spring', damping: 22 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <motion.span className="h-3 w-3 rounded-sm bg-blue" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: ci * 0.08 + 0.2, type: 'spring' }} />
                    <h3 className="font-display text-[15px] font-bold">{s.fee_categories?.name || 'Fee Category'}</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="blue">{s.departments?.name || 'All Dept'}</Badge>
                    {s.student_category && <Badge variant="grey">{s.student_category}</Badge>}
                  </div>
                </CardHeader>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-[var(--t2)]">Academic Year</span>
                    <span className="text-[13px] font-medium">{s.academic_year}</span>
                  </div>
                  {s.batch_year && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-[var(--t2)]">Batch</span>
                      <span className="text-[13px] font-medium">{s.batch_year}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-t border-[var(--bd1)]">
                    <span className="text-[14px] font-medium">Base Amount</span>
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]">₹</span>
                        <input type="number" value={s.amount} onChange={(e) => handleAmountChange(s.id, e.target.value)}
                          className="w-[120px] rounded-md border border-orange bg-[var(--s4)] px-3 py-1.5 text-right font-mono text-[14px] text-[var(--t1)] outline-none" />
                      </div>
                    ) : (
                      <span className="font-mono text-lg font-bold">₹{(s.amount || 0).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--t3)] italic">
                      {s.is_active === false ? '🔴 Deactivated' : '🟢 Active'}
                    </span>
                    <button onClick={() => handleDelete(s.id)}
                      className="text-[11px] text-red font-medium hover:underline">Deactivate</button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center text-[var(--t3)] bg-[var(--s2)] rounded-xl border border-dashed border-[var(--bd1)]">
            No fee structures found for Sem {selectedSem} ({academicYear})
          </div>
        )}
      </motion.div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Fee Structure">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Department</label>
              <select value={createData.department_id} onChange={e => setCreateData({...createData, department_id: e.target.value ? parseInt(e.target.value) : ''})}>
                <option value="">All Departments</option>
                {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Amount (₹)</label>
              <input type="number" required min="0" value={createData.amount} onChange={e => setCreateData({...createData, amount: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Student Category</label>
              <select value={createData.student_category} onChange={e => setCreateData({...createData, student_category: e.target.value})}>
                <option value="">All Categories</option>
                <option>General</option><option>OBC</option><option>OBC_NCL</option><option>SC</option><option>ST</option><option>EWS</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Batch Year (optional)</label>
              <input type="number" value={createData.batch_year} onChange={e => setCreateData({...createData, batch_year: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange"
                placeholder="e.g. 2023" />
            </div>
          </div>
          <p className="text-[11px] text-[var(--t3)]">This will create a fee structure for Sem {selectedSem}, {academicYear}.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
