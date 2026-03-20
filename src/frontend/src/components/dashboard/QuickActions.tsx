import { useNavigate } from 'react-router-dom';
import { Search, User, MessageCircle, Compass, BarChart3, Pencil } from 'lucide-react';

interface QuickActionsProps {
  hasCompletedAssessment: boolean;
}

export function QuickActions({ hasCompletedAssessment }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    ...(hasCompletedAssessment
      ? [
          {
            icon: Search,
            label: 'View Matches',
            onClick: () => navigate('/app/ember'),
          },
        ]
      : [
          {
            icon: Pencil,
            label: 'Take Assessment',
            onClick: () => navigate('/app/personality'),
          },
        ]),
    {
      icon: Search,
      label: 'Browse Roles',
      onClick: () => navigate('/app/roles'),
    },
    {
      icon: MessageCircle,
      label: 'Coffee Chats',
      onClick: () => navigate('/app/chats'),
    },
    {
      icon: Compass,
      label: 'Network',
      onClick: () => navigate('/app/network'),
    },
    {
      icon: BarChart3,
      label: 'Insights',
      onClick: () => navigate('/app/insights'),
    },
    {
      icon: User,
      label: 'My Profile',
      onClick: () => navigate('/app/settings'),
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {actions.map(action => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all hover:border-[var(--color-borderHover)] hover:bg-[var(--color-surface)]"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'transparent',
          }}
        >
          <action.icon
            className="w-5 h-5"
            style={{ color: 'var(--color-textSecondary)' }}
          />
          <span
            className="text-[11px] font-medium text-center leading-tight"
            style={{ color: 'var(--color-text)' }}
          >
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
