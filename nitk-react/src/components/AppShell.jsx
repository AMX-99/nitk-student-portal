import { navDefs } from '../data/constants';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui';
import { AnimatePresence, motion } from 'framer-motion';

// Student pages
import StudentDashboard from '../pages/student/Dashboard';
import Attendance from '../pages/student/Attendance';
import Results from '../pages/student/Results';
import Fees from '../pages/student/Fees';
import Notices from '../pages/student/Notices';
import Timetable from '../pages/student/Timetable';
import Exams from '../pages/student/Exams';
import Directory from '../pages/student/Directory';
import StudentProfile from '../pages/student/Profile';
import StudentComplaints from '../pages/student/Complaints';
// Teacher pages
import TeacherDashboard from '../pages/teacher/Dashboard';
import MarkAttendance from '../pages/teacher/MarkAttendance';
import EnterMarks from '../pages/teacher/EnterMarks';
import Gradebook from '../pages/teacher/Gradebook';
import PostNotice from '../pages/teacher/PostNotice';
import CourseMgmt from '../pages/teacher/CourseMgmt';
import TeacherProfile from '../pages/teacher/Profile';
// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminStudents from '../pages/admin/Students';
import AdminTeachers from '../pages/admin/Teachers';
import AdminDepartments from '../pages/admin/Departments';
import AdminCourses from '../pages/admin/Courses';
import AdminExams from '../pages/admin/Exams';
import AdminTimetable from '../pages/admin/Timetable';
import FeeStructures from '../pages/admin/FeeStructures';
import Demands from '../pages/admin/Demands';
import Reports from '../pages/admin/Reports';
import AdminComplaints from '../pages/admin/Complaints';
import AdminNotices from '../pages/admin/Notices';
import AdminProfile from '../pages/admin/Profile';

const pageMap = {
  dashboard: StudentDashboard, attendance: Attendance, results: Results,
  fees: Fees, notices: Notices, timetable: Timetable, exams: Exams,
  directory: Directory, sprofile: StudentProfile, scomplaints: StudentComplaints,
  tdashboard: TeacherDashboard, markatt: MarkAttendance, entermarks: EnterMarks,
  gradebook: Gradebook, postnotice: PostNotice, coursemgmt: CourseMgmt, tprofile: TeacherProfile,
  ttimetable: Timetable, tnotices: Notices, tdirectory: Directory,
  adashboard: AdminDashboard, astudents: AdminStudents, ateachers: AdminTeachers,
  adepts: AdminDepartments, acourses: AdminCourses, aexams: AdminExams, atimetable: AdminTimetable,
  feestructs: FeeStructures, demands: Demands, reports: Reports,
  acomplaints: AdminComplaints, anotices: AdminNotices, aprofile: AdminProfile,
};

export default function AppShell({ role, page, setPage, onLogout, onThemeToggle, theme }) {
  const { profile, user } = useAuth();

  // Build user display info from profile or user metadata
  const userName = profile?.name || user?.user_metadata?.name || 'User';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const roleColors = { student: 'var(--color-orange)', teacher: 'var(--color-blue)', admin: 'var(--color-purple)' };
  const roleSubs = {
    student: profile?.department?.code ? `Student · ${profile.department.code}` : 'Student',
    teacher: profile?.department_code ? `${profile.designation || 'Faculty'} · ${profile.department_code}` : 'Faculty',
    admin: 'Accounts & Records',
  };

  const displayUser = {
    name: userName,
    initials,
    sub: roleSubs[role] || role,
    color: roleColors[role] || 'var(--color-orange)',
    src: profile?.profile_pic || null,
  };

  const navItems = navDefs[role];
  const PageComponent = pageMap[page] || StudentDashboard;
  const activeNav = navItems.find((n) => n.page === page);
  const pageLabel = activeNav?.label || 'Dashboard';

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex h-screen w-[222px] shrink-0 flex-col border-r border-[var(--bd1)] bg-[var(--s1)]">
        <div className="flex items-center gap-2.5 border-b border-[var(--bd1)] px-5 py-4">
          <span className="text-[22px]">🎓</span>
          <h2 className="bg-gradient-to-r from-orange to-amber bg-clip-text font-display text-[15px] font-extrabold text-transparent">NITK</h2>
        </div>
        <div className="flex items-center gap-2.5 border-b border-[var(--bd1)] px-5 py-4">
          <Avatar initials={displayUser.initials} color={displayUser.color} size="md" src={displayUser.src} />
          <div>
            <div className="text-[13px] font-semibold">{displayUser.name}</div>
            <div className="text-[10.5px] text-[var(--t3)]">{displayUser.sub}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2.5">
          {navItems.map((item, i) => {
            if (item.section) return (
              <div key={i} className="px-5 pb-1.5 pt-4.5 text-[9.5px] font-semibold uppercase tracking-[1.2px] text-[var(--t3)]">
                {item.section}
              </div>
            );
            const isActive = page === item.page;
            return (
              <a
                key={item.id}
                onClick={() => setPage(item.page)}
                className={`flex cursor-pointer items-center gap-2.5 border-l-3 px-5 py-2.5 text-[13px] transition-all ${
                  isActive
                    ? 'border-l-orange bg-orange/6 text-orange'
                    : 'border-l-transparent text-[var(--t2)] hover:bg-[var(--s3)] hover:text-[var(--t1)]'
                }`}
              >
                {item.icon} <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="border-t border-[var(--bd1)] px-5 py-3">
          <button
            onClick={onLogout}
            className="w-full cursor-pointer rounded-lg border border-red/15 bg-red/8 py-2 text-[12px] font-semibold text-red transition-all hover:bg-red/15"
          >
            ↩ Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[54px] shrink-0 items-center gap-4 border-b border-[var(--bd1)] bg-[var(--s1)] px-5.5">
          <span className="font-display text-base font-bold">{pageLabel}</span>
          <span className="text-[11px] text-[var(--t3)]">/ {pageLabel}</span>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Search directory..."
            className="w-[200px] rounded-lg border border-[var(--bd1)] bg-[var(--s3)] px-3.5 py-1.5 font-body text-[12px] text-[var(--t1)] outline-none focus:border-orange"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                const targetPage = role === 'admin' ? 'adashboard' : (role === 'teacher' ? 'tdirectory' : 'directory');
                // Admins do not have a separate 'directory' page right now. They'll just go to dashboard, 
                // but let's route admin to 'astearch' or just bypass.
                // Wait, based on pageMap, directory is `directory` for student, `tdirectory` for teacher.
                // For admin let's just use `astudents` or ignore based on role.
                const navTo = role === 'student' ? 'directory' : (role === 'teacher' ? 'tdirectory' : 'astudents');
                if (page !== navTo) setPage(navTo);
                
                // Dispatch custom event to let Directory component know
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('global:search', { detail: e.target.value }));
                  e.target.value = ''; // clear input after dispatching
                }, 50);
              }
            }}
          />
          <button
            onClick={onThemeToggle}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--bd1)] bg-[var(--s3)] text-[15px] text-[var(--t2)] transition-all hover:bg-[var(--s4)] hover:text-[var(--t1)]"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <PageComponent setPage={setPage} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
