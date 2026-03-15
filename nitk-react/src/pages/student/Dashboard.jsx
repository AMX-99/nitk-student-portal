import { useState } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, GradeBadge, ProgressBar } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as studentApi from '../../services/studentApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, PulseDot } from '../../components/ui/animations';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard({ setPage }) {
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const { data: courses, loading: coursesLoading } = useApi(studentApi.getCourses);
  const { data: cgpaData, loading: cgpaLoading } = useApi(studentApi.getCgpaTrend);
  const { data: notices, loading: noticesLoading } = useApi(() => commonApi.getNotices().catch(() => []));
  const { data: feeData } = useApi(() => studentApi.getFees().catch(() => null));
  const { data: examData } = useApi(() => commonApi.getExamSchedule().catch(() => []));

  const loading = coursesLoading || cgpaLoading;
  const studentCourses = courses || [];
  const cgpaTrend = cgpaData || [];

  const overallAtt = studentCourses.length > 0
    ? Math.round(studentCourses.reduce((s, c) => s + c.pct, 0) / studentCourses.length * 10) / 10
    : 0;
  const safeCount = studentCourses.filter(c => c.pct >= 75).length;
  const latestCgpa = cgpaTrend.length > 0 ? cgpaTrend[cgpaTrend.length - 1].cgpa : '—';

  const recentNotices = (notices || []).slice(0, 3).map(n => ({
    title: n.title,
    author: n.author_name || n.posted_by_role || 'Admin',
    time: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
    pinned: n.is_pinned,
    content: n.content || n.body || '',
  }));

  // Fallback notices if API returns empty
  const displayNotices = recentNotices.length > 0 ? recentNotices : [
    { title: 'No recent notices', author: '', time: '', pinned: false, content: 'Check back later for updates.' },
  ];

  const fee = feeData || {};
  const feeDue = fee.due || fee.total || 0;
  const feeStatus = fee.status === 'paid' ? 'Paid ✓' : fee.dueDate ? `Due ${new Date(fee.dueDate).toLocaleDateString()}` : 'Check Fees page';

  // Build deadlines from exam schedule
  const upcomingExams = (examData || []).filter(e => {
    if (!e.exam_date) return false;
    return new Date(e.exam_date) > new Date();
  }).slice(0, 4);
  const deadlines = upcomingExams.map(e => ({
    title: `${e.course?.code || ''} ${e.exam_type || 'Exam'}`,
    due: e.exam_date ? new Date(e.exam_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ` · ${e.start_time || '09:00'}` : '',
    color: 'var(--color-red)',
    urgent: e.exam_date && (new Date(e.exam_date) - new Date()) < 3 * 86400000,
  }));

  if (loading) return <LoadingState message="Loading dashboard..." />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="CGPA" value={String(latestCgpa)} sub={cgpaTrend.length > 1 ? `↑ from ${cgpaTrend[cgpaTrend.length-2]?.sem || 'prev'}` : 'Current'} color="var(--color-blue)" delay={0} />
        <StatCard label="Attendance" value={`${overallAtt}%`} sub={`${safeCount}/${studentCourses.length} subjects safe`} color="var(--color-green)" delay={0.05} />
        <StatCard label="Fee Due" value={fee.status === 'paid' ? '✓ Paid' : feeDue ? `₹${feeDue.toLocaleString('en-IN')}` : '—'} sub={feeStatus} color={fee.status === 'paid' ? 'var(--color-green)' : 'var(--color-orange)'} delay={0.1} />
        <StatCard label="Courses" value={String(studentCourses.length)} sub="This semester" color="var(--color-purple)" delay={0.15} />
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_340px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📈 CGPA Trend</h3>
            <Badge variant="blue">Sem 1-{cgpaTrend.length}</Badge>
          </CardHeader>
          <CardBody>
            {cgpaTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cgpaTrend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4D9EFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4D9EFF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 4" vertical={false} />
                  <XAxis dataKey="sem" tick={{ fontSize: 11 }} />
                  <YAxis domain={[6, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="cgpa" stroke="#4D9EFF" strokeWidth={2.5} fill="url(#cgpaGrad)" dot={{ r: 5, fill: '#4D9EFF', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-[13px] text-[var(--t3)]">No CGPA data available yet</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">🚨 Upcoming Deadlines</h3>
          </CardHeader>
          <CardBody className="space-y-0">
            {deadlines.length > 0 ? deadlines.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring', damping: 20 }}
                whileHover={{ x: 4, backgroundColor: 'var(--s3)' }}
                className="rounded-md border-l-3 py-3 transition-colors"
                style={{ borderColor: d.color, paddingLeft: 14 }}
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-semibold">{d.title}</h4>
                  {d.urgent && <PulseDot color="var(--color-red)" />}
                </div>
                <p className="text-[11px] text-[var(--t3)]">{d.due}</p>
              </motion.div>
            )) : (
              <p className="py-8 text-center text-[13px] text-[var(--t3)]">No upcoming deadlines.</p>
            )}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_340px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📚 Current Courses</h3>
            <Badge variant="green">This Semester</Badge>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--bd1)]">
                  <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Course</th>
                  <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Name</th>
                  <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Attendance</th>
                  <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Grade</th>
                </tr>
              </thead>
              <tbody>
                {studentCourses.slice(0, 5).map((c, i) => (
                  <motion.tr
                    key={c.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    onHoverStart={() => setHoveredCourse(c.code)}
                    onHoverEnd={() => setHoveredCourse(null)}
                    className={`border-b border-[var(--bd1)] transition-colors cursor-pointer ${hoveredCourse === c.code ? 'bg-[var(--s3)]' : ''}`}
                    onClick={() => setPage('attendance')}
                  >
                    <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs">{c.code}</td>
                    <td className="px-5 py-2.5 text-[var(--t1)]">{c.name}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={c.pct} color={c.pct >= 85 ? 'var(--color-green)' : c.pct >= 75 ? 'var(--color-amber)' : 'var(--color-red)'} className="w-16" />
                        <Badge variant={c.pct >= 85 ? 'green' : c.pct >= 75 ? 'amber' : 'red'}>{c.pct}%</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <GradeBadge grade={c.pct >= 90 ? 'A+' : c.pct >= 80 ? 'A' : c.pct >= 75 ? 'B' : 'C'} />
                    </td>
                  </motion.tr>
                ))}
                {studentCourses.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No courses enrolled</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📢 Recent Notices</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {displayNotices.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.01, borderColor: 'var(--bd2)' }}
                className={`cursor-pointer rounded-lg border border-transparent p-3.5 transition-colors ${n.pinned ? 'border-l-3 border-l-orange!' : ''}`}
                style={{ background: 'var(--s3)' }}
                onClick={() => setPage('notices')}
              >
                <h4 className="text-[13px] font-semibold">{n.title}</h4>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--t3)]">
                  {n.pinned && <Badge variant="orange">Pinned</Badge>}
                  <span>{n.author}{n.time ? ` · ${n.time}` : ''}</span>
                </div>
                {n.content && <p className="mt-2 text-[12px] leading-relaxed text-[var(--t2)]">{n.content.slice(0, 120)}{n.content.length > 120 ? '...' : ''}</p>}
              </motion.div>
            ))}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
