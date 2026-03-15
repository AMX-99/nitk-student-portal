import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody, Badge, Button, StatCard } from '../../components/ui';
import { useApi, useMutation } from '../../hooks/useApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, EmptyState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

const categoryColors = {
  academic: 'blue', hostel: 'orange', facilities: 'amber',
  administrative: 'purple', facility: 'amber', other: 'grey',
};
const statusColors = {
  open: 'amber', in_progress: 'blue', 'in-progress': 'blue',
  resolved: 'green', closed: 'grey',
};
const categoryIcons = { academic: '📚', hostel: '🏠', facilities: '🔧', administrative: '🏛️', facility: '🔧', other: '📋' };

export default function StudentComplaints() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(null);
  const [sendingComment, setSendingComment] = useState(false);

  const { data: complaints, loading, refetch } = useApi(commonApi.getMyComplaints);
  const { mutate: createComplaint, loading: submitting } = useMutation(commonApi.createComplaint, {
    onSuccess: () => {
      setShowForm(false);
      refetch();
      showToast('Complaint submitted successfully!', 'success');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createComplaint({
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
    });
  };

  const loadComments = useCallback(async (id) => {
    setLoadingComments(id);
    try {
      const data = await commonApi.getComplaintComments(id);
      setComments((prev) => ({ ...prev, [id]: data }));
    } catch {
      showToast('Failed to load comments', 'error');
    } finally {
      setLoadingComments(null);
    }
  }, []);

  const handleToggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setCommentText('');
    if (!comments[id]) await loadComments(id);
  };

  const handleAddComment = async (id) => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      await commonApi.addComplaintComment(id, { comment: commentText.trim() });
      showToast('Comment added', 'success');
      setCommentText('');
      await loadComments(id);
    } catch { showToast('Failed to add comment', 'error'); }
    finally { setSendingComment(false); }
  };

  if (loading) return <LoadingState message="Loading your complaints..." />;

  const myComplaints = complaints || [];
  const openCount = myComplaints.filter(c => c.status === 'open').length;
  const inProgressCount = myComplaints.filter(c => c.status === 'in_progress' || c.status === 'in-progress').length;
  const resolvedCount = myComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Total" value={String(myComplaints.length)} sub="All submissions" color="var(--color-blue)" delay={0} />
        <StatCard label="Open" value={String(openCount)} sub="Awaiting response" color="var(--color-amber)" delay={0.05} />
        <StatCard label="In Progress" value={String(inProgressCount)} sub="Being addressed" color="var(--color-blue)" delay={0.1} />
        <StatCard label="Resolved" value={String(resolvedCount)} sub="Completed" color="var(--color-green)" delay={0.15} />
      </motion.div>

      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <div>
          <h2 className="font-display text-xl font-bold">Grievances & Complaints</h2>
          <p className="mt-1 text-[13px] text-[var(--t2)]">Submit and track your issues · Click to view comment thread</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '📄 New Complaint'}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div key="form" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="border-[var(--color-blue)]/30 shadow-[0_4px_20px_rgba(77,158,255,0.08)]">
              <CardHeader className="bg-[var(--color-blue)]/5">
                <h3 className="font-display text-[15px] font-bold text-[var(--color-blue)]">Submit New Complaint</h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium text-[var(--t2)] uppercase tracking-wider">Issue Title</label>
                      <input name="title" required placeholder="Brief title"
                        className="w-full rounded-lg border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--color-blue)]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium text-[var(--t2)] uppercase tracking-wider">Category</label>
                      <select name="category" required
                        className="w-full rounded-lg border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--color-blue)]">
                        <option value="academic">Academic</option>
                        <option value="hostel">Hostel</option>
                        <option value="facilities">Facilities & IT</option>
                        <option value="administrative">Administrative</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium text-[var(--t2)] uppercase tracking-wider">Description</label>
                    <textarea name="description" required rows={4}
                      className="w-full resize-none rounded-lg border border-[var(--bd1)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--t1)] outline-none focus:border-[var(--color-blue)]"
                      placeholder="Please describe your issue in detail..." />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="space-y-3" variants={stagger.item}>
        {myComplaints.length === 0 ? (
          <Card><CardBody><EmptyState icon="📬" message="You have no active or past complaints." /></CardBody></Card>
        ) : (
          myComplaints.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={expandedId === c.id ? 'border-orange/20!' : ''}>
                <div className="px-5 py-4 transition-colors hover:bg-[var(--s3)] cursor-pointer" onClick={() => handleToggleExpand(c.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{categoryIcons[c.category] || '📋'}</span>
                        <h4 className="font-semibold text-[14px] text-[var(--t1)]">{c.title}</h4>
                        <Badge variant={statusColors[c.status] || 'grey'}>{c.status?.replace('_', ' ')}</Badge>
                        <Badge variant={categoryColors[c.category] || 'grey'}>{c.category}</Badge>
                      </div>
                      <p className="line-clamp-2 text-[13px] text-[var(--t2)] leading-relaxed pl-8">{c.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-[var(--t3)] pl-8">
                        <span>Submitted: {new Date(c.created_at).toLocaleDateString()}</span>
                        {c.assigned_to && <span>• Assigned: {c.assigned_to.split('-')[0]}</span>}
                        <span className="text-blue">💬 Click to view thread</span>
                      </div>
                    </div>
                    <motion.span animate={{ rotate: expandedId === c.id ? 180 : 0 }} className="text-[var(--t3)] mt-1">▼</motion.span>
                  </div>
                </div>

                {/* Expandable comment thread */}
                <AnimatePresence>
                  {expandedId === c.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-[var(--bd1)]">
                      <div className="px-5 py-4">
                        {/* Full description */}
                        <div className="mb-4 rounded-lg bg-[var(--s3)] p-3">
                          <p className="text-[12px] font-semibold text-[var(--t3)] mb-1">Full Description</p>
                          <p className="text-[13px] text-[var(--t2)] whitespace-pre-wrap">{c.description}</p>
                        </div>

                        {/* Comment thread */}
                        <p className="text-[12px] font-semibold text-[var(--t3)] mb-2.5">💬 Conversation Thread</p>
                        {loadingComments === c.id ? (
                          <p className="text-[12px] text-[var(--t3)] py-4 text-center">Loading comments...</p>
                        ) : (
                          <div className="space-y-2 mb-3 max-h-[300px] overflow-y-auto">
                            {(comments[c.id] || []).length === 0 && (
                              <p className="text-[12px] text-[var(--t3)] py-3 text-center">No replies yet. Add a comment to follow up.</p>
                            )}
                            {(comments[c.id] || []).map((comment, ci) => (
                              <motion.div key={comment.id || ci} initial={{ opacity: 0, x: comment.user_role === 'student' ? 8 : -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.05 }}
                                className={`rounded-lg p-3 text-[13px] ${comment.user_role === 'student' ? 'bg-orange/8 ml-8' : 'bg-blue/8 mr-8'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={comment.user_role === 'admin' ? 'blue' : comment.user_role === 'student' ? 'orange' : 'grey'}>{comment.user_role || 'User'}</Badge>
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
                          <input type="text" placeholder="Write a follow-up..." value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(c.id); }}}
                            className="flex-1 rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3 py-2 text-[13px] text-[var(--t1)] outline-none focus:border-orange transition-colors" />
                          <Button variant="primary" small disabled={sendingComment || !commentText.trim()} onClick={() => handleAddComment(c.id)}>
                            {sendingComment ? '...' : 'Send'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
