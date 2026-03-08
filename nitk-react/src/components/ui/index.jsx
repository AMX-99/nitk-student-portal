import { motion } from 'framer-motion';
import { AnimatedCounter } from './animations';

export function StatCard({ label, value, sub, color, delay = 0, animate = true }) {
  const numMatch = typeof value === 'string' ? value.match(/([₹]?)(\d[\d,.]*)(\S*)/) : null;
  const prefix = numMatch ? numMatch[1] : '';
  const numVal = numMatch ? parseFloat(numMatch[2].replace(/,/g, '')) : null;
  const suffix = numMatch ? numMatch[3] : '';
  const decimals = numMatch && numMatch[2].includes('.') ? (numMatch[2].split('.')[1] || '').length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, borderColor: 'var(--bd2)', boxShadow: `0 8px 30px color-mix(in srgb, ${color} 15%, transparent)` }}
      className="relative overflow-hidden rounded-xl border border-[var(--bd1)] bg-[var(--s2)] p-5 transition-shadow"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <motion.div
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-[25px]"
        style={{ background: color }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.16, scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.6 }}
      />
      <div className="text-[10.5px] font-semibold uppercase tracking-[1.2px] text-[var(--t3)]">{label}</div>
      <div className="mt-1.5 font-display text-[30px] font-extrabold leading-tight" style={{ color }}>
        {animate && numVal !== null ? (
          <AnimatedCounter value={numVal} prefix={prefix} suffix={suffix} decimals={decimals} duration={1.2 + delay} />
        ) : value}
      </div>
      {sub && (
        <motion.div
          className="mt-1 text-[11.5px] text-[var(--t2)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4, duration: 0.4 }}
        >{sub}</motion.div>
      )}
    </motion.div>
  );
}

export function Badge({ variant = 'grey', children, className = '' }) {
  const variants = {
    green: 'bg-green/12 text-green',
    red: 'bg-red/12 text-red',
    amber: 'bg-amber/12 text-amber',
    blue: 'bg-blue/12 text-blue',
    orange: 'bg-orange/12 text-orange',
    purple: 'bg-purple/12 text-purple',
    grey: 'bg-[var(--s3)] text-[var(--t2)]',
  };
  return (
    <span className={`inline-flex items-center rounded-[5px] px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function GradeBadge({ grade }) {
  const cls = {
    'A+': 'bg-green/15 text-green',
    A: 'bg-blue/15 text-blue',
    B: 'bg-amber/15 text-amber',
    C: 'bg-orange/15 text-orange',
    F: 'bg-red/15 text-red',
  };
  return (
    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-[7px] font-mono text-[11px] font-bold ${cls[grade] || cls.F}`}>
      {grade}
    </span>
  );
}

export function ProgressBar({ value, color, animate = true, className = '' }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-[var(--s3)] ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={animate ? { width: 0 } : { width: `${value}%` }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function Avatar({ initials, color, size = 'md', className = '', src }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-xl', xl: 'h-[72px] w-[72px] text-[26px]' };
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white overflow-hidden ${sizes[size]} ${className}`}
      style={{ background: src ? 'var(--s3)' : color }}
    >
      {src ? (
        <img src={src} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

export function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      className={`rounded-xl border border-[var(--bd1)] bg-[var(--s2)] transition-all ${hover ? 'hover:border-[var(--bd2)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : ''} ${className}`}
      style={{ boxShadow: 'var(--card-shadow)' }}
      whileHover={hover ? { y: -1 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-2.5 border-b border-[var(--bd1)] px-5 py-3.5 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, small = false, className = '' }) {
  return <div className={`${small ? 'px-4.5 py-3' : 'p-5'} ${className}`}>{children}</div>;
}

export function Button({ variant = 'primary', small = false, children, className = '', ...props }) {
  const base = 'inline-flex items-center gap-1.5 rounded-lg font-body font-semibold transition-all cursor-pointer border-none';
  const sizes = small ? 'px-3 py-1.5 text-[11.5px] rounded-md' : 'px-4.5 py-2 text-[13px]';
  const variants = {
    primary: 'bg-gradient-to-br from-orange to-[#ff8c5a] text-white shadow-[0_4px_16px_rgba(255,107,53,0.25)] hover:shadow-[0_6px_24px_rgba(255,107,53,0.35)] hover:-translate-y-0.5',
    ghost: 'bg-[var(--s3)] text-[var(--t1)] border border-[var(--bd2)] hover:border-[var(--bd3)] hover:bg-[var(--s4)]',
    success: 'bg-green/12 text-green border border-green/20 hover:bg-green/20',
    danger: 'bg-red/12 text-red border border-red/20 hover:bg-red/20',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Toggle({ on, onToggle }) {
  return (
    <div className={`toggle-switch ${on ? 'on' : ''}`} onClick={onToggle}>
      <div className="knob" />
    </div>
  );
}

export function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[500px] rounded-2xl border border-[var(--bd1)] bg-[var(--s1)] shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--bd1)] px-6 py-4">
              <h3 className="font-display text-[17px] font-bold">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[var(--s3)] transition-colors">
                <span className="block h-5 w-5 rotate-45 text-2xl leading-[18px]">+</span>
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Ensure AnimatePresence is imported
import { AnimatePresence } from 'framer-motion';
