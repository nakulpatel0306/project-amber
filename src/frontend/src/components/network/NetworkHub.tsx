import { useSearchParams } from 'react-router-dom';
import { Compass, Users, Building2, Briefcase, Trophy, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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
  const { isEmployer, isCandidate, profile } = useAuth();

  const activeTab = (searchParams.get('tab') as TabId) || 'discover';

  const setTab = (tab: TabId) => {
    setSearchParams({ tab });
  };

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
        {/* Hero header — matches Insights page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6)' }}
            >
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                Network
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Explore the Amber community'}
              </p>
            </div>
          </div>

          {/* Tab pills */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                    color: isActive ? 'var(--color-accentText)' : 'var(--color-textSecondary)',
                  }}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTab()}
      </div>
    </div>
  );
}
