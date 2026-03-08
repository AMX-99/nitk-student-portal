import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Animated Counter ──
// Counts from 0 to target value on mount
export function AnimatedCounter({ value, duration = 1.5, decimals = 0, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || isNaN(numVal)) return;
    hasRun.current = true;
    const start = performance.now();
    const step = (now) => {
      const elapsed = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - elapsed, 3); // easeOutCubic
      setDisplay(Number((eased * numVal).toFixed(decimals)));
      if (elapsed < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numVal, duration, decimals]);

  return <>{prefix}{display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

// ── Live Countdown ──
export function LiveCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  function getTimeLeft(target) {
    const diff = Math.max(0, new Date(target) - new Date());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };
  }

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.mins === 0 && timeLeft.secs === 0) {
    return <span className="font-mono text-green">Now!</span>;
  }

  return (
    <span className="font-mono text-[11px]">
      {timeLeft.days > 0 && <span className="text-orange">{timeLeft.days}d </span>}
      <span className="text-[var(--t2)]">{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.mins).padStart(2, '0')}:{String(timeLeft.secs).padStart(2, '0')}</span>
    </span>
  );
}

// ── Toast System ──
let toastId = 0;
const listeners = new Set();
let toasts = [];

function notifyListeners() {
  listeners.forEach((fn) => fn([...toasts]));
}

export function showToast(message, type = 'success', duration = 3000) {
  const id = ++toastId;
  toasts = [...toasts, { id, message, type }];
  notifyListeners();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, duration);
}

export function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: 'border-green/30 bg-green/10',
    error: 'border-red/30 bg-red/10',
    info: 'border-blue/30 bg-blue/10',
    warning: 'border-amber/30 bg-amber/10',
  };

  return (
    <div className="fixed top-4 right-4 z-[2000] flex flex-col gap-2.5">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`flex items-center gap-2.5 rounded-[10px] border px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,.15)] backdrop-blur-md ${colors[t.type]}`}
            style={{ background: 'color-mix(in srgb, var(--s2) 85%, transparent)' }}
          >
            <span className="text-base">{icons[t.type]}</span>
            <span className="text-[13px] font-medium text-[var(--t1)]">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Stagger Container ──
export const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } },
  itemX: { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } },
  fadeIn: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } },
};

// ── Sortable column hook ──
export function useSortable(data, defaultKey = null, defaultDir = 'asc') {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const toggle = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const va = a[sortKey], vb = b[sortKey];
    const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const indicator = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return { sorted, toggle, indicator, sortKey, sortDir };
}

// ── Sortable Table Header ──
export function SortHeader({ children, sortKey, onSort, indicator, className = '' }) {
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`cursor-pointer select-none bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)] transition-colors hover:text-[var(--t1)] ${className}`}
    >
      {children}{indicator(sortKey)}
    </th>
  );
}

// ── Pulse Dot ──
export function PulseDot({ color = 'var(--color-green)', size = 8 }) {
  return (
    <span className="relative inline-flex">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color, width: size, height: size }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="relative inline-flex rounded-full" style={{ background: color, width: size, height: size }} />
    </span>
  );
}

// ── Shimmer skeleton ──
export function Shimmer({ width = '100%', height = 20, className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-[var(--s3)] via-[var(--s4)] to-[var(--s3)] bg-[length:200%_100%] ${className}`}
      style={{ width, height }}
    />
  );
}
