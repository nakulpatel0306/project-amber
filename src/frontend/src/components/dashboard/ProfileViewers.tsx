import { Eye } from 'lucide-react';

const mockViewers = [
  { name: 'Sarah Chen', company: 'TechFlow Inc.', time: '2h ago' },
  { name: 'Marcus Rivera', company: 'Nexus Labs', time: '5h ago' },
  { name: 'Aisha Patel', company: 'GreenLeaf Health', time: '1d ago' },
  { name: 'Jordan Kim', company: 'Bright Minds Ed.', time: '2d ago' },
];

export function ProfileViewers() {
  return (
    <div className="bento-card">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Profile Viewers
        </h3>
        <span
          className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--color-accent)' }}
        >
          {mockViewers.length} new
        </span>
      </div>
      <div className="space-y-3">
        {mockViewers.map((viewer, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {viewer.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {viewer.name}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>
                {viewer.company}
              </p>
            </div>
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-textMuted)' }}>
              {viewer.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
