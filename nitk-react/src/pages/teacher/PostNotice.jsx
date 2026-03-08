import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as teacherApi from '../../services/teacherApi';
import * as commonApi from '../../services/commonApi';
import { showToast, stagger } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostNotice() {
  const { data: recentNoticesApi } = useApi(() => commonApi.getNotices().catch(() => []));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dept, setDept] = useState('CSE');
  const [priority, setPriority] = useState('normal');
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [shakeFields, setShakeFields] = useState({ title: false, body: false });

  const recentNotices = (recentNoticesApi || []).slice(0, 3).map(n => ({
    title: n.title,
    dept: n.target_department_name || 'General',
    time: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
    priority: n.is_pinned ? 'urgent' : 'normal',
  }));

  const handlePost = async () => {
    const errors = { title: !title.trim(), body: !body.trim() };
    setShakeFields(errors);
    if (errors.title || errors.body) {
      showToast('Please fill in title and content', 'error');
      setTimeout(() => setShakeFields({ title: false, body: false }), 500);
      return;
    }
    setPosting(true);
    try {
      await teacherApi.postNotice({
        title: title.trim(),
        body: body.trim(),
        is_pinned: priority === 'urgent',
      });
      setPosted(true);
      showToast(`Notice "${title}" posted!`, 'success');
      setTitle('');
      setBody('');
    } catch (err) {
      showToast('Failed to post notice', 'error');
    } finally {
      setPosting(false);
    }
  };

  const charCount = body.length;
  const maxChars = 500;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-[1fr_340px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📢 Create Notice</h3>
            {priority === 'urgent' && <Badge variant="red">⚡ Urgent</Badge>}
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11.5px] font-medium uppercase tracking-wide text-[var(--t3)]">Title</label>
              <motion.input type="text" placeholder="Enter notice title..." value={title}
                onChange={(e) => { setTitle(e.target.value); setPosted(false); }}
                animate={shakeFields.title ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
                className={`w-full rounded-lg border bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none transition-colors ${shakeFields.title ? 'border-red!' : 'border-[var(--bd2)] focus:border-orange'}`} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center justify-between text-[11.5px] font-medium uppercase tracking-wide text-[var(--t3)]">
                <span>Content</span>
                <span className={`normal-case tracking-normal ${charCount > maxChars ? 'text-red' : ''}`}>{charCount}/{maxChars}</span>
              </label>
              <motion.textarea placeholder="Write the notice content here..." rows={6} value={body}
                onChange={(e) => { if (e.target.value.length <= maxChars) { setBody(e.target.value); setPosted(false); }}}
                animate={shakeFields.body ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
                className={`w-full resize-none rounded-lg border bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] leading-relaxed text-[var(--t1)] outline-none transition-colors ${shakeFields.body ? 'border-red!' : 'border-[var(--bd2)] focus:border-orange'}`} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-[11.5px] font-medium uppercase tracking-wide text-[var(--t3)]">Department</label>
                <select value={dept} onChange={(e) => setDept(e.target.value)}
                  className="w-full rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3.5 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
                  <option>CSE</option><option>ECE</option><option>ME</option><option>CE</option><option>IT</option><option>All Departments</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-[11.5px] font-medium uppercase tracking-wide text-[var(--t3)]">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3.5 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
                  <option value="normal">Normal</option><option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <AnimatePresence mode="wait">
                <motion.p key={posted ? 'posted' : 'info'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className={`text-[12px] ${posted ? 'text-green' : 'text-[var(--t3)]'}`}>
                  {posted ? '✅ Notice posted successfully!' : 'Fill in all fields to post.'}
                </motion.p>
              </AnimatePresence>
              <Button variant={posted ? 'success' : 'primary'} onClick={handlePost} disabled={posting}>
                {posting ? '⏳ Posting...' : posted ? '✓ Posted' : 'Post Notice →'}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">📋 Recent Notices</h3></CardHeader>
          <CardBody className="space-y-0">
            {recentNotices.map((n, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring', damping: 20 }}
                whileHover={{ x: 4 }} className="border-b border-[var(--bd1)] py-3.5 last:border-b-0 cursor-pointer">
                <h4 className="text-[13px] font-semibold">{n.title}</h4>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[var(--t3)]">
                  <Badge variant="blue">{n.dept}</Badge>
                  {n.priority === 'urgent' && <Badge variant="red">Urgent</Badge>}
                  <span>{n.time}</span>
                </div>
              </motion.div>
            ))}
            {recentNotices.length === 0 && <p className="py-6 text-center text-[13px] text-[var(--t3)]">No notices yet</p>}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
