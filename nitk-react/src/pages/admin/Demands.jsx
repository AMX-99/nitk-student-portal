import { useState } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, Button, ProgressBar, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

export default function Demands() {
  const { data: apiDemands, loading, error, refetch } = useApi(adminApi.getFeeDemands);
  const { data: students } = useApi(adminApi.getStudents);
  const { data: departments } = useApi(adminApi.listDepartments);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  // Individual demand modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '', academic_year: '2024-25', semester: 1
  });
  const [submitting, setSubmitting] = useState(false);

  // Batch generate modal
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchData, setBatchData] = useState({
    department_id: '', batch_year: new Date().getFullYear(), semester: 5, academic_year: '2024-25'
  });
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const demands = (apiDemands || []).map(d => ({
    id: d.id || d.demand_id || '—',
    studentName: d.students?.name || '—',
    studentRoll: d.students?.roll_no || '—',
    batch: d.academic_year || '—',
    dept: d.students?.department?.code || '—',
    sem: d.semester || '—',
    amount: d.total_amount || 0,
    breakdown: d.breakdown || [],
    generated: d.created_at ? new Date(d.created_at).toLocaleDateString() : '—',
    due: d.due_date ? new Date(d.due_date).toLocaleDateString() : '—',
    status: d.status || 'Active',
    notes: d.notes || '',
  }));

  const filtered = demands.filter((d) => filter === 'All' || d.status.toLowerCase() === filter.toLowerCase());
  const activeCount = demands.filter((d) => d.status.toLowerCase() === 'active' || d.status.toLowerCase() === 'pending').length;
  const paidCount = demands.filter((d) => d.status.toLowerCase() === 'paid').length;
  const totalCollected = demands.reduce((acc, d) => acc + (d.status.toLowerCase() === 'paid' ? d.amount : 0), 0);
  const totalPending = demands.reduce((acc, d) => acc + (d.status.toLowerCase() !== 'paid' ? d.amount : 0), 0);

  const handleGenerate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await adminApi.generateDemand(formData);
      showToast('Fee demand generated!', 'success');
      setModalOpen(false); refetch();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate demand', 'error');
    } finally { setSubmitting(false); }
  };

  const handleBatchGenerate = async (e) => {
    e.preventDefault(); setBatchSubmitting(true);
    try {
      const result = await adminApi.generateBatchDemand(batchData);
      const count = result?.count || result?.data?.length || 'Multiple';
      showToast(`${count} demands generated for batch!`, 'success');
      setBatchOpen(false); refetch();
    } catch (err) {
      showToast(err.response?.data?.error || 'Batch generation failed', 'error');
    } finally { setBatchSubmitting(false); }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this demand as paid?')) return;
    try {
      await adminApi.markDemandPaid(id, { notes: 'Paid via Admin Cash Desk' });
      showToast('Demand marked as paid', 'success');
      refetch();
    } catch { showToast('Failed to mark as paid', 'error'); }
  };

  if (loading) return <LoadingState message="Loading demands..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Total Demands" value={String(demands.length)} sub="All semesters" color="var(--color-blue)" delay={0} />
        <StatCard label="Pending" value={String(activeCount)} sub="Active demands" color="var(--color-amber)" delay={0.05} />
        <StatCard label="Paid" value={String(paidCount)} sub="Completed" color="var(--color-green)" delay={0.1} />
        <StatCard label="Collected" value={`₹${(totalCollected / 100000).toFixed(1)}L`} sub={`₹${(totalPending / 100000).toFixed(1)}L pending`} color="var(--color-blue)" delay={0.15} />
      </motion.div>

      {/* Collection progress bar */}
      <motion.div variants={stagger.item}>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium">Collection Progress</span>
              <span className="font-mono text-[12px] text-[var(--t2)]">
                {totalCollected + totalPending > 0
                  ? `${Math.round(totalCollected / (totalCollected + totalPending) * 100)}%`
                  : '—'}
              </span>
            </div>
            <ProgressBar
              value={totalCollected + totalPending > 0 ? Math.round(totalCollected / (totalCollected + totalPending) * 100) : 0}
              color="var(--color-green)"
            />
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="flex items-center gap-3" variants={stagger.item}>
        <div className="flex gap-1.5">
          {['All', 'Active', 'Paid', 'Overdue'].map((s) => (
            <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setFilter(s)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-[11.5px] font-semibold transition-all ${filter === s ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'}`}>{s}</motion.button>
          ))}
        </div>
        <div className="flex-1" />
        <Button variant="primary" small onClick={() => setModalOpen(true)}>+ Generate Demand</Button>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">📄 Payment Demands</h3><Badge variant="grey">{filtered.length} records</Badge></CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--bd1)]">
                  {['Student', 'Roll No', 'Batch', 'Sem', 'Amount', 'Due Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="bg-[var(--s3)] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <motion.tr key={d.id + '-' + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-[var(--bd1)] transition-colors hover:bg-[var(--s3)]">
                    <td className="px-4 py-3 font-medium">{d.studentName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.studentRoll}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.batch}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.sem}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                        className="font-mono text-xs font-semibold text-blue hover:underline cursor-pointer">
                        ₹{(d.amount / 1000).toFixed(1)}K ▾
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--t2)]">{d.due}</td>
                    <td className="px-4 py-3"><Badge variant={d.status.toLowerCase() === 'paid' ? 'green' : d.status.toLowerCase() === 'overdue' ? 'red' : 'amber'}>{d.status}</Badge></td>
                    <td className="px-4 py-3">
                      {d.status.toLowerCase() !== 'paid' && (
                        <button onClick={() => handleMarkPaid(d.id)} className="text-blue hover:text-blue/80 font-medium text-xs">Verify Payment</button>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {/* Expandable breakdown row */}
                {filtered.map((d) => (
                  <AnimatePresence key={'exp-' + d.id}>
                    {expandedId === d.id && d.breakdown && d.breakdown.length > 0 && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td colSpan={8} className="bg-[var(--s3)] px-6 py-3">
                          <p className="text-[11px] font-semibold text-[var(--t3)] mb-2 uppercase tracking-wide">Fee Breakdown</p>
                          <div className="grid grid-cols-3 gap-2">
                            {d.breakdown.map((b, bi) => (
                              <div key={bi} className="flex justify-between rounded-md bg-[var(--s2)] px-3 py-2 text-[12px]">
                                <span className="text-[var(--t2)]">{b.name}</span>
                                <span className="font-mono font-semibold">{b.waived ? <s className="text-[var(--t3)]">₹{b.amount?.toLocaleString()}</s> : `₹${b.amount?.toLocaleString()}`}</span>
                              </div>
                            ))}
                          </div>
                          {d.notes && <p className="mt-2 text-[11px] text-[var(--t3)]">Notes: {d.notes}</p>}
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No demands found</td></tr>}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </motion.div>

      {/* Individual generate modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Fee Demand">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Student</label>
            <select required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})}
              className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
              <option value="">Select Student</option>
              {(students || []).map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Academic Year</label>
              <select value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange">
                <option>2024-25</option><option>2023-24</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Semester</label>
              <input type="number" required min="1" max="8" value={formData.semester} onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})}
                className="w-full rounded-md border border-[var(--bd1)] bg-[var(--s3)] px-3 py-2 text-[13px] outline-none focus:border-orange" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Generating...' : 'Generate Demand'}</Button>
          </div>
        </form>
      </Modal>

      {/* Batch generate modal */}
      <Modal isOpen={batchOpen} onClose={() => setBatchOpen(false)} title="⚡ Batch Generate Demands">
        <form onSubmit={handleBatchGenerate} className="space-y-4">
          <p className="text-[12px] text-[var(--t2)]">Generate fee demands for all students matching the criteria below in one go.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase text-[var(--t3)]">Department</label>
              <select value={batchData.department_id} onChange={e => setBatchData({...batchData, department_id: e.target.value ? parseInt(e.target.value) : ''})}>
                <option value="">All Departments</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
