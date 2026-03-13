import { useNavigate } from 'react-router-dom';
import { Search, User, MessageCircle, Briefcase, BarChart3, Pencil, Plus } from 'lucide-react';

interface EmployerQuickActionsProps {
  hasCompletedCultureQuiz: boolean;
}

export function EmployerQuickActions({ hasCompletedCultureQuiz }: EmployerQuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    ...(hasCompletedCultureQuiz
      ? [{ icon: Search, label: 'Browse Candidates', onClick: () => navigate('/app/employer/candidates') }]
      : [{ icon: Pencil, label: 'Define Culture', onClick: () => navigate('/app/employer/culture-assessment') }]),
    { icon: Plus, label: 'Create Role', onClick: () => navigate('/app/employer/roles/new') },
    { icon: MessageCircle, label: 'Coffee Chats', onClick: () => navigate('/app/employer/chats') },
    { icon: Briefcase, label: 'Manage Roles', onClick: () => navigate('/app/employer/roles') },
    { icon: BarChart3, label: 'Culture Insights', onClick: () => navigate('/app/employer/insights') },
    { icon: User, label: 'Settings', onClick: () => navigate('/app/settings') },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {actions.map(action => (
        <button key={action.label} onClick={action.onClick}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all hover:border-[var(--color-borderHover)] hover:bg-[var(--color-surface)]"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'transparent' }}>
          <action.icon className="w-5 h-5" style={{ color: 'var(--color-textSecondary)' }} />
          <span className="text-[11px] font-medium text-center leading-tight" style={{ color: 'var(--color-text)' }}>
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
