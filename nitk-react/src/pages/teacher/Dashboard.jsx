import { StatCard, Card, CardHeader, CardBody, Badge, ProgressBar } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as teacherApi from '../../services/teacherApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, AnimatedCounter } from '../../components/ui/animations';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TeacherDashboard() {
  const { data: courses, loading, error, refetch } = useApi(teacherApi.getCourses);
  const { data: timetableSlots } = useApi(() => commonApi.getTimetable().catch(() => []));
  const { data: notices } = useApi(() => commonApi.getNotices().catch(() => []));

  const teacherCourses = courses || [];
  const totalStudents = teacherCourses.reduce((s, c) => s + (c.studentCount || c.student_count || c.students || 0), 0);

  // Compute today's classes from timetable
  const todayIdx = Math.min(Math.max(new Date().getDay() - 1, 0), 4);
  const todayClasses = (timetableSlots || []).filter(s => s.day_of_week === todayIdx).length;

  // Compute total weekly classes
  const weeklyClasses = (timetableSlots || []).length;

  // Recent notices
  const recentNotices = (notices || []).slice(0, 4).map(n => ({
    title: n.title,
    dept: n.target_department_name || 'General',
    time: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
    pinned: n.is_pinned,
    body: n.body || n.content || '',
  }));

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Active Courses" value={String(teacherCourses.length)} sub="Current semester" color="var(--color-blue)" delay={0} />
        <StatCard label="Total Students" value={String(totalStudents)} sub={`Across ${teacherCourses.length} courses`} color="var(--color-green)" delay={0.05} />
        <StatCard label="Classes Today" value={String(todayClasses)} sub={`${weeklyClasses} classes/week`} color="var(--color-amber)" delay={0.1} />
        <StatCard label="Notices" value={String(recentNotices.length)} sub="Recent announcements" color="var(--color-purple)" delay={0.15} />
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_340px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📊 Students per Course</h3>
          </CardHeader>
          <CardBody>
            {teacherCourses.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[var(--t3)]">No courses assigned</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teacherCourses.map(c => ({
                  name: c.code || c.course_code,
                  students: c.studentCount || c.student_count || c.students || 0,
                }))} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="6 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="students" name="Students" fill="#4D9EFF" radius={[4, 4, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📢 Recent Notices</h3>
            <Badge variant="grey">{recentNotices.length}</Badge>
          </CardHeader>
          <CardBody className="space-y-0">
            {recentNotices.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[var(--t3)]">No notices yet</p>
            ) : (
              recentNotices.map((n, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, type: 'spring', damping: 20 }}
                  whileHover={{ x: 4 }} className="border-b border-[var(--bd1)] py-3 last:border-b-0 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {n.pinned && <Badge variant="orange">📌</Badge>}
                    <h4 className="text-[13px] font-semibold line-clamp-1">{n.title}</h4>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--t3)]">
                    <Badge variant="blue">{n.dept}</Badge>
                    <span>{n.time}</span>
                  </div>
                </motion.div>
              ))
            )}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📚 Course Overview</h3>
            <Badge variant="green">Current Semester</Badge>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--bd1)]">
                  {['Course', 'Name', 'Students', 'Section', 'Semester', 'Credits'].map((h) => (
                    <th key={h} className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teacherCourses.map((c, i) => (
                  <motion.tr
                    key={c.id || i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    whileHover={{ backgroundColor: 'var(--s3)' }}
                    className="border-b border-[var(--bd1)] cursor-pointer transition-colors"
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">
                      <Badge variant="blue">{c.code || c.course_code}</Badge>
                    </td>
                    <td className="px-5 py-3 font-medium">{c.name || c.course_name}</td>
                    <td className="px-5 py-3 font-mono text-xs">{c.studentCount || c.student_count || c.students || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">{c.section || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">{c.semester || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">{c.credits || '—'}</td>
                  </motion.tr>
                ))}
                {teacherCourses.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No courses assigned</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
