import { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, Toggle } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as teacherApi from '../../services/teacherApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { showToast, stagger, PulseDot } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarkAttendance() {
  const { data: courses, loading: coursesLoading } = useApi(teacherApi.getCourses);
  const [courseIdx, setCourseIdx] = useState(0);
  const [section, setSection] = useState('A');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const teacherCourses = courses || [];
  const selectedCourse = teacherCourses[courseIdx] || teacherCourses[0] || {};
  const courseId = selectedCourse?.course_id || selectedCourse?.id || '';

  // Ensure initial section is correct when courses load
  useEffect(() => {
    if (teacherCourses.length > 0 && section === 'A' && teacherCourses[0].section) {
      setSection(teacherCourses[courseIdx]?.section || teacherCourses[0].section);
    }
  }, [courses]);

  const fetchStudents = useCallback(() => {
    if (!courseId) return Promise.resolve([]);
    return teacherApi.getCourseStudents(courseId, {
      academic_year: '2024-25',
      semester: selectedCourse?.semester || 5,
      section,
    });
  }, [courseId, section, selectedCourse?.semester]);

  const { data: apiStudents, loading: studentsLoading, error: studentsError } = useApi(fetchStudents, [courseId, section, selectedCourse?.semester]);
  const students = apiStudents || [];

  // Initialize attendance when students change
  if (students.length > 0 && Object.keys(attendance).length === 0) {
    const init = {};
    students.forEach((s, i) => {
      const sData = s.students || s.student || s;
      init[s.roll_no || sData.roll_no || s.id || `idx-${i}`] = true;
    });
    if (Object.keys(init).length > 0 && Object.keys(attendance).length !== Object.keys(init).length) {
      // defer setting state
      setTimeout(() => setAttendance(init), 0);
    }
  }

  const toggleStudent = (roll) => {
    setAttendance((prev) => ({ ...prev, [roll]: !prev[roll] }));
    setSubmitted(false);
  };

  const markAll = (val) => {
    const init = {};
    students.forEach((s, i) => {
      const sData = s.students || s.student || s;
      init[s.roll_no || sData.roll_no || s.id || `idx-${i}`] = val;
    });
    setAttendance(init);
    setSubmitted(false);
    showToast(val ? 'All students marked present' : 'All students marked absent', 'info');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const records = Object.entries(attendance).map(([roll, present]) => {
        const studentObj = students.find((s, i) => {
          const sData = s.students || s.student || s;
          return (s.roll_no || sData.roll_no || s.id || `idx-${i}`) === roll;
        });
        return {
          student_id: studentObj?.id,
          status: present ? 'P' : 'A',
        };
      }).filter(r => r.student_id);

      await teacherApi.markAttendance({
        course_id: courseId,
        academic_year: '2024-25',
        semester: selectedCourse?.semester || 5,
        section,
        date: dateStr,
        records,
      });
      setSubmitted(true);
      const presentCount = Object.values(attendance).filter(Boolean).length;
      showToast(`Attendance submitted: ${presentCount}/${students.length} present`, 'success');
    } catch (err) {
      showToast('Failed to submit attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  if (coursesLoading) return <LoadingState message="Loading courses..." />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-4" variants={stagger.item}>
        <select value={courseIdx} onChange={(e) => {
          const idx = Number(e.target.value);
          setCourseIdx(idx);
          setSection(teacherCourses[idx]?.section || 'A');
          setAttendance({});
          setSubmitted(false);
        }}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          {teacherCourses.map((c, i) => (
            <option key={i} value={i}>
              {c.code || c.course_code} · {c.name || c.course_name}
            </option>
          ))}
        </select>
        <select value={section} onChange={(e) => { setSection(e.target.value); setAttendance({}); setSubmitted(false); }}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          <option value="A">Section A</option>
          <option value="B">Section B</option>
        </select>
        <input type="date" value={dateStr} onChange={(e) => { setDateStr(e.target.value); setSubmitted(false); }}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-mono text-[13px] text-[var(--t1)] outline-none" />
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><PulseDot color="var(--color-green)" /><span className="font-mono text-[12px] text-green">{presentCount}</span></div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red" /><span className="font-mono text-[12px] text-red">{absentCount}</span></div>
        </div>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📋 Mark Attendance — {selectedCourse?.code || selectedCourse?.course_code || 'Select'}</h3>
            <div className="flex gap-2">
              <Button small variant="ghost" onClick={() => markAll(true)}>✓ All Present</Button>
              <Button small variant="ghost" onClick={() => markAll(false)}>✗ All Absent</Button>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            {studentsLoading ? (
              <LoadingState message="Loading students..." />
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--bd1)]">
                    {['#', 'Roll No.', 'Name', 'Status', 'Toggle'].map((h) => (
                      <th key={h} className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const sData = s.students || s.student || s;
                    const roll = s.roll_no || sData.roll_no || s.id || `idx-${i}`;
                    const displayRoll = s.roll_no || sData.roll_no || '—';
                    const displayName = s.name || sData.name || (sData.first_name ? `${sData.first_name} ${sData.last_name || ''}`.trim() : '');
                    return (
                      <motion.tr key={roll} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, type: 'spring', damping: 20 }}
                        className={`border-b border-[var(--bd1)] transition-all ${!attendance[roll] ? 'bg-red/5' : 'hover:bg-[var(--s3)]'}`}>
                        <td className="px-5 py-3 font-mono text-[11px] text-[var(--t3)]">{i + 1}</td>
                        <td className="px-5 py-3 font-mono text-xs">{displayRoll}</td>
                        <td className="px-5 py-3 font-medium">{displayName}</td>
                        <td className="px-5 py-3">
                          <AnimatePresence mode="wait">
                            <motion.div key={attendance[roll] ? 'P' : 'A'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                              <Badge variant={attendance[roll] ? 'green' : 'red'}>{attendance[roll] ? 'Present' : 'Absent'}</Badge>
                            </motion.div>
                          </AnimatePresence>
                        </td>
                        <td className="px-5 py-3"><Toggle on={attendance[roll]} onToggle={() => toggleStudent(roll)} /></td>
                      </motion.tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No students found for this course/section</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <motion.p className="text-[12px]" animate={{ color: submitted ? 'var(--color-green)' : 'var(--t3)' }}>
          {submitted ? '✅ Attendance submitted successfully' : `Review: ${presentCount} present, ${absentCount} absent.`}
        </motion.p>
        <Button variant={submitted ? 'success' : 'primary'} onClick={handleSubmit} disabled={submitting || students.length === 0}>
          {submitting ? '⏳ Submitting...' : submitted ? '✓ Submitted' : 'Submit Attendance →'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
