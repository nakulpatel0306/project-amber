import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  rightContent?: React.ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
};

const titleVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const rightVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, delay: 0.3 },
  },
};

export function PageBanner({ title, subtitle, icon: Icon, rightContent, className }: PageBannerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 mb-6',
        className
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Shimmer accent bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: 'var(--color-accent)', opacity: 0.5 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <motion.div
              variants={iconVariants}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
          <div>
            <motion.h1
              variants={titleVariants}
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                variants={subtitleVariants}
                className="text-sm mt-0.5"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
        {rightContent && (
          <motion.div variants={rightVariants} className="flex items-center gap-3 flex-shrink-0">
            {rightContent}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
