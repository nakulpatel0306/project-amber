import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconNode?: React.ReactNode;
  rightContent?: React.ReactNode;
  belowSubtitle?: React.ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 6 },
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

export function PageBanner({ title, subtitle, icon: Icon, iconNode, rightContent, belowSubtitle, className }: PageBannerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'bento-card rounded-2xl p-6 mb-6',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {iconNode ? (
            <motion.div variants={childVariants} className="hidden sm:block flex-shrink-0">
              {iconNode}
            </motion.div>
          ) : Icon ? (
            <motion.div
              variants={childVariants}
              className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
              style={{ color: 'var(--color-accent)' }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          ) : null}
          <div className="min-w-0">
            <motion.h1
              variants={childVariants}
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                variants={childVariants}
                className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {subtitle}
              </motion.p>
            )}
            {belowSubtitle && (
              <motion.div variants={childVariants}>
                {belowSubtitle}
              </motion.div>
            )}
          </div>
        </div>
        {rightContent && (
          <motion.div variants={rightVariants} className="flex items-center gap-2 flex-shrink-0">
            {rightContent}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
