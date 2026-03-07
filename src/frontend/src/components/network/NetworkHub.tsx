import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Users, Building2, Briefcase, Trophy, Globe, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { supabase } from '../../lib/supabase';
import { PageBanner } from '../ui/PageBanner';
import { InboxPanel } from '../connections/InboxPanel';
import { NetworkDiscover } from './NetworkDiscover';
import { NetworkPeople } from './NetworkPeople';
import { NetworkCompanies } from './NetworkCompanies';
import { NetworkRoles } from './NetworkRoles';
import { NetworkLeaderboard } from './NetworkLeaderboard';

type TabId = 'discover' | 'people' | 'companies' | 'roles' | 'leaderboard';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'people', label: 'People', icon: Users },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'roles', label: 'Roles', icon: Briefcase },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function NetworkHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isEmployer, isCandidate } = useAuth();
  const { accepted, pendingReceivedCount } = useConnections();
  const [inboxOpen, setInboxOpen] = useState(false);

  const activeTab = (searchParams.get('tab') as TabId) || 'discover';
  const setTab = (tab: TabId) => setSearchParams({ tab });

  // Stats counts
  const [stats, setStats] = useState({ people: 0, companies: 0, roles: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      const [ppl, comp, roles] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('employers').select('id', { count: 'exact', head: true }),
        supabase.from('roles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      setStats({
        people: ppl.count || 0,
        companies: comp.count || 0,
        roles: roles.count || 0,
      });
      setStatsLoading(false);
    };
    loadCounts();
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'discover':
        return <NetworkDiscover isEmployer={!!isEmployer} isCandidate={!!isCandidate} />;
      case 'people':
        return <NetworkPeople />;
      case 'companies':
        return <NetworkCompanies />;
      case 'roles':
        return <NetworkRoles isCandidate={!!isCandidate} />;
      case 'leaderboard':
        return <NetworkLeaderboard isEmployer={!!isEmployer} />;
      default:
        return <NetworkDiscover isEmployer={!!isEmployer} isCandidate={!!isCandidate} />;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Page Banner */}
        <PageBanner
          title="Network"
          subtitle="Explore the Amber community"
          icon={Globe}
          rightContent={
            <button
              onClick={() => setInboxOpen(true)}
              className="relative p-2 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
              title="Connections"
            >
              <UserPlus className="w-5 h-5" style={{ color: 'var(--color-textSecondary)' }} />
              {pendingReceivedCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: 'var(--color-accent)', minWidth: '16px', height: '16px', padding: '0 3px' }}
                >
                  {pendingReceivedCount}
                </span>
              )}
            </button>
          }
        />

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'People', value: stats.people },
            { label: 'Companies', value: stats.companies },
            { label: 'Open Roles', value: stats.roles },
            { label: 'Connections', value: accepted.length },
          ].map(s => (
            <div
              key={s.label}
              className="bento-card p-3 text-center"
            >
              {statsLoading ? (
                <div className="h-6 w-10 rounded-md mx-auto mb-1 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
              ) : (
                <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{s.value}</p>
              )}
              <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Underline tabs */}
        <div
          className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hidden relative"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? 'var(--color-accent)' : 'var(--color-textSecondary)',
                }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="network-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {renderTab()}
      </div>

      {/* Connections Inbox Panel */}
      <InboxPanel isOpen={inboxOpen} onClose={() => setInboxOpen(false)} />
    </div>
  );
}
