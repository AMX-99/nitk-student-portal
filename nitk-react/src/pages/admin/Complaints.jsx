import { useState, useCallback } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, Button } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

const statusVariant = { open: 'amber', in_progress: 'blue', resolved: 'green', closed: 'grey' };
const statusLabels = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
const categoryIcons = { academic: '📚', administrative: '🏛️', facility: '🔧', other: '📋' };

export default function AdminComplaints() {
  const [filter, setFilter] = useState('all');
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(null);
  const [sendingComment, setSendingComment] = useState(false);

  const { data: complaints, loading, error, refetch } = useApi(
    () => adminApi.getAllComplaints(filter === 'all' ? {} : { status: filter }),
    [filter]
  );

  const loadComments = useCallback(async (complaintId) => {
    setLoadingComments(complaintId);
    try {
      const data = await adminApi.getComplaintComments(complaintId);
      setComments(prev => ({ ...prev, [complaintId]: data }));
    } catch {
      showToast('Failed to load comments', 'error');
    } finally { setLoadingComments(null); }
  }, []);

  const handleToggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setCommentText('');
    if (!comments[id]) await loadComments(id);
  };

  const handleAddComment = async (complaintId) => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      await adminApi.addComplaintComment(complaintId, { comment: commentText.trim() });
      showToast('Comment added', 'success');
      setCommentText('');
      await loadComments(complaintId);
    } catch { showToast('Failed to add comment', 'error'); }
    finally { setSendingComment(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setStatusUpdating(id);
      await adminApi.updateComplaintStatus(id, { status });
      showToast(`Complaint ${statusLabels[status] || status}`, 'success');
      refetch();
    } catch { showToast('Failed to update status', 'error'); }
    finally { setStatusUpdating(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try { await adminApi.deleteComplaint(id); showToast('Complaint deleted', 'success'); refetch(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const allComplaints = complaints || [];
  const openCount = allComplaints.filter(c => c.status === 'open').length;
  const inProgressCount = allComplaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = allComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;

  if (loading) return <LoadingState message="Loading complaints..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Total" value={String(allComplaints.length)} sub="All complaints" color="var(--color-blue)" delay={0} />
        <StatCard label="Open" value={String(openCount)} sub="Needs attention" color="var(--color-amber)" delay={0.05} />
        <StatCard label="In Progress" value={String(inProgressCount)} sub="Being resolved" color="var(--color-blue)" delay={0.1} />
        <StatCard label="Resolved" value={String(resolvedCount)} sub="Completed" color="var(--color-green)" delay={0.15} />
      </motion.div>

      <motion.div className="flex items-center gap-2" variants={stagger.item}>
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3.5 py-1.5 text-[11.5px] font-semibold capitalize transition-all ${filter === s ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'}`}>
            {s === 'all' ? 'All' : statusLabels[s] || s}
          </button>
        ))}
      </motion.div>

      <motion.div className="space-y-3" variants={stagger.item}>
        {allComplaints.length === 0 && (
          <Card><CardBody><p className="py-8 text-center text-[var(--t3)]">No complaints found</p></CardBody></Card>
        )}
        {allComplaints.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => handleToggleExpand(c.id)}>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-lg">{categoryIcons[c.category] || '📋'}</span>
                      <h3 className="font-display text-[15px] font-bold">{c.title}</h3>
                      <Badge variant={statusVariant[c.status] || 'grey'}>{statusLabels[c.status] || c.status}</Badge>
                      <Badge variant="grey">{c.category}</Badge>
                      <span className="text-[10px] text-[var(--t3)]">💬 Click to expand</span>
                    </div>
                    <p className="text-[13px] text-[var(--t2)] mb-2 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-[var(--t3)]">
                      <span>By: <strong>{c.students?.name || c.student_id}</strong></span>
                      <span>Filed: {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</span>
                      {c.updated_at && <span>Updated: {new Date(c.updated_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {c.status === 'open' && (
                      <button onClick={() => handleStatusUpdate(c.id, 'in_progress')} disabled={statusUpdating === c.id}
                        className="rounded-md bg-blue/10 px-3 py-1.5 text-[11px] font-semibold text-blue hover:bg-blue/20 transition-colors disabled:opacity-50">
                        ▶ Start Working
                      </button>
                    )}
                    {c.status === 'in_progress' && (
                      <button onClick={() => handleStatusUpdate(c.id, 'resolved')} disabled={statusUpdating === c.id}
                        className="rounded-md bg-green/10 px-3 py-1.5 text-[11px] font-semibold text-green hover:bg-green/20 transition-colors disabled:opacity-50">
                        ✓ Mark Resolved
                      </button>
                    )}
                    {c.status === 'resolved' && (
                      <button onClick={() => handleStatusUpdate(c.id, 'closed')} disabled={statusUpdating === c.id}
                        className="rounded-md bg-[var(--s4)] px-3 py-1.5 text-[11px] font-semibold text-[var(--t2)] hover:bg-[var(--s5)] transition-colors disabled:opacity-50">
                        ✕ Close
                      </button>
                    )}
                    {c.status !== 'closed' && c.status !== 'resolved' && (
                      <button onClick={() => handleStatusUpdate(c.id, 'resolved')} disabled={statusUpdating === c.id}
                        className="rounded-md bg-green/10 px-3 py-1.5 text-[11px] font-semibold text-green hover:bg-green/20 transition-colors disabled:opacity-50">
                        ✓ Resolve
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)}
                      className="rounded-md bg-red/10 px-3 py-1.5 text-[11px] font-semibold text-red hover:bg-red/20 transition-colors">
                      🗑 Delete
                    </button>
                  </div>
                </div>

                {/* Expandable comment thread */}
                <AnimatePresence>
                  {expandedId === c.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-4 overflow-hidden border-t border-[var(--bd1)] pt-4">
                      
                      {/* Full description */}
                      <div className="mb-4 rounded-lg bg-[var(--s3)] p-3">
                        <p className="text-[12px] font-semibold text-[var(--t3)] mb-1">Full Description</p>
                        <p className="text-[13px] text-[var(--t2)] whitespace-pre-wrap">{c.description}</p>
                      </div>

                      {/* Comment thread */}
                      <p className="text-[12px] font-semibold text-[var(--t3)] mb-2.5">💬 Comments</p>
                      {loadingComments === c.id ? (
                        <p className="text-[12px] text-[var(--t3)] py-4 text-center">Loading comments...</p>
                      ) : (
                        <div className="space-y-2 mb-3">
                          {(comments[c.id] || []).length === 0 && (
                            <p className="text-[12px] text-[var(--t3)] py-2">No comments yet. Be the first to respond.</p>
                          )}
                          {(comments[c.id] || []).map((comment, ci) => (
                            <motion.div key={comment.id || ci} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.05 }}
                              className={`rounded-lg p-3 text-[13px] ${comment.user_role === 'admin' ? 'bg-blue/8 ml-4' : 'bg-[var(--s3)] mr-4'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={comment.user_role === 'admin' ? 'blue' : 'grey'}>{comment.user_role}</Badge>
                                <span className="text-[10px] text-[var(--t3)]">
                                  {comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}
                                </span>
                              </div>
                              <p className="text-[var(--t1)]">{comment.comment}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Add comment input */}
                      <div className="flex gap-2">
                        <input type="text" placeholder="Write a response..." value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(c.id); } }}
                          className="flex-1 rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3 py-2 text-[13px] text-[var(--t1)] outline-none focus:border-orange transition-colors" />
                        <Button variant="primary" small disabled={sendingComment || !commentText.trim()} onClick={() => handleAddComment(c.id)}>
                          {sendingComment ? '...' : 'Send'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
