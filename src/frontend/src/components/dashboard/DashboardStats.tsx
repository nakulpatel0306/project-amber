import {
  Users,
  Coffee,
  Briefcase,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
  connectionsCount: number;
  pendingChats: number;
  matchesAvailable: number;
  avgMatchScore: number;
  profileCompletion: number;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function DashboardStats({
  connectionsCount,
  pendingChats,
  matchesAvailable,
  avgMatchScore,
  profileCompletion,
}: DashboardStatsProps) {
  const stats = [
    { label: 'Connections', value: String(connectionsCount), icon: Users },
    { label: 'Pending Invites', value: String(pendingChats), icon: Coffee },
    { label: 'Matches Available', value: String(matchesAvailable), icon: Briefcase },
    { label: 'Avg Match Score', value: avgMatchScore > 0 ? `${avgMatchScore}%` : '--', icon: BarChart3 },
    { label: 'Profile Complete', value: `${profileCompletion}%`, icon: CheckCircle2 },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          className="p-4 rounded-2xl border transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
          >
            <stat.icon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {stat.value}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
