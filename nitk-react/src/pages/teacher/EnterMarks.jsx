import { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as teacherApi from '../../services/teacherApi';
import { LoadingState } from '../../components/ui/StateDisplays';
import { showToast, stagger } from '../../components/ui/animations';
import { motion } from 'framer-motion';

export default function EnterMarks() {
  const { data: courses, loading: coursesLoading } = useApi(teacherApi.getCourses);
  const [courseIdx, setCourseIdx] = useState(0);
  const [section, setSection] = useState(null);
  const [marks, setMarks] = useState({});
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const teacherCourses = courses || [];
  const selectedCourse = teacherCourses[courseIdx] || {};
  const courseId = selectedCourse?.course_id || selectedCourse?.id || '';

  // Set section from the teacher's actual course assignment whenever courses or courseIdx change
  useEffect(() => {
    if (teacherCourses.length > 0) {
      setSection(teacherCourses[courseIdx]?.section || teacherCourses[0]?.section || null);
    }
  }, [courses, courseIdx]);

  const fetchStudents = useCallback(() => {
    if (!courseId || !section || !selectedCourse?.academic_year) return Promise.resolve([]);
    return teacherApi.getCourseStudents(courseId, {
      academic_year: selectedCourse.academic_year,
      semester: selectedCourse.semester,
      section,
    });
  }, [courseId, section, selectedCourse?.academic_year, selectedCourse?.semester]);

  const { data: apiStudents, loading: studentsLoading } = useApi(fetchStudents, [courseId, section, selectedCourse?.academic_year, selectedCourse?.semester]);
  const students = apiStudents || [];

  const maxInt = 40;
  const maxExt = 60;

  const updateMark = (id, field, value) => {
    const max = field === 'int' ? maxInt : maxExt;
    const num = value === '' ? '' : Math.min(Math.max(0, Number(value)), max);
    setMarks((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: num } }));
    setSaved(false);
    setErrors((prev) => { const next = { ...prev }; delete next[`${id}-${field}`]; return next; });
  };

  const validate = () => {
    const newErrors = {};
    let hasEmpty = false;
    students.forEach((s, i) => {
      const id = s.roll_no || s.id || `idx-${i}`;
      const m = marks[id] || {};
      if (m.int === '' || m.int === undefined) { hasEmpty = true; newErrors[`${id}-int`] = true; }
      if (m.ext === '' || m.ext === undefined) { hasEmpty = true; newErrors[`${id}-ext`] = true; }
    });
    setErrors(newErrors);
    return !hasEmpty;
  };

  const handleSubmit = async () => {
    if (!validate()) { showToast('Please fill all marks before submitting', 'error'); return; }
    setSubmitting(true);
    try {
      const marksData = students.map((s, i) => {
        const id = s.roll_no || s.id || `idx-${i}`;
        const m = marks[id] || {};
        const internal = Number(m.int) || 0;
        const external = Number(m.ext) || 0;
        const total = internal + external;
        const maxTotal = maxInt + maxExt;
        const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
        const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 65 ? 'B' : pct >= 50 ? 'C' : 'F';
        const grade_points = grade === 'A+' ? 10 : grade === 'A' ? 9 : grade === 'B' ? 8 : grade === 'C' ? 6 : 0;

        return {
          student_id: s.id,
          internal_marks: internal,
          external_marks: external,
          total_marks: total,
          grade,
          grade_points
        };
      });
      await teacherApi.enterMarks({
        course_id: courseId,
        academic_year: selectedCourse.academic_year,
        semester: selectedCourse.semester,
        section,
        marks: marksData,
      });
      setSaved(true);
      showToast('Marks saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save marks', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filledCount = students.filter((s, i) => { const m = marks[s.roll_no || s.id || `idx-${i}`] || {}; return m.int !== '' && m.int !== undefined && m.ext !== '' && m.ext !== undefined; }).length;

  if (coursesLoading) return <LoadingState message="Loading courses..." />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-4" variants={stagger.item}>
        <select value={courseIdx} onChange={(e) => { setCourseIdx(Number(e.target.value)); setMarks({}); setSaved(false); }}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          {teacherCourses.map((c, i) => (
            <option key={i} value={i}>{c.code || c.course_code} · {c.name || c.course_name}</option>
          ))}
        </select>
        <select value={section} onChange={(e) => { setSection(e.target.value); setMarks({}); setSaved(false); }}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          <option value="A">Section A</option><option value="B">Section B</option>
        </select>
        <div className="flex-1" />
        <Badge variant={filledCount === students.length ? 'green' : 'amber'}>{filledCount}/{students.length} filled</Badge>
        <Badge variant="blue">Max: {maxInt} + {maxExt} = {maxInt + maxExt}</Badge>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">✏️ Enter Marks — {selectedCourse?.code || selectedCourse?.course_code || ''}</h3>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            {studentsLoading ? <LoadingState message="Loading students..." /> : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--bd1)]">
                    {['#', 'Roll No.', 'Name', `Internal (/${maxInt})`, `External (/${maxExt})`, 'Total', 'Grade'].map((h) => (
                      <th key={h} className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const id = s.roll_no || s.id || `idx-${i}`;
                    const m = marks[id] || {};
                    const intVal = m.int === '' || m.int === undefined ? 0 : Number(m.int);
                    const extVal = m.ext === '' || m.ext === undefined ? 0 : Number(m.ext);
                    const total = intVal + extVal;
                    const maxTotal = maxInt + maxExt;
                    const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                    const hasMarks = m.int !== '' && m.int !== undefined;
                    const grade = !hasMarks ? '—' : pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 65 ? 'B' : pct >= 50 ? 'C' : 'F';
                    return (
                      <motion.tr key={id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className={`border-b border-[var(--bd1)] transition-colors ${grade === 'F' ? 'bg-red/4' : 'hover:bg-[var(--s3)]'}`}>
                        <td className="px-5 py-3 font-mono text-[11px] text-[var(--t3)]">{i + 1}</td>
                        <td className="px-5 py-3 font-mono text-xs">{s.roll_no || '—'}</td>
                        <td className="px-5 py-3 font-medium">{s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim()}</td>
                        <td className="px-5 py-2">
                          <input type="number" min="0" max={maxInt} value={m.int ?? ''} onChange={(e) => updateMark(id, 'int', e.target.value)}
                            className={`w-[70px] rounded-md border px-2.5 py-1.5 font-mono text-[12px] text-[var(--t1)] outline-none transition-colors ${errors[`${id}-int`] ? 'border-red bg-red/5' : 'border-[var(--bd2)] bg-[var(--s3)] focus:border-orange'}`} />
                        </td>
                        <td className="px-5 py-2">
                          <input type="number" min="0" max={maxExt} value={m.ext ?? ''} onChange={(e) => updateMark(id, 'ext', e.target.value)}
                            className={`w-[70px] rounded-md border px-2.5 py-1.5 font-mono text-[12px] text-[var(--t1)] outline-none transition-colors ${errors[`${id}-ext`] ? 'border-red bg-red/5' : 'border-[var(--bd2)] bg-[var(--s3)] focus:border-orange'}`} />
                        </td>
                        <td className="px-5 py-3 font-mono text-xs font-semibold">{hasMarks ? <motion.span key={total} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>{total}</motion.span> : '—'}</td>
                        <td className="px-5 py-3"><Badge variant={grade === 'A+' ? 'green' : grade === 'A' ? 'blue' : grade === 'B' ? 'amber' : grade === 'F' ? 'red' : 'grey'}>{grade}</Badge></td>
                      </motion.tr>
                    );
                  })}
                  {students.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No students found</td></tr>}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="flex items-center justify-between" variants={stagger.item}>
        <p className="text-[12px] text-[var(--t3)]">{saved ? '✅ Marks saved successfully' : `${filledCount}/${students.length} students filled.`}</p>
        <div className="flex gap-2.5">
          <Button variant={saved ? 'success' : 'primary'} onClick={handleSubmit} disabled={submitting || students.length === 0}>
            {submitting ? '⏳ Saving...' : saved ? '✓ Saved' : 'Submit Marks →'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
