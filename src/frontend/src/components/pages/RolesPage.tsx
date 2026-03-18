import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Search, X, MapPin, Users, DollarSign, Building2, Globe,
} from 'lucide-react';
import { CoffeeBrewLoader, useMinLoader } from '../ui/CoffeeBrewLoader';
import { supabase } from '../../lib/supabase';
import { emberFadeUp } from '../../utils/motion';
import { avatarGradient, formatSalary } from '../../utils/matchHelpers';

interface RoleRow {
  id: string;
  title: string;
  description: string;
  location: string;
  work_style: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  employers: {
    id: string;
    company_name: string;
    company_size: string;
    industry: string;
    location: string;
    company_website: string;
    company_logo_url: string | null;
  };
}

function titleCase(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function RolesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const showLoader = useMinLoader(isLoading, 1500);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, title, description, location, work_style, employment_type, salary_min, salary_max, employers!inner(id, company_name, company_size, industry, location, company_website, company_logo_url)')
        .eq('status', 'active');

      if (error) throw error;
      setRoles((data as unknown as RoleRow[]) || []);
    } catch (err) {
      console.error('Error loading roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const industries = useMemo(() =>
    [...new Set(roles.map(r => r.employers.industry).filter(Boolean))].sort(),
    [roles]
  );

  const companies = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach(r => map.set(r.employers.id, r.employers.company_name));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [roles]);

  const uniqueCompanies = companies.length;

  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !r.title.toLowerCase().includes(q) &&
          !r.employers.company_name.toLowerCase().includes(q) &&
          !(r.employers.industry || '').toLowerCase().includes(q) &&
          !(r.location || '').toLowerCase().includes(q)
        ) return false;
      }
      if (selectedIndustry && r.employers.industry !== selectedIndustry) return false;
      if (selectedWorkStyle && r.work_style !== selectedWorkStyle) return false;
      if (selectedCompanyId && r.employers.id !== selectedCompanyId) return false;
      return true;
    });
  }, [roles, searchQuery, selectedIndustry, selectedWorkStyle, selectedCompanyId]);

  const hasActiveFilters = !!(selectedIndustry || selectedWorkStyle || selectedCompanyId);

  if (showLoader) return <CoffeeBrewLoader variant="fullscreen" message="Loading Roles..." />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
      {/* Header */}
      <motion.div
        className="bento-card p-6"
        variants={emberFadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center gap-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)' }}
          >
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
            >
              Available Roles
            </h1>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Browse All Open Positions //
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              {([
                { label: 'Active Roles', value: roles.length, color: '#10B981', Icon: Briefcase },
                { label: 'Companies', value: uniqueCompanies, color: '#8B5CF6', Icon: Building2 },
                { label: 'Industries', value: industries.length, color: '#D97706', Icon: Globe },
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
      </motion.div>

      {/* Search + Filters */}
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
            placeholder="Search Roles, Companies, Locations..."
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
        <div className="flex flex-wrap gap-2">
          {industries.length > 0 && (
            <select
              value={selectedIndustry || ''}
              onChange={e => setSelectedIndustry(e.target.value || null)}
              className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          )}
          <select
            value={selectedWorkStyle || ''}
            onChange={e => setSelectedWorkStyle(e.target.value || null)}
            className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
          >
            <option value="">All Work Styles</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-Site</option>
          </select>
          {companies.length > 1 && (
            <select
              value={selectedCompanyId || ''}
              onChange={e => setSelectedCompanyId(e.target.value || null)}
              className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
            >
              <option value="">All Companies</option>
              {companies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Results count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          {filteredRoles.length} Role{filteredRoles.length !== 1 ? 's' : ''}
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => { setSelectedIndustry(null); setSelectedWorkStyle(null); setSelectedCompanyId(null); }}
            className="text-xs font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Role Cards */}
      {filteredRoles.length === 0 ? (
        <div
          className="py-16 text-center rounded-xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <Briefcase className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-textMuted)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            {roles.length === 0 ? 'No Active Roles Yet' : 'No Roles Match Your Filters'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {roles.length === 0 ? 'Check back soon for new opportunities' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role, i) => {
            const emp = role.employers;
            const salary = formatSalary(role.salary_min, role.salary_max);
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="p-4 rounded-xl border transition-all hover:border-[var(--color-borderHover)]"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {/* Company + Role */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: emp.company_logo_url ? 'white' : avatarGradient(emp.company_name) }}
                  >
                    {emp.company_logo_url ? (
                      <img src={emp.company_logo_url} alt={emp.company_name} className="w-full h-full rounded-xl object-contain" style={{ backgroundColor: 'white' }} />
                    ) : (
                      <span className="text-sm font-bold text-white">{emp.company_name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>{role.title}</h3>
                    <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>{emp.company_name}</p>
                  </div>
                </div>

                {/* Description */}
                {role.description && (
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--color-textMuted)' }}>
                    {role.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
                  {role.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{role.location}</span>
                  )}
                  {role.work_style && (
                    <span>{titleCase(role.work_style)}</span>
                  )}
                  {role.employment_type && (
                    <span>{titleCase(role.employment_type)}</span>
                  )}
                  {emp.company_size && (
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{emp.company_size}</span>
                  )}
                </div>

                {/* Salary */}
                {salary !== 'Not specified' && (
                  <div className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--color-text)' }}>
                    <DollarSign className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                    <span className="font-medium">{salary}</span>
                  </div>
                )}

                {/* Industry pill */}
                {emp.industry && (
                  <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <span
                      className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: 'rgba(217, 119, 6, 0.08)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {emp.industry}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
