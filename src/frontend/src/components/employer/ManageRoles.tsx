import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Users,
  Pause,
  Play,
  Trash2,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

type RoleStatus = 'active' | 'paused' | 'closed' | 'draft';

interface Role {
  id: string;
  title: string;
  description: string | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  location: string | null;
  work_style: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  status: RoleStatus;
  created_at: string;
  applicant_count: number;
}

export function ManageRoles() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoleStatus | 'all'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showLoader = useMinLoader(isLoading);

  useEffect(() => {
    if (!user) return;
    loadRoles();
  }, [user]);

  const loadRoles = async () => {
    if (!user) return;

    try {
      // Get employer record
      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employer) {
        setIsLoading(false);
        return;
      }

      // Get roles with application counts
      const { data: rolesData, error } = await supabase
        .from('roles')
        .select('*')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get application counts per role
      const roleIds = (rolesData || []).map(r => r.id);
      let appCounts: Record<string, number> = {};

      if (roleIds.length > 0) {
        const { data: apps } = await supabase
          .from('applications')
          .select('role_id')
          .in('role_id', roleIds);

        if (apps) {
          appCounts = apps.reduce((acc: Record<string, number>, app) => {
            acc[app.role_id] = (acc[app.role_id] || 0) + 1;
            return acc;
          }, {});
        }
      }

      const formattedRoles: Role[] = (rolesData || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        requirements: r.requirements,
        nice_to_have: r.nice_to_have,
        location: r.location,
        work_style: r.work_style,
        employment_type: r.employment_type,
        salary_min: r.salary_min,
        salary_max: r.salary_max,
        status: r.status as RoleStatus,
        created_at: r.created_at,
        applicant_count: appCounts[r.id] || 0,
      }));

      setRoles(formattedRoles);
    } catch (err) {
      console.error('Error loading roles:', err);
      showError('Failed to load roles', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (roleId: string, newStatus: RoleStatus) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update({ status: newStatus })
        .eq('id', roleId);

      if (error) throw error;

      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, status: newStatus } : r));
      setOpenMenu(null);
      success('Role updated', `Role has been ${newStatus === 'active' ? 'activated' : newStatus}.`);
    } catch (err) {
      console.error('Error updating role:', err);
      showError('Failed to update role', 'Please try again.');
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setRoles(prev => prev.filter(r => r.id !== roleId));
      setOpenMenu(null);
      success('Role deleted', 'The role has been removed.');
    } catch (err) {
      console.error('Error deleting role:', err);
      showError('Failed to delete role', 'Please try again.');
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: roles.filter(r => r.status === 'active').length,
    paused: roles.filter(r => r.status === 'paused').length,
    totalApplicants: roles.reduce((sum, r) => sum + r.applicant_count, 0),
    totalRoles: roles.length,
  };

  const getStatusColor = (status: RoleStatus) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-success)' };
      case 'paused':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--color-accent)' };
      case 'closed':
        return { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--color-textMuted)' };
      case 'draft':
        return { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--color-textMuted)' };
    }
  };

  if (showLoader) {
    return (
      <CoffeeBrewLoader size="sm" />
    );
  }

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
            {stats.totalRoles}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            total roles
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
                      {role.location && (
                        <span className="flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                          <MapPin className="w-3.5 h-3.5" />
                          {role.work_style && `${role.work_style} · `}{role.location}
                        </span>
                      )}
                      {role.employment_type && (
                        <span className="flex items-center gap-1" style={{ color: 'var(--color-textMuted)' }}>
                          <Clock className="w-3.5 h-3.5" />
                          {role.employment_type.replace('_', '-')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                          {role.applicant_count} applicant{role.applicant_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {role.salary_min && role.salary_max && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
                          <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                            ${(role.salary_min / 1000).toFixed(0)}k - ${(role.salary_max / 1000).toFixed(0)}k
                          </span>
                        </div>
                      )}
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
                            {role.status === 'active' ? (
                              <button
                                onClick={() => handleStatusChange(role.id, 'paused')}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                                style={{ color: 'var(--color-accent)' }}
                              >
                                <Pause className="w-4 h-4" />
                                pause role
                              </button>
                            ) : role.status === 'paused' ? (
                              <button
                                onClick={() => handleStatusChange(role.id, 'active')}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                                style={{ color: 'var(--color-success)' }}
                              >
                                <Play className="w-4 h-4" />
                                activate role
                              </button>
                            ) : null}
                            {role.status !== 'closed' && (
                              <button
                                onClick={() => handleStatusChange(role.id, 'closed')}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-background)]"
                                style={{ color: 'var(--color-textMuted)' }}
                              >
                                <Pause className="w-4 h-4" />
                                close role
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(role.id)}
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
