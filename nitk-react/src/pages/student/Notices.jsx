import { useState } from 'react';
import { Card, Badge } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'Academic', 'CSE', 'General', 'Placement'];
const priorities = ['All', 'urgent', 'normal', 'info'];

export default function Notices() {
  const { data: apiNotices, loading, error, refetch } = useApi(() => commonApi.getNotices().catch(() => []));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [expandedNotice, setExpandedNotice] = useState(null);

  const allNotices = (apiNotices || []).map(n => ({
    title: n.title,
    author: n.author_name || n.posted_by_role || 'Admin',
    dept: n.target_department_name || n.department || 'General',
    time: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
    priority: n.is_pinned ? 'urgent' : 'normal',
    pinned: n.is_pinned || false,
    body: n.body || n.content || '',
  }));

  const filtered = allNotices.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || n.dept === category;
    const matchPri = priorityFilter === 'All' || n.priority === priorityFilter;
    return matchSearch && matchCat && matchPri;
  });

  const priColors = { urgent: 'red', normal: 'blue', info: 'grey' };

  if (loading) return <LoadingState message="Loading notices..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-3" variants={stagger.item}>
        <input
          type="text"
          placeholder="🔍 Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none focus:border-orange transition-colors"
        />
        <div className="flex gap-1.5">
          {categories.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(c)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                category === c ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div className="flex gap-2" variants={stagger.item}>
        {priorities.map((p) => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPriorityFilter(p)}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide transition-all ${
              priorityFilter === p ? 'bg-orange/15 text-orange' : 'bg-[var(--s3)] text-[var(--t3)] hover:text-[var(--t2)]'
            }`}
          >
            {p === 'All' ? 'All Priority' : p}
          </motion.button>
        ))}
        <div className="flex-1" />
        <Badge variant="grey">{filtered.length} notices</Badge>
      </motion.div>

      <motion.div className="space-y-3" variants={stagger.item}>
        <AnimatePresence>
          {filtered.map((n, i) => {
            const isExpanded = expandedNotice === i;
            return (
              <motion.div
                key={n.title + i}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ delay: i * 0.06, type: 'spring', damping: 22 }}
              >
                <Card className={n.pinned ? 'border-l-3 border-l-orange!' : ''}>
                  <div
                    className="cursor-pointer px-5 py-4 transition-colors hover:bg-[var(--s3)]"
                    onClick={() => setExpandedNotice(isExpanded ? null : i)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                          {n.pinned && <Badge variant="orange">📌 Pinned</Badge>}
                          <Badge variant={priColors[n.priority]}>{n.priority}</Badge>
                          <Badge variant="grey">{n.dept}</Badge>
                        </div>
                        <h4 className="mt-2 text-[14px] font-semibold">{n.title}</h4>
                        <p className="mt-1 text-[11.5px] text-[var(--t3)]">{n.author}{n.time ? ` · ${n.time}` : ''}</p>
                      </div>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-[var(--t3)]"
                      >
                        ▼
                      </motion.span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? 12 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="rounded-lg bg-[var(--s3)] p-3.5 text-[12.5px] leading-relaxed text-[var(--t2)]">
                        {n.body}
                      </p>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center"
          >
            <span className="text-4xl">📭</span>
            <p className="mt-3 text-[14px] font-medium text-[var(--t2)]">No notices found</p>
            <p className="mt-1 text-[12px] text-[var(--t3)]">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
