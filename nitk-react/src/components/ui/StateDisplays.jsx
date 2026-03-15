import { motion } from 'framer-motion';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="mb-4 h-8 w-8 rounded-full border-3 border-[var(--s3)] border-t-orange"
      />
      <p className="text-[13px] text-[var(--t3)]">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-3 text-4xl">⚠️</div>
      <p className="mb-2 text-[14px] font-semibold text-[var(--t1)]">Error</p>
      <p className="mb-4 text-[13px] text-[var(--t2)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="cursor-pointer rounded-lg border border-[var(--bd2)] bg-[var(--s3)] px-4 py-2 text-[12px] font-semibold text-[var(--t1)] transition-all hover:bg-[var(--s4)]"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'No data', message = 'No data available yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="mb-1 text-[14px] font-semibold text-[var(--t1)]">{title}</p>
      <p className="text-[13px] text-[var(--t2)]">{message}</p>
    </div>
  );
}
