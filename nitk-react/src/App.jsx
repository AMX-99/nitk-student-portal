import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import AppShell from './components/AppShell';
import { AnimatePresence, motion } from 'framer-motion';
import { navDefs } from './data/constants';
import { ToastContainer } from './components/ui/animations';

function SuccessModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1001] flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <motion.div
            className="relative w-[90%] max-w-[380px] rounded-2xl border border-[var(--bd1)] bg-[var(--s2)] p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,.3)]"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 text-5xl">✅</div>
            <h3 className="font-display text-lg font-extrabold text-green">Payment Successful!</h3>
            <p className="mt-3 text-[13px] text-[var(--t2)]">Receipt No: <span className="font-mono text-[var(--t1)]">NITK-2025-00847</span></p>
            <p className="mb-4.5 text-[13px] text-[var(--t2)]">Amount Paid: <span className="font-mono font-semibold text-green">₹27,500</span></p>
            <button
              onClick={onClose}
              className="w-full cursor-pointer rounded-lg border border-green/20 bg-green/12 py-2 text-center text-[13px] font-semibold text-green transition-all hover:bg-green/20"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-4 text-4xl">🎓</div>
        <h2 className="mb-2 bg-gradient-to-r from-orange to-amber bg-clip-text font-display text-xl font-extrabold text-transparent">
          NITK Portal
        </h2>
        <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-[var(--s3)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange to-amber"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '50%' }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, user, role, loading, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('nitk-theme') || 'dark');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const activeRole = role || 'student';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nitk-theme', theme);
  }, [theme]);

  // When auth role changes, reset to that role's first page
  useEffect(() => {
    if (role) {
      const first = navDefs[role]?.find((n) => n.page);
      if (first) setPage(first.page);
    }
  }, [role]);

  // Expose success modal trigger globally for Fee page
  useEffect(() => {
    window.__showPaymentSuccess = () => setSuccessModalOpen(true);
    return () => { delete window.__showPaymentSuccess; };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  if (loading) return <LoadingScreen />;

  return (
    <>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AppShell
              role={activeRole}
              page={page}
              setPage={setPage}
              onLogout={handleLogout}
              onThemeToggle={toggleTheme}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <SuccessModal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)} />
      <ToastContainer />
    </>
  );
}
