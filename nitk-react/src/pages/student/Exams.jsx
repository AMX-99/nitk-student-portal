import { useState } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, LiveCountdown, PulseDot } from '../../components/ui/animations';
import { motion } from 'framer-motion';

export default function Exams() {
  const { data: apiExams, loading, error, refetch } = useApi(() => commonApi.getExamSchedule().catch(() => []));
  const [expandedExam, setExpandedExam] = useState(null);

  const exams = (apiExams || []).map(e => ({
    date: e.exam_date ? new Date(e.exam_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '',
    day: e.exam_date ? new Date(e.exam_date).toLocaleDateString('en-IN', { weekday: 'short' }) : '',
    time: `${e.start_time || '09:00'}–${e.end_time || '12:00'}`,
    subj: `${e.course?.code || ''} ${e.course?.name || ''}`,
    room: e.room || '—',
    seat: e.seat || '—',
    type: e.exam_type || 'Theory',
    isoDate: e.exam_date,
    startTime: e.start_time || '09:00',
  }));

  const getStatus = (isoDate) => {
    if (!isoDate) return { label: 'Upcoming', variant: 'green' };
    const examDate = new Date(isoDate);
    const now = new Date();
    const diff = Math.ceil((examDate - now) / 86400000);
    if (diff <= 0) return { label: 'Done', variant: 'grey' };
    if (diff <= 3) return { label: 'Imminent', variant: 'red' };
    if (diff <= 7) return { label: 'This Week', variant: 'amber' };
    return { label: 'Upcoming', variant: 'green' };
  };

  const parseExamDate = (isoDate, startTime) => {
    if (!isoDate) return new Date().toISOString();
    return `${isoDate.split('T')[0]}T${startTime}:00`;
  };

  const theoryCount = exams.filter(e => e.type === 'Theory').length;
  const labCount = exams.filter(e => e.type !== 'Theory').length;

  if (loading) return <LoadingState message="Loading exam schedule..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Total Exams" value={String(exams.length)} sub="This semester" color="var(--color-blue)" delay={0} />
        <StatCard label="Theory" value={String(theoryCount)} sub="Written papers" color="var(--color-green)" delay={0.05} />
        <StatCard label="Lab/Practical" value={String(labCount)} sub="Practical exams" color="var(--color-amber)" delay={0.1} />
        <StatCard label="Starts" value={exams.length > 0 ? exams[0].date : '—'} sub={exams.length > 0 ? `${exams[0].day} · ${exams[0].time.split('–')[0]}` : 'No exams scheduled'} color="var(--color-red)" delay={0.15} animate={false} />
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📝 Exam Schedule</h3>
            <div className="flex items-center gap-2">
              <PulseDot color="var(--color-red)" />
              <span className="text-[11px] text-[var(--t3)]">Live Countdown</span>
            </div>
          </CardHeader>
          <CardBody className="space-y-2.5 p-4!">
            {exams.length === 0 && (
              <div className="py-8 text-center text-[13px] text-[var(--t3)]">No exams scheduled yet</div>
            )}
            {exams.map((e, i) => {
              const status = getStatus(e.isoDate);
              const isExpanded = expandedExam === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.005 }}
                  onClick={() => setExpandedExam(isExpanded ? null : i)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isExpanded ? 'border-orange/30 bg-orange/4' : 'border-[var(--bd1)] hover:border-[var(--bd2)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[var(--s3)]">
                        <span className="font-mono text-[11px] font-bold text-orange">{e.date.split(' ')[0]}</span>
                        <span className="text-[10px] text-[var(--t3)]">{e.date.split(' ')[1]}</span>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold">{e.subj}</h4>
                        <p className="mt-0.5 text-[11px] text-[var(--t3)]">{e.day} · {e.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <LiveCountdown targetDate={parseExamDate(e.isoDate, e.startTime)} />
                      <Badge variant={e.type !== 'Theory' ? 'amber' : 'green'}>{e.type}</Badge>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex gap-6 border-t border-[var(--bd1)] pt-3">
                      <div className="text-[12px]"><span className="text-[var(--t3)]">Room: </span><span className="font-mono font-semibold">{e.room}</span></div>
                      <div className="text-[12px]"><span className="text-[var(--t3)]">Seat: </span><span className="font-mono font-semibold">{e.seat}</span></div>
                      <div className="text-[12px]"><span className="text-[var(--t3)]">Duration: </span><span className="font-mono font-semibold">{e.type !== 'Theory' ? '2 hours' : '3 hours'}</span></div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-5" variants={stagger.item}>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">📋 Instructions</h3></CardHeader>
          <CardBody className="space-y-2.5">
            {[
              'Carry your hall ticket and college ID card to the exam hall.',
              'Arrive at least 15 minutes before the scheduled time.',
              'No electronic devices allowed inside the exam hall.',
              'Use only blue/black ink pens for writing answers.',
              'Hall tickets can be downloaded from the Fee Payment section.',
            ].map((text, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08, type: 'spring', damping: 20 }} className="flex items-start gap-2.5 text-[12.5px] text-[var(--t2)]">
                <motion.span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.08, type: 'spring' }} />
                {text}
              </motion.div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">🏫 Exam Venues</h3></CardHeader>
          <CardBody className="space-y-2.5">
            {[
              { room: 'LH-301', building: 'Lecture Hall Complex', floor: '3rd Floor', capacity: 120 },
              { room: 'LH-302', building: 'Lecture Hall Complex', floor: '3rd Floor', capacity: 100 },
              { room: 'LH-303', building: 'Lecture Hall Complex', floor: '3rd Floor', capacity: 80 },
              { room: 'Lab-4', building: 'CS Department', floor: '2nd Floor', capacity: 40 },
            ].map((v, i) => (
              <motion.div key={v.room} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }} whileHover={{ x: 4 }} className="flex items-center justify-between rounded-lg px-3.5 py-2.5 transition-colors hover:bg-[var(--s4)]" style={{ background: 'var(--s3)' }}>
                <div><span className="font-mono text-[12px] font-semibold">{v.room}</span><span className="ml-2 text-[11.5px] text-[var(--t2)]">{v.building} · {v.floor}</span></div>
                <Badge variant="grey">{v.capacity} seats</Badge>
              </motion.div>
            ))}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
