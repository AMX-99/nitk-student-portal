import { useState, useCallback } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, GradeBadge } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as teacherApi from '../../services/teacherApi';
import { LoadingState } from '../../components/ui/StateDisplays';
import { useSortable, SortHeader, stagger } from '../../components/ui/animations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const gradeColors = { 'A+': '#2DD4A0', A: '#4D9EFF', B: '#F5B93E', C: '#FF6B35', F: '#FF4F6D' };

export default function Gradebook() {
  const { data: courses, loading: coursesLoading } = useApi(teacherApi.getCourses);
  const [courseIdx, setCourseIdx] = useState(0);
  const [section, setSection] = useState('A');
  const [selectedGrade, setSelectedGrade] = useState(null);

  const teacherCourses = courses || [];
  const selectedCourse = teacherCourses[courseIdx] || {};
  const courseId = selectedCourse?.id || selectedCourse?.course_id || '';

  const fetchResults = useCallback(() => {
    if (!courseId) return Promise.resolve([]);
    return teacherApi.getCourseResults(courseId, { academic_year: '2024-25', semester: selectedCourse?.semester || 5, section });
  }, [courseId, section, selectedCourse?.semester]);

  const { data: apiResults, loading: resultsLoading } = useApi(fetchResults, [courseId, section]);
  const results = apiResults || [];
  const { sorted, toggle, indicator } = useSortable(results, 'total', 'desc');

  const avgTotal = results.length > 0 ? Math.round(results.reduce((a, s) => a + (s.total || 0), 0) / results.length) : 0;
  const passCount = results.filter((s) => s.grade !== 'F').length;
  const toppers = results.filter((s) => s.grade === 'A+').length;
  const highest = results.length > 0 ? Math.max(...results.map((s) => s.total || 0)) : 0;
  const lowest = results.length > 0 ? Math.min(...results.map((s) => s.total || 0)) : 0;
  const filtered = selectedGrade ? sorted.filter((s) => s.grade === selectedGrade) : sorted;

  const gradeDistribution = Object.entries(
    results.reduce((acc, s) => { acc[s.grade] = (acc[s.grade] || 0) + 1; return acc; }, {})
  ).map(([grade, count]) => ({ grade, count, color: gradeColors[grade] || '#999' }));

  if (coursesLoading) return <LoadingState message="Loading courses..." />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-4" variants={stagger.item}>
        <select value={courseIdx} onChange={(e) => setCourseIdx(Number(e.target.value))}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          {teacherCourses.map((c, i) => <option key={i} value={i}>{c.code || c.course_code} · {c.name || c.course_name}</option>)}
        </select>
        <select value={section} onChange={(e) => setSection(e.target.value)}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          <option value="A">Section A</option><option value="B">Section B</option>
        </select>
        {selectedGrade && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSelectedGrade(null)}
            className="cursor-pointer rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3 py-1.5 text-[12px] font-medium text-[var(--t2)] transition-colors hover:bg-[var(--s4)]">
            ✕ Clear filter: {selectedGrade}
          </motion.button>
        )}
      </motion.div>

      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Class Average" value={`${avgTotal}`} sub="out of 100" color="var(--color-blue)" delay={0} />
        <StatCard label="Pass Rate" value={results.length > 0 ? `${Math.round((passCount / results.length) * 100)}%` : '—'} sub={`${passCount}/${results.length} passed`} color="var(--color-green)" delay={0.05} />
        <StatCard label="Highest / Lowest" value={`${highest}`} sub={`Lowest: ${lowest}/100`} color="var(--color-amber)" delay={0.1} />
        <StatCard label="At Risk" value={(results.length - passCount).toString()} sub="Failed or absent" color="var(--color-red)" delay={0.15} />
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_300px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📖 Student Grades</h3>
            <Badge variant="blue">{selectedCourse?.code || ''} · {filtered.length} students</Badge>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            {resultsLoading ? <LoadingState message="Loading results..." /> : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--bd1)]">
                    <th className="bg-[var(--s3)] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">#</th>
                    <SortHeader sortKey="roll" onSort={toggle} indicator={indicator}>Roll No.</SortHeader>
                    <SortHeader sortKey="name" onSort={toggle} indicator={indicator}>Name</SortHeader>
                    <SortHeader sortKey="int" onSort={toggle} indicator={indicator}>Internal</SortHeader>
                    <SortHeader sortKey="ext" onSort={toggle} indicator={indicator}>External</SortHeader>
                    <SortHeader sortKey="total" onSort={toggle} indicator={indicator}>Total</SortHeader>
                    <SortHeader sortKey="grade" onSort={toggle} indicator={indicator}>Grade</SortHeader>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <motion.tr key={s.roll || s.roll_number || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      whileHover={{ backgroundColor: 'var(--s3)' }} className={`border-b border-[var(--bd1)] transition-colors ${s.grade === 'F' ? 'bg-red/4' : ''}`}>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--t3)]">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{s.roll || s.roll_number || '—'}</td>
                      <td className="px-4 py-2.5 font-medium">{s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim()}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{s.int || s.internal || 0}/40</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{s.ext || s.external || 0}/60</td>
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold">{s.total || 0}/100</td>
                      <td className="px-4 py-2.5"><GradeBadge grade={s.grade || '—'} /></td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No results available</td></tr>}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">📊 Grade Distribution</h3></CardHeader>
          <CardBody>
            {gradeDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={gradeDistribution} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="6 4" vertical={false} />
                    <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200} cursor="pointer"
                      onClick={(d) => setSelectedGrade(selectedGrade === d.grade ? null : d.grade)}>
                      {gradeDistribution.map((d, i) => (
                        <Cell key={i} fill={selectedGrade === d.grade ? '#FF6B35' : d.color} style={{ cursor: 'pointer', transition: 'fill 0.3s' }} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {gradeDistribution.map((g) => (
                    <motion.div key={g.grade} whileHover={{ x: 4 }} onClick={() => setSelectedGrade(selectedGrade === g.grade ? null : g.grade)}
                      className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-[12px] transition-colors ${selectedGrade === g.grade ? 'bg-orange/10' : 'hover:bg-[var(--s3)]'}`}>
                      <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: g.color }} /><span className="text-[var(--t2)]">Grade {g.grade}</span></div>
                      <span className="font-mono text-[11px] text-[var(--t3)]">{g.count} students</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-[13px] text-[var(--t3)]">No grade data</p>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
