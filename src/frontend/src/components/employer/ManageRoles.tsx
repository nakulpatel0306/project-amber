import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  X,
  MoreVertical,
  Users,
  Pause,
  Play,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { emberFadeUp } from '../../utils/motion';

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

function titleCase(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function ManageRoles() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoleStatus | 'all'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showLoader = useMinLoader(isLoading, 1500);

  useEffect(() => {
    if (!user) return;
    loadRoles();
  }, [user]);

  const loadRoles = async () => {
    if (!user) return;

    try {
      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employer) {
        setIsLoading(false);
        return;
      }

      const { data: rolesData, error } = await supabase
        .from('roles')
        .select('*')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

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

  const getStatusStyle = (status: RoleStatus) => {
    switch (status) {
      case 'active':
        return { bg: '#10B98118', border: '#10B98130', color: '#10B981' };
      case 'paused':
        return { bg: '#f59e0b18', border: '#f59e0b30', color: '#f59e0b' };
      case 'closed':
        return { bg: '#6B728018', border: '#6B728030', color: '#6B7280' };
      case 'draft':
        return { bg: '#6B728018', border: '#6B728030', color: '#6B7280' };
    }
  };

  if (showLoader) {
    return <CoffeeBrewLoader variant="fullscreen" />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Header */}
        <motion.div
          className="bento-card p-6"
          variants={emberFadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)' }}
              >
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  Manage Roles
                </h1>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  View and manage your job postings //
                </p>
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  {([
                    { label: 'Active', value: stats.active, color: '#10B981', Icon: Play },
                    { label: 'Paused', value: stats.paused, color: '#F59E0B', Icon: Pause },
                    { label: 'Applicants', value: stats.totalApplicants, color: '#8B5CF6', Icon: Users },
                    { label: 'Total', value: stats.totalRoles, color: '#D97706', Icon: Briefcase },
                  ] as const).map(stat => (
                    <span
                      key={stat.label}
                      className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`,
                        border: `1px solid ${stat.color}30`,
                        color: 'var(--color-text)',
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        <stat.Icon className="w-3 h-3" style={{ color: stat.color }} />
                      </span>
                      <span className="font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                      <span style={{ color: 'var(--color-textSecondary)' }}>{stat.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/app/employer/roles/new" className="flex-shrink-0">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Create Role
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-textMuted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {(['all', 'active', 'paused', 'closed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: statusFilter === status ? 'var(--color-accent)' : 'var(--color-surface)',
                  border: `1px solid ${statusFilter === status ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: statusFilter === status ? 'white' : 'var(--color-textSecondary)',
                }}
              >
                {status === 'all' ? 'All' : titleCase(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-3">
          {filteredRoles.length === 0 ? (
            <div className="bento-card text-center py-12">
              <Briefcase
                className="w-12 h-12 mx-auto mb-4 opacity-40"
                style={{ color: 'var(--color-textMuted)' }}
              />
              <p
                className="text-base font-bold tracking-tight mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                {searchQuery || statusFilter !== 'all'
                  ? 'No Roles Match Your Filters'
                  : 'No Roles Yet'}
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--color-textMuted)' }}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Create your first role to start matching candidates'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link to="/app/employer/roles/new" className="inline-block">
                  <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>Create Your First Role</Button>
                </Link>
              )}
            </div>
          ) : (
            filteredRoles.map((role, i) => {
              const statusStyle = getStatusStyle(role.status);
              return (
                <motion.div
                  key={role.id}
                  className="bento-card transition-all hover:shadow-md"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3
                          className="text-base font-bold tracking-tight"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {role.title}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            background: `linear-gradient(135deg, ${statusStyle.bg}, transparent)`,
                            border: `1px solid ${statusStyle.border}`,
                            color: statusStyle.color,
                          }}
                        >
                          {titleCase(role.status)}
                        </span>
                      </div>

                      {/* Meta pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {role.location && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px]"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            <MapPin className="w-3 h-3" />
                            {role.work_style && `${titleCase(role.work_style)} · `}{role.location}
                          </span>
                        )}
                        {role.employment_type && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px]"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            <Clock className="w-3 h-3" />
                            {titleCase(role.employment_type)}
                          </span>
                        )}
                        {role.salary_min && role.salary_max && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px]"
                            style={{ color: 'var(--color-textMuted)' }}
                          >
                            <DollarSign className="w-3 h-3" />
                            ${(role.salary_min / 1000).toFixed(0)}k – ${(role.salary_max / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: 'var(--color-textSecondary)' }}
                        >
                          <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                          {role.applicant_count} applicant{role.applicant_count !== 1 ? 's' : ''}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--color-textMuted)' }}
                        >
                          Created {new Date(role.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link to={`/app/employer/ember`}>
                        <Button variant="outline" size="sm">
                          View Candidates
                        </Button>
                      </Link>

                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === role.id ? null : role.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
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
                              className="absolute right-0 top-full mt-1 w-44 py-1 rounded-xl shadow-lg z-20"
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              {role.status === 'active' ? (
                                <button
                                  onClick={() => handleStatusChange(role.id, 'paused')}
                                  className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-[var(--color-surfaceHover)]"
                                  style={{ color: '#f59e0b' }}
                                >
                                  <Pause className="w-3.5 h-3.5" />
                                  Pause Role
                                </button>
                              ) : role.status === 'paused' ? (
                                <button
                                  onClick={() => handleStatusChange(role.id, 'active')}
                                  className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-[var(--color-surfaceHover)]"
                                  style={{ color: '#10B981' }}
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  Activate Role
                                </button>
                              ) : null}
                              {role.status !== 'closed' && (
                                <button
                                  onClick={() => handleStatusChange(role.id, 'closed')}
                                  className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-[var(--color-surfaceHover)]"
                                  style={{ color: 'var(--color-textMuted)' }}
                                >
                                  <Pause className="w-3.5 h-3.5" />
                                  Close Role
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(role.id)}
                                className="w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-[var(--color-surfaceHover)]"
                                style={{ color: '#ef4444' }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Role
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Create Role CTA */}
        {filteredRoles.length > 0 && (
          <Link
            to="/app/employer/roles/new"
            className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-textMuted)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">Create Another Role</span>
          </Link>
        )}
      </div>
    </div>
  );
}
