import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const features = [
    { icon: '📊', color: 'var(--color-orange)', text: 'Real-time CGPA & Attendance Tracking' },
    { icon: '💳', color: 'var(--color-green)', text: 'Online Fee Payment with SC/ST Concessions' },
    { icon: '📅', color: 'var(--color-blue)', text: 'Timetable, Exam Schedules & Notice Board' },
    { icon: '👥', color: 'var(--color-purple)', text: 'Multi-role Access: Student, Teacher, Admin' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden px-15 py-15" style={{ background: 'var(--s1)' }}>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 40px, var(--bd1) 40px, var(--bd1) 41px),
                          repeating-linear-gradient(90deg, transparent, transparent 40px, var(--bd1) 40px, var(--bd1) 41px)`,
          }}
        />
        <motion.div className="relative z-10" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="mb-2.5 bg-gradient-to-r from-orange to-amber bg-clip-text font-display text-4xl font-extrabold text-transparent">
            NITK Portal
          </h1>
          <p className="max-w-[380px] text-[15px] leading-relaxed text-[var(--t2)]">
            NIT Kurukshetra — Student Information Management System. Access your academics, attendance, fees, and more from one unified portal.
          </p>
          <div className="mt-8 space-y-3.5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2.5 text-[13px] text-[var(--t2)]"
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-base"
                  style={{ background: `color-mix(in srgb, ${f.color} 12%, transparent)`, color: f.color }}
                >
                  {f.icon}
                </span>
                {f.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-10">
        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-extrabold">Welcome Back</h2>
          <p className="mb-6 mt-1.5 text-[13px] text-[var(--t2)]">Sign in to access your portal</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-red/20 bg-red/8 px-4 py-2.5 text-[12.5px] text-red"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1.5 block text-[11.5px] font-medium uppercase tracking-wide text-[var(--t3)]">Email</label>
              <input
                type="email"
                placeholder="e.g. rahul@nitkkr.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3.5 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none transition-colors focus:border-orange"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-[11.5px] font-medium uppercase tracking-wide text-[var(--t3)]">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-3.5 py-2.5 font-body text-[13px] text-[var(--t1)] outline-none transition-colors focus:border-orange"
                disabled={loading}
              />
            </div>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--t2)]">
                <input type="checkbox" defaultChecked className="accent-orange" /> Remember me
              </label>
              <a href="#" className="text-[12px] text-blue" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-lg bg-gradient-to-br from-orange to-[#ff8c5a] py-3 text-center text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,107,53,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(255,107,53,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
          <p className="mt-4.5 text-center text-[11px] text-[var(--t3)]">NIT Kurukshetra © 2025 · Academic Portal v2.1</p>
        </motion.div>
      </div>
    </div>
  );
}
