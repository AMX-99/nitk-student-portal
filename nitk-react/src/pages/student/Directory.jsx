import { useState, useCallback, useEffect } from 'react';
import { Card, CardBody, Badge, Avatar } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

const dirColors = ['var(--color-orange)', 'var(--color-blue)', 'var(--color-green)', 'var(--color-purple)', 'var(--color-amber)', 'var(--color-red)'];

export default function Directory() {
  const { data: apiDir, loading, error, refetch } = useApi(() => commonApi.getDirectory().catch(() => []));
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Debounced server-side search
  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await commonApi.searchDirectory(search);
        setSearchResults(results);
      } catch {
        setSearchResults(null); // Fall back to client-side filter
      } finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Listen for global header searches
  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearch(e.detail);
    };
    window.addEventListener('global:search', handleGlobalSearch);
    return () => window.removeEventListener('global:search', handleGlobalSearch);
  }, []);

  const rawUsers = searchResults || apiDir || [];

  const users = rawUsers.map((u, i) => ({
    ...u, // preserve mapped fields from backend
    name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
    role: u.role || 'Faculty', // If searched from backend it might lack role
    dept: u.department?.code || u.department_code || u.dept || '—',
    designation: u.designation || 'Faculty',
    email: u.email || '—',
    phone: u.phone || '—',
    specialization: u.specialization || '—',
    initials: u.initials || (u.name || `${u.first_name || ''} ${u.last_name || ''}`).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: u.color || dirColors[i % dirColors.length],
    office: u.office || '—',
    qualification: u.qualification || '—',
    experience: u.experience || '—',
  }));

  const depts = ['All', ...new Set(users.map(u => u.dept).filter(d => d && d !== '—'))];

  const filtered = users.filter((u) => {
    const matchSearch = searchResults ? true : (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.specialization.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    const matchDept = dept === 'All' || u.dept === dept;
    return matchSearch && matchDept;
  });

  if (loading) return <LoadingState message="Loading directory..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-3" variants={stagger.item}>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 Search by name, specialization, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none focus:border-orange transition-colors"
          />
          {searching && <span className="absolute right-3 top-3 text-[11px] text-[var(--t3)] animate-pulse">Searching…</span>}
        </div>
        <div className="flex gap-1.5">
          {depts.map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDept(d)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                dept === d ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'
              }`}
            >
              {d}
            </motion.button>
          ))}
        </div>
        <Badge variant="grey">{filtered.length} found</Badge>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-4" variants={stagger.item}>
        <AnimatePresence>
          {filtered.map((u, i) => {
            const isExpanded = expandedCard === u.email;
            return (
              <motion.div
                key={u.email + i}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, type: 'spring', damping: 22 }}
              >
                <Card className={`cursor-pointer transition-all ${isExpanded ? 'border-orange/30!' : ''}`}>
                  <div className="p-5 transition-colors hover:bg-[var(--s3)]" onClick={() => setExpandedCard(isExpanded ? null : u.email)}>
                    <div className="flex items-start gap-4">
                      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring' }}>
                        <Avatar initials={u.initials} color={u.color} size="md" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[14px] font-semibold">{u.name}</h4>
                          {u.role === 'Teacher' && <Badge variant="purple">Teacher</Badge>}
                          {u.role === 'Student' && <Badge variant="blue">Student</Badge>}
                        </div>
                        <p className="mt-0.5 text-[12px] text-[var(--t2)]">{u.designation}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="grey">{u.dept}</Badge>
                          <span className="text-[11px] text-[var(--t3)]">{u.specialization}</span>
                        </div>
                      </div>
                      <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-[12px] text-[var(--t3)]">▼</motion.span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? 12 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-lg bg-[var(--s3)] p-3.5 space-y-2">
                        <div className="flex items-center gap-2 text-[12px]">
                          <span className="text-[var(--t3)]">📧 Email:</span>
                          <a href={`mailto:${u.email}`} className="font-mono text-[11px] text-blue hover:underline">{u.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-[12px]">
                          <span className="text-[var(--t3)]">📞 Phone:</span>
                          <span className="font-mono text-[11px]">{u.phone}</span>
                        </div>
                        {u.role !== 'Student' && (
                          <div className="flex items-center gap-2 text-[12px]">
                            <span className="text-[var(--t3)]">🏢 Office:</span>
                            <span className="font-mono text-[11px]">{u.office}</span>
                          </div>
                        )}
                        {u.qualification !== '—' && (
                          <div className="flex items-center gap-2 text-[12px]">
                            <span className="text-[var(--t3)]">🎓 Qualification:</span>
                            <span className="text-[11px]">{u.qualification}</span>
                          </div>
                        )}
                        {u.experience !== '—' && (
                          <div className="flex items-center gap-2 text-[12px]">
                            <span className="text-[var(--t3)]">💼 Experience:</span>
                            <span className="text-[11px]">{u.experience}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-[14px] font-medium text-[var(--t2)]">No users found</p>
          <p className="mt-1 text-[12px] text-[var(--t3)]">Try adjusting your search or department filter</p>
        </motion.div>
      )}
    </motion.div>
  );
}
