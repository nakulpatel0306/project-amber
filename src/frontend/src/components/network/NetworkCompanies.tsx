import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, MapPin, ArrowRight, Building2, Briefcase, Users, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { staggerContainer, fadeUp } from '../../utils/motion';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';
import { supabase } from '../../lib/supabase';
import { avatarGradient } from '../../utils/matchHelpers';

interface Company {
  id: string;
  company_name: string;
  industry: string;
  company_size: string;
  location: string;
  description: string;
  culture_values: string[];
  company_website: string;
  activeRolesCount: number;
  roles: { id: string; title: string; location: string; work_style: string | null }[];
}

export function NetworkCompanies() {
  const [, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const { data: employers } = await supabase
        .from('employers')
        .select('id, user_id, company_name, industry, company_size, location, description, culture_values, company_website, roles(id, title, location, work_style, status)');

      if (employers) {
        const processed: Company[] = employers.map((emp: any) => {
          const activeRoles = (emp.roles || []).filter((r: any) => r.status === 'active');
          return {
            id: emp.id,
            company_name: emp.company_name || 'Unknown',
            industry: emp.industry || '',
            company_size: emp.company_size || '',
            location: emp.location || '',
            description: emp.description || '',
            culture_values: emp.culture_values || [],
            company_website: emp.company_website || '',
            activeRolesCount: activeRoles.length,
            roles: activeRoles.map((r: any) => ({ id: r.id, title: r.title, location: r.location || '', work_style: r.work_style })),
          };
        });
        processed.sort((a, b) => b.activeRolesCount - a.activeRolesCount);
        setCompanies(processed);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const industries = useMemo(() => [...new Set(companies.map(c => c.industry).filter(Boolean))].sort(), [companies]);
  const sizes = useMemo(() => [...new Set(companies.map(c => c.company_size).filter(Boolean))].sort(), [companies]);

  const filtered = useMemo(() => {
    let r = companies;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(c => c.company_name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    }
    if (industryFilter) r = r.filter(c => c.industry === industryFilter);
    if (sizeFilter) r = r.filter(c => c.company_size === sizeFilter);
    return r;
  }, [companies, searchQuery, industryFilter, sizeFilter]);

  const totalRoles = companies.reduce((sum, c) => sum + c.activeRolesCount, 0);

  if (isLoading) return <CoffeeBrewLoader message="Loading companies..." />;

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Company Directory
          </h2>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            <span>{companies.length} companies</span>
            <div className="h-3 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <span>{totalRoles} open roles</span>
            <div className="h-3 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <span>{industries.length} industries</span>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            <input
              type="text"
              placeholder="Search companies, industries, locations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {industries.length > 0 && (
              <select
                value={industryFilter}
                onChange={e => setIndustryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
              >
                <option value="">All industries</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            )}
            {sizes.length > 0 && (
              <select
                value={sizeFilter}
                onChange={e => setSizeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}
              >
                <option value="">All sizes</option>
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--color-textMuted)' }}>
          {filtered.length} compan{filtered.length !== 1 ? 'ies' : 'y'}
        </p>

        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <Building2 className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>No companies found</p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="show">
            {filtered.map(company => (
              <motion.div
                key={company.id}
                variants={fadeUp}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:border-[var(--color-borderHover)]"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                    style={{ background: avatarGradient(company.company_name) }}
                  >
                    {company.company_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--color-text)' }}>{company.company_name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {[company.industry, company.company_size ? `${company.company_size} employees` : ''].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>

                {company.location && (
                  <p className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
                    <MapPin className="w-3 h-3" />{company.location}
                  </p>
                )}

                {company.description && (
                  <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
                    {company.description}
                  </p>
                )}

                {company.culture_values.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {company.culture_values.slice(0, 3).map((v, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)', border: '1px solid var(--color-border)' }}>
                        {v}
                      </span>
                    ))}
                    {company.culture_values.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5" style={{ color: 'var(--color-textMuted)' }}>+{company.culture_values.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    <Briefcase className="w-3 h-3" />
                    {company.activeRolesCount} open role{company.activeRolesCount !== 1 ? 's' : ''}
                  </span>
                  {company.activeRolesCount > 0 && (
                    <button
                      className="text-xs font-medium flex items-center gap-0.5"
                      style={{ color: 'var(--color-accent)' }}
                      onClick={e => { e.stopPropagation(); setSearchParams({ tab: 'roles', company: company.id }); }}
                    >
                      View roles <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Company Detail Modal */}
      <Modal isOpen={!!selectedCompany} onClose={() => setSelectedCompany(null)} title="" size="md">
        {selectedCompany && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                style={{ background: avatarGradient(selectedCompany.company_name) }}
              >
                {selectedCompany.company_name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{selectedCompany.company_name}</h3>
                <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                  {[selectedCompany.industry, selectedCompany.company_size ? `${selectedCompany.company_size} employees` : '', selectedCompany.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Briefcase, label: 'Open Roles', value: selectedCompany.activeRolesCount },
                { icon: Users, label: 'Size', value: selectedCompany.company_size || '—' },
                { icon: Globe, label: 'Location', value: selectedCompany.location || '—' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                  <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {selectedCompany.description && (
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-textMuted)' }}>About</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-textSecondary)' }}>{selectedCompany.description}</p>
              </div>
            )}

            {selectedCompany.culture_values.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>Culture & Values</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.culture_values.map((v, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCompany.roles.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>Open Roles</p>
                <div className="space-y-1.5">
                  {selectedCompany.roles.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{role.title}</p>
                        <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                          {[role.location, role.work_style].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button fullWidth size="sm" variant="outline" className="mt-3"
                  onClick={() => { setSelectedCompany(null); setSearchParams({ tab: 'roles', company: selectedCompany.id }); }}>
                  View all roles
                </Button>
              </div>
            )}

            {selectedCompany.company_website && (
              <a
                href={selectedCompany.company_website.startsWith('http') ? selectedCompany.company_website : `https://${selectedCompany.company_website}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'var(--color-accent)' }}
              >
                <Globe className="w-3 h-3" /> Visit website
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
