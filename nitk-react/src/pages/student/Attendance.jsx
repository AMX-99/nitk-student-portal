import { useState } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, ProgressBar } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as studentApi from '../../services/studentApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { useSortable, SortHeader, stagger } from '../../components/ui/animations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function Attendance() {
  const { data: courses, loading, error, refetch } = useApi(studentApi.getAttendance);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const studentCourses = courses || [];
  const { sorted, toggle, indicator } = useSortable(studentCourses, 'pct', 'desc');

  const overallPct = studentCourses.length > 0
    ? Math.round(studentCourses.reduce((s, c) => s + c.pct, 0) / studentCourses.length * 10) / 10
    : 0;
  const safeCount = studentCourses.filter((c) => c.pct >= 75).length;
  const shortCount = studentCourses.filter((c) => c.pct < 75).length;
  const donutData = [
    { name: 'Present', value: overallPct || 1, color: '#2DD4A0' },
    { name: 'Absent', value: (100 - overallPct) || 1, color: 'var(--bd2)' },
  ];

  const missableClasses = (pct, present, total) => {
    const maxAbsences = Math.floor(present / 0.75 - total);
    return Math.max(0, maxAbsences);
  };

  if (loading) return <LoadingState message="Loading attendance..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-3 gap-4" variants={stagger.item}>
        <StatCard label="Overall Attendance" value={`${overallPct}%`} sub="Across all courses" color="var(--color-green)" delay={0} />
        <StatCard label="Safe Subjects" value={`${safeCount}/${studentCourses.length}`} sub="Above 75% threshold" color="var(--color-blue)" delay={0.05} />
        <StatCard label="Shortage Risk" value={shortCount.toString()} sub="Below 75% attendance" color="var(--color-red)" delay={0.1} />
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_260px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📋 Course-wise Attendance</h3>
            <Badge variant="grey">Click columns to sort</Badge>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--bd1)]">
                  <SortHeader sortKey="code" onSort={toggle} indicator={indicator}>Course</SortHeader>
                  <SortHeader sortKey="name" onSort={toggle} indicator={indicator}>Name</SortHeader>
                  <SortHeader sortKey="present" onSort={toggle} indicator={indicator}>Classes</SortHeader>
                  <SortHeader sortKey="pct" onSort={toggle} indicator={indicator}>Percentage</SortHeader>
                  <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Can Miss</th>
                  <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Progress</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => {
                  const canMiss = missableClasses(c.pct, c.present, c.total);
                  return (
                    <motion.tr
                      key={c.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      whileHover={{ backgroundColor: 'var(--s3)' }}
                      onClick={() => setSelectedCourse(selectedCourse === c.code ? null : c.code)}
                      className={`border-b border-[var(--bd1)] cursor-pointer transition-colors ${selectedCourse === c.code ? 'bg-[var(--s3)]' : ''}`}
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{c.code}</td>
                      <td className="px-5 py-3">{c.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[var(--t3)]">{c.present}/{c.total}</td>
                      <td className="px-5 py-3">
                        <Badge variant={c.pct >= 85 ? 'green' : c.pct >= 75 ? 'amber' : 'red'}>{c.pct}%</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={canMiss > 0 ? 'green' : 'red'}>{canMiss} classes</Badge>
                      </td>
                      <td className="px-5 py-3 w-[120px]">
                        <ProgressBar value={c.pct} color={c.pct >= 85 ? 'var(--color-green)' : c.pct >= 75 ? 'var(--color-amber)' : 'var(--color-red)'} />
                      </td>
                    </motion.tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No attendance data available</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><h3 className="font-display text-[15px] font-bold">Overall</h3></CardHeader>
            <CardBody className="flex flex-col items-center">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} dataKey="value" startAngle={90} endAngle={-270} animationDuration={1200}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <motion.div
                className="-mt-[90px] mb-6 font-mono text-2xl font-bold text-green"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              >
                {overallPct}%
              </motion.div>
            </CardBody>
          </Card>
          {shortCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              <Card className="border-red/20!">
                <CardBody>
                  <h4 className="mb-1 text-[13px] font-semibold text-red">⚠️ Shortage Warning</h4>
                  <p className="text-[12px] text-[var(--t2)]">
                    {studentCourses.filter(c => c.pct < 75).map(c => (
                      <span key={c.code}><span className="font-mono font-semibold text-red">{c.code}</span> is at <span className="font-mono font-semibold text-red">{c.pct}%</span>. </span>
                    ))}
                    Attend upcoming classes to be safe.
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
