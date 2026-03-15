import { StatCard, Card, CardHeader, CardBody, Badge } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, PulseDot } from '../../components/ui/animations';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';

const deptColors = ['#4D9EFF', '#2DD4A0', '#F5B93E', '#FF6B35', '#9D7FEA'];
const catColors = ['#4D9EFF', '#2DD4A0', '#FF6B35', '#F5B93E', '#9D7FEA'];

export default function AdminDashboard() {
  const { data: stats, loading: statsLoading, error: statsError } = useApi(adminApi.getDashboardStats);
  const { data: studentsData, loading: studentsLoading } = useApi(() => adminApi.getStudents({ limit: 50 }));
  const { data: teachersData } = useApi(() => adminApi.getTeachers({ limit: 50 }));
  const { data: demandsData } = useApi(() => adminApi.getAllDemands({ limit: 5 }));

  const students = (studentsData?.data || studentsData || []);
  const teachers = (teachersData?.data || teachersData || []);
  const demands = (demandsData?.data || demandsData || []);

  // Build department enrollment from API data
  const deptCounts = {};
  students.forEach(s => {
    const dept = s.department?.code || s.department_code || 'Other';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const deptEnrollment = Object.entries(deptCounts).map(([dept, count], i) => ({ dept, count, color: deptColors[i % deptColors.length] }));

  // Category enrollment
  const catCounts = {};
  students.forEach(s => {
    const cat = s.category || 'General';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const categoryEnrollment = Object.entries(catCounts).map(([name, value], i) => ({ name, value, color: catColors[i % catColors.length] }));

  const feeCollection = stats?.fee_collection || [];

  // Derived recent activity
  const recentActions = [
    ...students.slice(0, 3).map(s => ({
      text: `New student enrolled: ${s.name || `${s.first_name} ${s.last_name}`}`,
      time: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recently',
      icon: '🎓'
    })),
    ...demands.slice(0, 2).map(d => ({
      text: `Demand ${d.status}: ₹${(d.total_amount/1000).toFixed(1)}K for ${d.students?.name || 'Student'}`,
      time: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recently',
      icon: '💰'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const loading = statsLoading || studentsLoading;
  if (loading && !stats) return <LoadingState message="Loading admin dashboard..." />;
  if (statsError) return <ErrorState message={statsError} />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Total Students" value={String(stats?.totalStudents || students.length)} sub="Active enrollments" color="var(--color-blue)" delay={0} />
        <StatCard label="Faculty" value={String(stats?.totalTeachers || teachers.length)} sub={`Across ${deptEnrollment.length} departments`} color="var(--color-green)" delay={0.05} />
        <StatCard label="Revenue" value={stats?.revenue || '₹0'} sub="This semester" color="var(--color-amber)" delay={0.1} />
        <StatCard label="Pending Fees" value={stats?.pending_fees || '₹0'} sub={stats?.pending_count ? `${stats.pending_count} students` : '—'} color="var(--color-red)" delay={0.15} />
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_1fr] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">🎓 Department Enrollment</h3><Badge variant="blue">Current</Badge></CardHeader>
          <CardBody>
            {deptEnrollment.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptEnrollment} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="6 4" vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
                    {deptEnrollment.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="py-8 text-center text-[13px] text-[var(--t3)]">No enrollment data</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">💰 Fee Collection Trend</h3><Badge variant="green">Recent</Badge></CardHeader>
          <CardBody>
            {feeCollection.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={feeCollection} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4A0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2DD4A0" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="L" />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="#2DD4A0" strokeWidth={2.5} fill="url(#feeGrad)" dot={{ r: 4, fill: '#2DD4A0', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="py-8 text-center text-[13px] text-[var(--t3)]">No collection data yet</p>}
          </CardBody>
        </Card>
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_340px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader><h3 className="font-display text-[15px] font-bold">📊 Category-wise Enrollment</h3></CardHeader>
          <CardBody>
            <div className="flex items-center gap-8">
              {categoryEnrollment.length > 0 ? (
                <>
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={categoryEnrollment} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} animationDuration={1200}>
                        {categoryEnrollment.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2.5">
                    {categoryEnrollment.map((c, i) => (
                      <motion.div key={c.name} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} whileHover={{ x: 4 }}
                        className="flex cursor-pointer items-center justify-between text-[12.5px] rounded-md px-2 py-1 transition-colors hover:bg-[var(--s3)]">
                        <div className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-sm" style={{ background: c.color }} /><span className="text-[var(--t2)]">{c.name}</span></div>
                        <span className="font-mono text-[11px] font-semibold">{c.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : <p className="flex-1 text-center text-[13px] text-[var(--t3)]">No data available</p>}
            </div>
          </CardBody>
        </Card>

        
      </motion.div>
    </motion.div>
  );
}
