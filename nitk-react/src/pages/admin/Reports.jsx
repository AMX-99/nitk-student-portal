import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as adminApi from '../../services/adminApi';
import { LoadingState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';

const deptColors = ['#4D9EFF', '#2DD4A0', '#F5B93E', '#FF6B35', '#9D7FEA', '#FF5C93', '#00C9A7'];
const catColors = ['#4D9EFF', '#2DD4A0', '#FF6B35', '#F5B93E', '#9D7FEA'];

export default function Reports() {
  const { data: stats, loading: statsLoading } = useApi(adminApi.getDashboardStats);
  const { data: deptDist, loading: deptLoading } = useApi(adminApi.getDeptDistribution);
  const { data: students, loading: studentsLoading } = useApi(() => adminApi.getStudents({ limit: 200 }));
  const { data: demands } = useApi(adminApi.getFeeDemands);
  const [year, setYear] = useState('2024-25');
  const [activeChart, setActiveChart] = useState('fee');

  const allStudents = students || [];
  const allDemands = demands || [];

  // Fee collection from real stats API
  const feeCollection = stats?.fee_collection || [];

  // Department enrollment from real dept-distribution API
  const deptEnrollment = (deptDist || []).map((d, i) => ({
    dept: d.code || d.department,
    count: d.count,
    color: deptColors[i % deptColors.length],
  }));

  // Category breakdown from real student data
  const catCounts = {};
  allStudents.forEach(s => {
    const cat = s.student_category || s.category || 'General';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const categoryEnrollment = Object.entries(catCounts).map(([name, value], i) => ({
    name, value, color: catColors[i % catColors.length],
  }));

  // Payment status from demands
  const paymentStatus = [
    { name: 'Paid', value: allDemands.filter(d => d.status === 'paid').length, color: '#2DD4A0' },
    { name: 'Pending', value: allDemands.filter(d => d.status !== 'paid').length, color: '#F5B93E' },
  ].filter(d => d.value > 0);

  // Semester-wise enrollment from real data
  const semCounts = {};
  allStudents.forEach(s => {
    const sem = s.current_semester || '?';
    semCounts[sem] = (semCounts[sem] || 0) + 1;
  });
  const semEnrollment = Object.entries(semCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([sem, count], i) => ({ sem: `Sem ${sem}`, count, color: deptColors[i % deptColors.length] }));

  const chartTabs = [
    { id: 'fee', label: '💰 Fee Collection' },
    { id: 'dept', label: '🏛️ Departments' },
    { id: 'category', label: '📊 Categories' },
    { id: 'semester', label: '🎓 Semesters' },
    { id: 'payment', label: '💳 Payment Status' },
  ];

  const loading = statsLoading || studentsLoading || deptLoading;
  if (loading && !stats) return <LoadingState message="Loading reports..." />;

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="flex items-center gap-3" variants={stagger.item}>
        <select value={year} onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none">
          <option>2024-25</option><option>2023-24</option>
        </select>
        <div className="flex gap-1.5">
          {chartTabs.map((t) => (
            <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveChart(t.id)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-all ${activeChart === t.id ? 'bg-orange text-white' : 'bg-[var(--s3)] text-[var(--t2)] hover:bg-[var(--s4)]'}`}>{t.label}</motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">{chartTabs.find((t) => t.id === activeChart)?.label}</h3>
            <Badge variant="blue">{year}</Badge>
          </CardHeader>
          <CardBody>
            <motion.div key={activeChart} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {activeChart === 'fee' && (
                feeCollection.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={feeCollection} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs><linearGradient id="rFeeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2DD4A0" stopOpacity={0.3} /><stop offset="95%" stopColor="#2DD4A0" stopOpacity={0.02} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="6 4" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} unit="L" /><Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="#2DD4A0" strokeWidth={2.5} fill="url(#rFeeGrad)" dot={{ r: 4, fill: '#2DD4A0', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="py-12 text-center text-[var(--t3)]">No fee collection data from API</p>
              )}

              {activeChart === 'dept' && (
                deptEnrollment.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={deptEnrollment} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="6 4" vertical={false} /><XAxis dataKey="dept" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>{deptEnrollment.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="py-12 text-center text-[var(--t3)]">No department data</p>
              )}

              {activeChart === 'category' && (
                <div className="flex items-center gap-8">
                  {categoryEnrollment.length > 0 && (
                    <>
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <Pie data={categoryEnrollment} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" startAngle={90} endAngle={-270} animationDuration={1200}>
                            {categoryEnrollment.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2.5">
                        {categoryEnrollment.map((c, i) => (
                          <motion.div key={c.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                            className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} /><span className="text-[var(--t2)]">{c.name}</span></div>
                            <span className="font-mono text-[11px] font-semibold">{c.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                  {categoryEnrollment.length === 0 && <p className="flex-1 py-12 text-center text-[var(--t3)]">No category data</p>}
                </div>
              )}

              {activeChart === 'semester' && (
                semEnrollment.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={semEnrollment} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="6 4" vertical={false} /><XAxis dataKey="sem" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>{semEnrollment.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="py-12 text-center text-[var(--t3)]">No semester data</p>
              )}

              {activeChart === 'payment' && (
                <div className="flex items-center gap-8">
                  {paymentStatus.length > 0 ? (
                    <>
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <Pie data={paymentStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" startAngle={90} endAngle={-270} animationDuration={1200}>
                            {paymentStatus.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-3">
                        {paymentStatus.map((s, i) => (
                          <motion.div key={s.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-sm" style={{ background: s.color }} /><span className="text-[var(--t2)]">{s.name}</span></div>
                            <span className="font-mono font-semibold">{s.value} demands</span>
                          </motion.div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-[var(--bd1)] text-[12px] text-[var(--t3)]">
                          Revenue: <span className="font-mono font-semibold text-green">{stats?.revenue || '—'}</span>
                          &nbsp;·&nbsp;Pending: <span className="font-mono font-semibold text-amber">{stats?.pending_fees || '—'}</span>
                        </div>
                      </div>
                    </>
                  ) : <p className="flex-1 py-12 text-center text-[var(--t3)]">No payment data</p>}
                </div>
              )}
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Summary stats row */}
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <Card><CardBody className="text-center">
          <p className="font-mono text-2xl font-bold text-blue">{allStudents.length}</p>
          <p className="text-[11px] text-[var(--t3)]">Total Students</p>
        </CardBody></Card>
        <Card><CardBody className="text-center">
          <p className="font-mono text-2xl font-bold text-green">{stats?.totalTeachers || '—'}</p>
          <p className="text-[11px] text-[var(--t3)]">Faculty Members</p>
        </CardBody></Card>
        <Card><CardBody className="text-center">
          <p className="font-mono text-2xl font-bold text-amber">{deptEnrollment.length}</p>
          <p className="text-[11px] text-[var(--t3)]">Departments</p>
        </CardBody></Card>
        <Card><CardBody className="text-center">
          <p className="font-mono text-2xl font-bold text-green">{stats?.revenue || '—'}</p>
          <p className="text-[11px] text-[var(--t3)]">Total Revenue</p>
        </CardBody></Card>
      </motion.div>
    </motion.div>
  );
}
