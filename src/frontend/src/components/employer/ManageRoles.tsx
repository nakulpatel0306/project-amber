import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Users,
  Eye,
  Pause,
  Play,
  Trash2,
  Edit,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/Button';

type RoleStatus = 'active' | 'paused' | 'closed';

interface Role {
  id: string;
  title: string;
  department: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full-time' | 'part-time' | 'contract';
  status: RoleStatus;
  applicants: number;
  newApplicants: number;
  avgMatchScore: number;
  createdAt: string;
}

// Mock data
const mockRoles: Role[] = [
  {
    id: '1',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    status: 'active',
    applicants: 24,
    newApplicants: 8,
    avgMatchScore: 86,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    locationType: 'remote',
    employmentType: 'full-time',
    status: 'active',
    applicants: 31,
    newApplicants: 12,
    avgMatchScore: 82,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'UX Researcher',
    department: 'Design',
    location: 'New York, NY',
    locationType: 'onsite',
    employmentType: 'full-time',
    status: 'paused',
    applicants: 18,
    newApplicants: 0,
    avgMatchScore: 79,
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    title: 'Product Marketing Manager',
    department: 'Marketing',
    location: 'Remote (Worldwide)',
    locationType: 'remote',
    employmentType: 'contract',
    status: 'closed',
    applicants: 42,
    newApplicants: 0,
    avgMatchScore: 84,
    createdAt: '2023-12-20',
  },
];

export function ManageRoles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoleStatus | 'all'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredRoles = mockRoles.filter(role => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: mockRoles.filter(r => r.status === 'active').length,
    paused: mockRoles.filter(r => r.status === 'paused').length,
    totalApplicants: mockRoles.reduce((sum, r) => sum + r.applicants, 0),
    newThisWeek: mockRoles.reduce((sum, r) => sum + r.newApplicants, 0),
  };

  const getStatusColor = (status: RoleStatus) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-success)' };
      case 'paused':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--color-accent)' };
      case 'closed':
        return { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--color-textMuted)' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            manage roles
          </h1>
          <p style={{ color: 'var(--color-textSecondary)' }}>
            view and manage your job postings
          </p>
        </div>
        <Link to="/app/employer/roles/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            create role
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {stats.active}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            active roles
          </p>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {stats.paused}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            paused roles
          </p>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {stats.totalApplicants}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            total applicants
          </p>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
            +{stats.newThisWeek}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            new this week
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--color-textMuted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="search roles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'paused', 'closed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-2.5 rounded-xl border text-sm transition-all"
              style={{
                backgroundColor:
                  statusFilter === status
                    ? 'rgba(217, 119, 6, 0.1)'
                    : 'var(--color-surface)',
                borderColor:
                  statusFilter === status
                    ? 'var(--color-accent)'
                    : 'var(--color-border)',
                color:
                  statusFilter === status
                    ? 'var(--color-accent)'
                    : 'var(--color-textSecondary)',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {filteredRoles.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Briefcase
              className="w-12 h-12 mx-auto mb-4 opacity-40"
              style={{ color: 'var(--color-textMuted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'no roles match your filters'
                : 'no roles yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/app/employer/roles/new" className="inline-block mt-4">
                <Button size="sm">create your first role</Button>
              </Link>
            )}
          </div>
        ) : (
          filteredRoles.map(role => {
            const statusColors = getStatusColor(role.status);
            return (
              <div
                key={role.id}
                className="p-5 rounded-xl border transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="font-semibold"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {role.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                        }}
                      >
                        {role.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                      <span style={{ color: 'var(--color-textSecondary)' }}>
                        {role.department}
                      </span>
                      <span className="flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-3.5 h-3.5" />
                        {role.locationType} · {role.location}
                      </span>
                      <span className="flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                        <Clock className="w-3.5 h-3.5" />
                        {role.employmentType}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                          {role.applicants} applicants
                        </span>
                        {role.newApplicants > 0 && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'rgba(217, 119, 6, 0.1)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            +{role.newApplicants} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                          {role.avgMatchScore}% avg match
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/app/employer/candidates?role=${role.id}`}>
                      <Button variant="outline" size="sm">
                        view candidates
                      </Button>
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === role.id ? null : role.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--color-background)]"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === role.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div
                            className="absolute right-0 top-full mt-1 w-48 py-1 rounded-xl border shadow-lg z-20"
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              borderColor: 'var(--color-border)',
                            }}
                          >
                            <button
                              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                              style={{ color: 'var(--color-text)' }}
                            >
                              <Eye className="w-4 h-4" />
                              view details
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                              style={{ color: 'var(--color-text)' }}
                            >
                              <Edit className="w-4 h-4" />
                              edit role
                            </button>
                            {role.status === 'active' ? (
                              <button
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                                style={{ color: 'var(--color-accent)' }}
                              >
                                <Pause className="w-4 h-4" />
                                pause role
                              </button>
                            ) : role.status === 'paused' ? (
                              <button
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                                style={{ color: 'var(--color-success)' }}
                              >
                                <Play className="w-4 h-4" />
                                activate role
                              </button>
                            ) : null}
                            <button
                              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                              style={{ color: 'var(--color-error)' }}
                            >
                              <Trash2 className="w-4 h-4" />
                              delete role
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Role CTA */}
      {filteredRoles.length > 0 && (
        <Link
          to="/app/employer/roles/new"
          className="mt-6 p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-surface)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-textMuted)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">create another role</span>
        </Link>
      )}
    </div>
  );
}
