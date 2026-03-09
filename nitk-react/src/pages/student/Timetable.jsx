import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, PulseDot } from '../../components/ui/animations';
import { motion } from 'framer-motion';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const defaultSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

const courseColorPalette = [
  { bg: '#4D9EFF20', border: '#4D9EFF', text: '#4D9EFF' },
  { bg: '#FF6B3520', border: '#FF6B35', text: '#FF6B35' },
  { bg: '#2DD4A020', border: '#2DD4A0', text: '#2DD4A0' },
  { bg: '#F5B93E20', border: '#F5B93E', text: '#F5B93E' },
  { bg: '#9D7FEA20', border: '#9D7FEA', text: '#9D7FEA' },
  { bg: '#FF4F6D20', border: '#FF4F6D', text: '#FF4F6D' },
];

export default function Timetable() {
  const { data: apiSlots, loading, error, refetch } = useApi(() => commonApi.getTimetable().catch(() => []));
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const now = new Date();
  const todayIdx = Math.min(Math.max(now.getDay() - 1, 0), 4);
  const todayName = dayNames[todayIdx];

  // Build schedule from API data or use empty grid
  const slots = apiSlots || [];
  const courseColors = {};
  let colorIdx = 0;
  slots.forEach(s => {
    const code = s.course?.code || s.courses?.code || s.course_code || '';
    if (code && !courseColors[code]) {
      courseColors[code] = {
        ...courseColorPalette[colorIdx % courseColorPalette.length],
        name: s.course?.name || s.courses?.name || s.course_name || code,
      };
      colorIdx++;
    }
  });

  // Build grid schedule
  const schedule = {};
  dayNames.forEach((day, di) => { schedule[day] = new Array(7).fill(null); });
  slots.forEach(s => {
    const dayOfWeek = s.day_of_week;
    if (dayOfWeek >= 0 && dayOfWeek < 5) {
      const day = dayNames[dayOfWeek];
      const startHour = parseInt(s.start_time?.split(':')[0]);
      const slotIdx = defaultSlots.findIndex(sl => parseInt(sl) === startHour);
      if (slotIdx >= 0) {
        schedule[day][slotIdx] = s.course?.code || s.courses?.code || s.course_code || '';
      }
    }
  });

  // Add lunch at slot index 3
  dayNames.forEach(day => { schedule[day][3] = 'LUNCH'; });

  const totalClasses = Object.values(schedule).flat().filter((s) => s && s !== 'LUNCH').length;
  const todayClasses = schedule[todayName]?.filter((s) => s && s !== 'LUNCH').length || 0;

  if (loading) return <LoadingState message="Loading timetable..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const hasTimetableData = slots.length > 0;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-4" variants={stagger.item}>
        <div className="flex items-center gap-2">
          <PulseDot color="var(--color-green)" />
          <span className="text-[13px] font-semibold">{todayName}</span>
        </div>
        <Badge variant="blue">{todayClasses} classes today</Badge>
        <Badge variant="grey">{totalClasses} classes/week</Badge>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📅 Weekly Timetable</h3>
            <Badge variant="green">Current Semester</Badge>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            {!hasTimetableData ? (
              <div className="py-12 text-center text-[13px] text-[var(--t3)]">No timetable data available yet. Check back when timetable is published.</div>
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--bd1)]">
                    <th className="bg-[var(--s3)] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Day</th>
                    {defaultSlots.map((s) => (
                      <th key={s} className="bg-[var(--s3)] px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayNames.map((day, di) => {
                    const isToday = day === todayName;
                    return (
                      <motion.tr
                        key={day}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + di * 0.08, type: 'spring', damping: 20 }}
                        className={`border-b border-[var(--bd1)] ${isToday ? 'bg-orange/4' : ''}`}
                      >
                        <td className={`px-4 py-3 font-semibold whitespace-nowrap ${isToday ? 'text-orange' : 'text-[var(--t2)]'}`}>
                          {isToday && <PulseDot color="var(--color-orange)" size={6} />}{' '}
                          {day.slice(0, 3)}
                        </td>
                        {schedule[day].map((code, si) => {
                          const cellKey = `${day}-${si}`;
                          const isHovered = hoveredSlot === cellKey;
                          if (code === 'LUNCH') {
                            return <td key={si} className="px-2 py-2.5 text-center"><span className="text-[10px] text-[var(--t3)]">🍽 Lunch</span></td>;
                          }
                          if (!code) {
                            return <td key={si} className="px-2 py-2.5 text-center text-[var(--t3)]">—</td>;
                          }
                          const c = courseColors[code] || courseColorPalette[0];
                          return (
                            <td key={si} className="px-1.5 py-2">
                              <motion.div
                                onHoverStart={() => setHoveredSlot(cellKey)}
                                onHoverEnd={() => setHoveredSlot(null)}
                                whileHover={{ scale: 1.08, zIndex: 10 }}
                                className="cursor-pointer rounded-lg border px-2 py-2 text-center transition-colors"
                                style={{ background: c.bg, borderColor: isHovered ? c.border : 'transparent' }}
                              >
                                <span className="font-mono text-[10.5px] font-bold" style={{ color: c.text }}>{code}</span>
                                {isHovered && (
                                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-0.5 text-[9px]" style={{ color: c.text }}>
                                    {c.name}
                                  </motion.p>
                                )}
                              </motion.div>
                            </td>
                          );
                        })}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {Object.keys(courseColors).length > 0 && (
        <motion.div variants={stagger.item}>
          <Card>
            <CardHeader><h3 className="font-display text-[15px] font-bold">🎨 Course Legend</h3></CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-3">
                {Object.entries(courseColors).map(([code, c], i) => (
                  <motion.div
                    key={code}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.06, type: 'spring' }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
                    style={{ background: c.bg, borderColor: 'transparent' }}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.border }} />
                    <span className="font-mono text-[11px] font-semibold" style={{ color: c.text }}>{code}</span>
                    <span className="text-[11px] text-[var(--t2)]">{c.name}</span>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
