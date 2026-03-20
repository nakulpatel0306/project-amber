import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Search, X, MapPin, DollarSign, Building2, Globe,
  ExternalLink, Coffee, Sparkles,
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
  required_openness_min: number | null;
  required_openness_max: number | null;
  required_conscientiousness_min: number | null;
  required_conscientiousness_max: number | null;
  required_extraversion_min: number | null;
  required_extraversion_max: number | null;
  required_agreeableness_min: number | null;
  required_agreeableness_max: number | null;
  required_neuroticism_min: number | null;
  required_neuroticism_max: number | null;
  employers: {
    id: string;
    user_id: string;
    company_name: string;
    company_size: string;
    industry: string;
    location: string;
    company_website: string;
    company_logo_url: string | null;
  };
  // Joined after load
  _hiringName?: string;
}

function titleCase(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const traitMeta: { minField: keyof RoleRow; maxField: keyof RoleRow; highLabel: string; lowLabel: string; color: string }[] = [
  { minField: 'required_openness_min', maxField: 'required_openness_max', highLabel: 'Creative', lowLabel: 'Practical', color: '#8b5cf6' },
  { minField: 'required_conscientiousness_min', maxField: 'required_conscientiousness_max', highLabel: 'Detail-Oriented', lowLabel: 'Flexible', color: '#06b6d4' },
  { minField: 'required_extraversion_min', maxField: 'required_extraversion_max', highLabel: 'Collaborative', lowLabel: 'Independent', color: '#f59e0b' },
  { minField: 'required_agreeableness_min', maxField: 'required_agreeableness_max', highLabel: 'Team Player', lowLabel: 'Assertive', color: '#10b981' },
  { minField: 'required_neuroticism_min', maxField: 'required_neuroticism_max', highLabel: 'Passionate', lowLabel: 'Calm & Steady', color: '#ef4444' },
];

function getTraitHighlights(role: RoleRow): { label: string; color: string }[] {
  const highlights: { label: string; avg: number; color: string }[] = [];
  for (const t of traitMeta) {
    const min = role[t.minField] as number | null;
    const max = role[t.maxField] as number | null;
    if (min == null || max == null) continue;
    const avg = (min + max) / 2;
    if (avg >= 65) highlights.push({ label: t.highLabel, avg, color: t.color });
    else if (avg <= 35) highlights.push({ label: t.lowLabel, avg, color: t.color });
  }
  highlights.sort((a, b) => Math.abs(b.avg - 50) - Math.abs(a.avg - 50));
  return highlights.slice(0, 2);
}

export function RolesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const navigate = useNavigate();

  const showLoader = useMinLoader(isLoading, 1500);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, title, description, location, work_style, employment_type, salary_min, salary_max, required_openness_min, required_openness_max, required_conscientiousness_min, required_conscientiousness_max, required_extraversion_min, required_extraversion_max, required_agreeableness_min, required_agreeableness_max, required_neuroticism_min, required_neuroticism_max, employers!inner(id, user_id, company_name, company_size, industry, location, company_website, company_logo_url)')
        .eq('status', 'active');

      if (error) throw error;
      const rolesData = (data as unknown as RoleRow[]) || [];

      // Fetch hiring manager names from profiles
      const userIds = [...new Set(rolesData.map(r => r.employers.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        let profiles: { id: string; full_name: string | null }[] = [];
        try {
          const { data: rpcData, error: rpcErr } = await supabase
            .rpc('get_profiles_by_ids', { user_ids: userIds });
          if (rpcErr) {
            const { data: fallback } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', userIds);
            profiles = (fallback as any) || [];
          } else {
            profiles = (rpcData as any) || [];
          }
        } catch { /* profile lookup failed, continue without names */ }
        const nameMap = new Map(profiles.map(p => [p.id, p.full_name]));
        rolesData.forEach(r => {
          r._hiringName = nameMap.get(r.employers.user_id) || undefined;
        });
      }

      setRoles(rolesData);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((role, i) => {
            const emp = role.employers;
            const salary = formatSalary(role.salary_min, role.salary_max);
            const traits = getTraitHighlights(role);
            const isFlipped = flippedCardId === role.id;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="relative cursor-pointer"
                style={{ perspective: '1000px', height: '280px' }}
                onClick={() => setFlippedCardId(isFlipped ? null : role.id)}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
                >
                  {/* ====== FRONT ====== */}
                  <div
                    className="p-5 rounded-2xl border transition-all hover:border-[var(--color-borderHover)] hover:shadow-lg absolute inset-0 flex flex-col"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Company logo + name + hiring manager */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: emp.company_logo_url ? 'white' : avatarGradient(emp.company_name) }}
                      >
                        {emp.company_logo_url ? (
                          <img src={emp.company_logo_url} alt={emp.company_name} className="w-full h-full rounded-xl object-contain" style={{ backgroundColor: 'white' }} />
                        ) : (
                          <span className="text-base font-bold text-white">{emp.company_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{emp.company_name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                          {role._hiringName ? `${role._hiringName} Is Hiring` : emp.industry || 'Hiring'}
                        </p>
                      </div>
                    </div>

                    {/* Role title — big */}
                    <h3 className="font-bold text-lg leading-snug mb-1.5" style={{ color: 'var(--color-text)' }}>{role.title}</h3>

                    {/* Description */}
                    {role.description && (
                      <p className="text-xs line-clamp-2 leading-relaxed mb-auto" style={{ color: 'var(--color-textMuted)' }}>
                        {role.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs mt-3 mb-3" style={{ color: 'var(--color-textMuted)' }}>
                      {salary !== 'Not specified' && (
                        <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-text)' }}>
                          <DollarSign className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                          {salary}
                        </span>
                      )}
                      {role.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {role.location}
                        </span>
                      )}
                      {role.work_style && (
                        <span>{titleCase(role.work_style)}</span>
                      )}
                    </div>

                    {/* Bottom: industry pill + trait pills */}
                    <div className="pt-3 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
                      {emp.industry && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}
                        >
                          {emp.industry}
                        </span>
                      )}
                      {traits.map(t => (
                        <span
                          key={t.label}
                          className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                          style={{ backgroundColor: `${t.color}12`, color: t.color }}
                        >
                          <Sparkles className="w-3 h-3" />
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ====== BACK ====== */}
                  <div
                    className="p-5 rounded-2xl border absolute inset-0 flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-accent)',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: emp.company_logo_url ? 'white' : avatarGradient(emp.company_name) }}
                        >
                          {emp.company_logo_url ? (
                            <img src={emp.company_logo_url} alt={emp.company_name} className="w-full h-full rounded-xl object-contain" style={{ backgroundColor: 'white' }} />
                          ) : (
                            <span className="text-sm font-bold text-white">{emp.company_name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base line-clamp-1" style={{ color: 'var(--color-text)' }}>{role.title}</h3>
                          <p className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                            {role._hiringName ? `${role._hiringName} at ${emp.company_name}` : `Hiring at ${emp.company_name}`}
                          </p>
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs mb-4">
                        {role.location && (
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--color-textMuted)' }}>
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate" style={{ color: 'var(--color-text)' }}>{role.location}</span>
                          </div>
                        )}
                        {salary !== 'Not specified' && (
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--color-textMuted)' }}>
                            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate" style={{ color: 'var(--color-text)' }}>{salary}</span>
                          </div>
                        )}
                        {emp.company_size && (
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--color-textMuted)' }}>
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate" style={{ color: 'var(--color-text)' }}>{emp.company_size} employees</span>
                          </div>
                        )}
                        {role.employment_type && (
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--color-textMuted)' }}>
                            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate" style={{ color: 'var(--color-text)' }}>{titleCase(role.employment_type)}</span>
                          </div>
                        )}
                      </div>

                      {/* Personality fit */}
                      {traits.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-textMuted)' }}>
                            Ideal Personality
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {traits.map(t => (
                              <span
                                key={t.label}
                                className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                                style={{ backgroundColor: `${t.color}12`, color: t.color }}
                              >
                                <Sparkles className="w-3 h-3" />
                                {t.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/app/ember?deepdive=${emp.id}`); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #b45309, #d97706)', color: 'white' }}
                      >
                        <Coffee className="w-4 h-4" />
                        {role._hiringName ? `Connect with ${role._hiringName.split(' ')[0]}` : 'Connect'}
                      </button>
                      {emp.company_website && (
                        <a
                          href={emp.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors hover:opacity-80"
                          style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', color: 'var(--color-accent)' }}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
