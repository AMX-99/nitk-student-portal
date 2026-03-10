import { useState, useCallback } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, ProgressBar } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as studentApi from '../../services/studentApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, useSortable, SortHeader } from '../../components/ui/animations';
import { motion } from 'framer-motion';

export default function Results() {
  const [selectedSem, setSelectedSem] = useState(4);
  const { data: cgpaData, loading: cgpaLoading } = useApi(studentApi.getCgpaTrend);

  const fetchResults = useCallback(() => studentApi.getResults(selectedSem), [selectedSem]);
  const { data: semResults, loading: resultsLoading, error } = useApi(fetchResults, [selectedSem]);

  const results = semResults || [];
  const cgpaTrend = cgpaData || [];
  const { sorted, toggle, indicator } = useSortable(results, 'total', 'desc');

  const currentSGPA = cgpaTrend.find(c => c.sem === `Sem ${selectedSem}`)?.cgpa || '—';
  const latestCgpa = cgpaTrend.length > 0 ? cgpaTrend[cgpaTrend.length - 1].cgpa : '—';

  const gradeColor = (g) =>
    g === 'A+' ? 'bg-green/15 text-green' :
    g === 'A' ? 'bg-blue/15 text-blue' :
    g === 'B' ? 'bg-amber/15 text-amber' :
    g === 'C' ? 'bg-orange/15 text-orange' : 'bg-red/15 text-red';

  const loading = cgpaLoading || resultsLoading;
  if (loading) return <LoadingState message="Loading results..." />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="CGPA" value={String(latestCgpa)} sub={`Cumulative · Sem 1-${cgpaTrend.length}`} color="var(--color-blue)" delay={0} />
        <StatCard label="Current Semester" value={`Sem ${selectedSem}`} sub={`SGPA ${currentSGPA}`} color="var(--color-green)" delay={0.05} animate={false} />
        <StatCard label="Subjects" value={String(results.length)} sub="This semester" color="var(--color-amber)" delay={0.1} />
        <StatCard label="Semesters" value={String(cgpaTrend.length)} sub="Results available" color="var(--color-purple)" delay={0.15} />
      </motion.div>

      <motion.div className="flex items-center gap-2" variants={stagger.item}>
        {(cgpaTrend.length > 0 ? cgpaTrend : Array.from({length: 8}, (_, i) => ({sem: `Sem ${i+1}`}))).map((s, i) => {
          const semNum = i + 1;
          return (
            <motion.button
              key={semNum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSem(semNum)}
              className={`cursor-pointer rounded-lg px-4 py-2 text-[12px] font-semibold transition-all ${
                selectedSem === semNum ? 'bg-orange text-white' :
                'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'
              }`}
            >
              Sem {semNum}
              {s.cgpa && <span className="ml-1.5 font-mono text-[10px] opacity-70">{s.cgpa}</span>}
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📋 Semester {selectedSem} Results</h3>
            <Badge variant="green">SGPA {currentSGPA}</Badge>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            {resultsLoading ? (
              <LoadingState message="Loading semester results..." />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--bd1)]">
                    <SortHeader sortKey="code" onSort={toggle} indicator={indicator}>Code</SortHeader>
                    <SortHeader sortKey="name" onSort={toggle} indicator={indicator}>Subject</SortHeader>
                    <SortHeader sortKey="int" onSort={toggle} indicator={indicator}>Internal</SortHeader>
                    <SortHeader sortKey="ext" onSort={toggle} indicator={indicator}>External</SortHeader>
                    <SortHeader sortKey="total" onSort={toggle} indicator={indicator}>Total</SortHeader>
                    <SortHeader sortKey="grade" onSort={toggle} indicator={indicator}>Grade</SortHeader>
                    <th className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <motion.tr
                      key={r.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      whileHover={{ backgroundColor: 'var(--s3)' }}
                      className="border-b border-[var(--bd1)] cursor-pointer transition-colors"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{r.code}</td>
                      <td className="px-5 py-3 font-medium">{r.name}</td>
                      <td className="px-5 py-3 font-mono text-xs">{r.int}/40</td>
                      <td className="px-5 py-3 font-mono text-xs">{r.ext}/60</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold">{r.total}/100</span>
                          <ProgressBar value={r.total} color={r.total >= 80 ? 'var(--color-green)' : r.total >= 60 ? 'var(--color-amber)' : 'var(--color-red)'} className="w-12" />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <motion.span
                          className={`inline-block rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${gradeColor(r.grade)}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.06, type: 'spring' }}
                        >
                          {r.grade}
                        </motion.span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-[var(--t2)]">{r.pts}</td>
                    </motion.tr>
                  ))}
                  {sorted.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No results available for this semester</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
