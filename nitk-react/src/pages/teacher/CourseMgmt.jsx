import { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody, Badge, Button, ProgressBar, StatCard } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as teacherApi from '../../services/teacherApi';
import { LoadingState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseMgmt({ setPage }) {
  const { data: courses, loading, refetch } = useApi(teacherApi.getCourses);
  const [selectedCourse, setSelectedCourse] = useState(0);
  const [progressValue, setProgressValue] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [showStudents, setShowStudents] = useState(false);

  const teacherCourses = (courses || []).map(c => ({
    id: c.id || c.course_id,
    code: c.code || c.course_code,
    name: c.name || c.course_name,
    students: c.studentCount || c.student_count || c.students || 0,
    credits: c.credits || 4,
    syllabus: c.syllabus_progress || c.progress || 0,
    section: c.section || 'A',
    semester: c.semester || 5,
    academic_year: c.academic_year || '2024-25',
    description: c.description || '',
  }));

  const active = teacherCourses[selectedCourse] || { id: '', code: '—', name: '—', students: 0, credits: 0, syllabus: 0 };

  // Fetch students for selected course
  const fetchStudents = useCallback(() => {
    if (!active.id) return Promise.resolve([]);
    return teacherApi.getCourseStudents(active.id, {
      academic_year: active.academic_year,
      semester: active.semester,
      section: active.section,
    });
  }, [active.id, active.section, active.semester, active.academic_year]);

  const { data: apiStudents, loading: studentsLoading } = useApi(fetchStudents, [active.id, active.section]);
  const students = apiStudents || [];

  // Fetch course details
  const fetchDetails = useCallback(() => {
    if (!active.id) return Promise.resolve(null);
    return teacherApi.getCourseDetails(active.id, {
      academic_year: active.academic_year,
      semester: active.semester,
      section: active.section,
    }).catch(() => null);
  }, [active.id, active.section, active.semester, active.academic_year]);

  const { data: courseDetail } = useApi(fetchDetails, [active.id]);

  const handleUpdateProgress = async () => {
    if (progressValue === null) return;
    setUpdatingProgress(true);
    try {
      await teacherApi.updateCourseProgress(active.id, {
        section: active.section,
        academic_year: active.academic_year,
        semester: active.semester,
        progress: Number(progressValue),
      });
      showToast(`Progress updated to ${progressValue}%!`, 'success');
      refetch();
    } catch (err) {
      showToast('Failed to update progress', 'error');
    } finally {
      setUpdatingProgress(false);
    }
  };

  if (loading) return <LoadingState message="Loading courses..." />;

  const currentProgress = progressValue !== null ? progressValue : active.syllabus;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-3 flex-wrap" variants={stagger.item}>
        {teacherCourses.map((c, i) => (
          <motion.button key={c.code + i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedCourse(i); setProgressValue(null); setShowStudents(false); }}
            className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition-all ${selectedCourse === i ? 'border-orange bg-orange/8' : 'border-[var(--bd1)] bg-[var(--s2)] hover:border-[var(--bd2)]'}`}>
            <span className="font-mono text-[11px] text-[var(--t3)]">{c.code}</span>
            <p className="text-[13px] font-semibold">{c.name}</p>
            <p className="mt-1 text-[11px] text-[var(--t3)]">{c.students} students · {c.credits} cr · Sec {c.section}</p>
          </motion.button>
        ))}
        {teacherCourses.length === 0 && <p className="text-[13px] text-[var(--t3)]">No courses assigned</p>}
      </motion.div>

      {teacherCourses.length > 0 && (
        <>
          <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
            <StatCard label="Course Code" value={active.code} sub={`Semester ${active.semester}`} color="var(--color-blue)" delay={0} animate={false} />
            <StatCard label="Students" value={String(active.students)} sub={`Section ${active.section}`} color="var(--color-green)" delay={0.05} />
            <StatCard label="Credits" value={String(active.credits)} sub={active.academic_year} color="var(--color-amber)" delay={0.1} />
            <StatCard label="Syllabus" value={`${active.syllabus}%`} sub="Completion" color="var(--color-purple)" delay={0.15} />
          </motion.div>

          <motion.div className="grid grid-cols-[1fr_340px] gap-5" variants={stagger.item}>
            <Card>
              <CardHeader>
                <h3 className="font-display text-[15px] font-bold">📊 Course Details — {active.code}</h3>
                <div className="flex gap-2">
                  <Badge variant="blue">Semester {active.semester}</Badge>
                  <Button small variant={showStudents ? 'ghost' : 'primary'} onClick={() => setShowStudents(!showStudents)}>
                    {showStudents ? '← Details' : `👥 Students (${students.length})`}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <AnimatePresence mode="wait">
                  {showStudents ? (
                    <motion.div key="students" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      {studentsLoading ? <LoadingState message="Loading students..." /> : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="border-b border-[var(--bd1)]">
                                {['#', 'Roll No.', 'Name', 'Email'].map(h => (
                                  <th key={h} className="bg-[var(--s3)] px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((s, i) => (
                                <motion.tr key={s.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                  whileHover={{ backgroundColor: 'var(--s3)' }} className="border-b border-[var(--bd1)] transition-colors">
                                  <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--t3)]">{i + 1}</td>
                                  <td className="px-4 py-2.5 font-mono text-xs">{s.roll || s.roll_no || '—'}</td>
                                  <td className="px-4 py-2.5 font-medium">{s.name || '—'}</td>
                                  <td className="px-4 py-2.5 text-[12px] text-[var(--t2)]">{s.email || '—'}</td>
                                </motion.tr>
                              ))}
                              {students.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-[13px] text-[var(--t3)]">No students enrolled</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {[
                          { label: 'Course Name', value: active.name },
                          { label: 'Course Code', value: active.code },
                          { label: 'Total Students', value: (courseDetail?.total_course_students ?? active.students).toString() },
                          { label: 'Credits', value: active.credits.toString() },
                          { label: 'Section', value: active.section },
                          { label: 'Academic Year', value: active.academic_year },
                        ].map((item, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className="rounded-lg bg-[var(--s3)] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{item.label}</p>
                            <p className="mt-1 font-mono text-[14px] font-bold text-[var(--t1)]">{item.value}</p>
                          </motion.div>
                        ))}
                      </div>
                      {(courseDetail?.description || active.description) && (
                        <div className="mt-4 rounded-lg bg-[var(--s3)] p-3.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)] mb-1">Description</p>
                          <p className="text-[13px] text-[var(--t2)] leading-relaxed">{courseDetail?.description || active.description}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="font-display text-[15px] font-bold">📈 Syllabus Progress</h3></CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--t2)]">Completion</span>
                  <span className="font-mono font-semibold text-[var(--color-blue)]">{currentProgress}%</span>
                </div>
                <ProgressBar value={currentProgress} color="var(--color-blue)" />

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--t3)]">Update Progress</label>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={currentProgress}
                    onChange={e => setProgressValue(Number(e.target.value))}
                    className="w-full accent-[var(--color-orange)] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[var(--t3)]">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <Button variant="primary" className="w-full justify-center" onClick={handleUpdateProgress} disabled={updatingProgress || progressValue === null}>
                  {updatingProgress ? '⏳ Updating...' : `Save Progress (${currentProgress}%)`}
                </Button>

                <div className="space-y-1.5 border-t border-[var(--bd1)] pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">Quick Actions</p>
                  {[
                    { label: '📋 Mark Attendance', target: 'markatt' },
                    { label: '✏️ Enter Marks', target: 'entermarks' },
                  ].map((a, i) => (
                    <motion.div key={i} whileHover={{ x: 4 }}
                      onClick={() => setPage(a.target)}
                      className="rounded-md bg-[var(--s3)] px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-[var(--s4)] transition-colors">
                      {a.label}
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
