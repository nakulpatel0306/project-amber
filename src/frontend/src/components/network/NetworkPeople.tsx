import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, MapPin, Coffee, Filter, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { staggerContainer, fadeUp } from '../../utils/motion';
import { CoffeeBrewLoader } from '../ui/CoffeeBrewLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculateCompatibility, OCEANScores } from '../../lib/compatibilityScoring';
import { determineArchetype } from '../../lib/archetypes';
import { avatarGradient, getMatchColor, getScoreLabel } from '../../utils/matchHelpers';

interface PersonProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'candidate' | 'employer';
  headline?: string;
  location?: string;
  archetype?: string;
  archetypeEmoji?: string;
  archetypeColor?: string;
  company_name?: string;
  industry?: string;
  compatibilityScore?: number;
  topTraits?: string[];
}

const ARCHETYPE_COLORS: Record<string, string> = {
  'The Innovator': '#8B5CF6', 'The Architect': '#06B6D4', 'The Connector': '#EC4899',
  'The Catalyst': '#F59E0B', 'The Craftsperson': '#10B981', 'The Harmonizer': '#8B5CF6',
  'The Explorer': '#06B6D4', 'The Strategist': '#3B82F6',
};

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const sw = 2.5;
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  const color = getMatchColor(score);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
          className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute text-[10px] font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}

export function NetworkPeople() {
  const { user, isCandidate } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [archetypeFilter, setArchetypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(30);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);

  useEffect(() => { if (user) loadPeople(); }, [user]);

  const loadPeople = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .neq('id', user.id);

      if (!profiles) { setIsLoading(false); return; }

      const ids = profiles.map(p => p.id);

      const [{ data: candidates }, { data: employers }] = await Promise.all([
        supabase.from('candidates').select('id, user_id, headline, location, openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score, top_traits').in('user_id', ids),
        supabase.from('employers').select('id, user_id, company_name, industry, location').in('user_id', ids),
      ]);

      const candMap = new Map((candidates || []).map(c => [c.user_id, c]));
      const empMap = new Map((employers || []).map(e => [e.user_id, e]));

      let myOcean: OCEANScores | null = null;
      if (isCandidate) {
        const { data: me } = await supabase
          .from('candidates')
          .select('openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score')
          .eq('user_id', user.id).single();
        if (me?.openness_score != null) {
          myOcean = {
            openness: me.openness_score, conscientiousness: me.conscientiousness_score,
            extraversion: me.extraversion_score, agreeableness: me.agreeableness_score,
            neuroticism: me.neuroticism_score,
          };
        }
      }

      const result: PersonProfile[] = profiles.map(p => {
        const cand = candMap.get(p.id);
        const emp = empMap.get(p.id);
        let archetype = '';
        let archetypeEmoji = '';
        let archetypeColor = '';
        let compatibilityScore: number | undefined;
        let topTraits: string[] = [];

        if (cand?.openness_score != null) {
          const theirOcean: OCEANScores = {
            openness: cand.openness_score, conscientiousness: cand.conscientiousness_score,
            extraversion: cand.extraversion_score, agreeableness: cand.agreeableness_score,
            neuroticism: cand.neuroticism_score,
          };
          const arch = determineArchetype(theirOcean);
          archetype = arch.name;
          archetypeEmoji = arch.emoji;
          archetypeColor = ARCHETYPE_COLORS[arch.name] || '#D97706';
          topTraits = cand.top_traits || [];
          if (myOcean) {
            compatibilityScore = calculateCompatibility({
              candidateOCEAN: myOcean,
              employerPreferences: { ...theirOcean },
            }).overallMatchScore;
          }
        }

        return {
          id: p.id, user_id: p.id,
          full_name: p.full_name || 'Anonymous',
          role: p.role as 'candidate' | 'employer',
          headline: cand?.headline || '',
          location: cand?.location || emp?.location || '',
          archetype, archetypeEmoji, archetypeColor,
          company_name: emp?.company_name || '',
          industry: emp?.industry || '',
          compatibilityScore, topTraits,
        };
      });

      result.sort((a, b) => {
        if (a.compatibilityScore && b.compatibilityScore) return b.compatibilityScore - a.compatibilityScore;
        if (a.compatibilityScore) return -1;
        if (b.compatibilityScore) return 1;
        return a.full_name.localeCompare(b.full_name);
      });

      setPeople(result);
    } catch (err) {
      console.error('Error loading people:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const archetypes = useMemo(() => [...new Set(people.map(p => p.archetype).filter((a): a is string => !!a))].sort(), [people]);

  const filtered = useMemo(() => {
    let r = people;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(p =>
        p.full_name.toLowerCase().includes(q) ||
        (p.headline || '').toLowerCase().includes(q) ||
        (p.company_name || '').toLowerCase().includes(q) ||
        (p.archetype || '').toLowerCase().includes(q)
      );
    }
    if (roleFilter) r = r.filter(p => p.role === roleFilter);
    if (archetypeFilter) r = r.filter(p => p.archetype === archetypeFilter);
    return r;
  }, [people, searchQuery, roleFilter, archetypeFilter]);

  const displayed = filtered.slice(0, displayCount);
  const candidateCount = people.filter(p => p.role === 'candidate').length;
  const employerCount = people.filter(p => p.role === 'employer').length;

  const handleRequestChat = async (person: PersonProfile) => {
    if (!user) return;
    try {
      const { data: myCandidate } = await supabase.from('candidates').select('id').eq('user_id', user.id).single();
      const { data: theirEmployer } = await supabase.from('employers').select('id').eq('user_id', person.user_id).single();
      if (myCandidate && theirEmployer) {
        await supabase.from('coffee_chats').insert({
          candidate_id: myCandidate.id, employer_id: theirEmployer.id,
          initiated_by: 'candidate', status: 'pending',
          message: `Would love to connect with ${person.full_name}`,
        });
        showSuccess('Sent!', 'Coffee chat request sent');
      } else {
        showSuccess('Coming soon', 'Peer-to-peer coffee chats launching soon!');
      }
    } catch { showError('Error', 'Failed to send request'); }
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (isLoading) return <CoffeeBrewLoader message="Loading people..." />;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Users className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Community Members
          </h2>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            <span>{candidateCount} candidates</span>
            <div className="h-3 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <span>{employerCount} employers</span>
          </div>
        </div>

        {/* Search + filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-textMuted)' }} />
            <input
              type="text"
              placeholder="Search by name, headline, archetype..."
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
          <div className="flex items-center gap-2">
            {(['', 'candidate', 'employer'] as const).map(val => (
              <button
                key={val}
                onClick={() => setRoleFilter(val)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor: roleFilter === val ? 'var(--color-accent)' : 'var(--color-background)',
                  color: roleFilter === val ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                  border: `1px solid ${roleFilter === val ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                {val === '' ? 'All' : val === 'candidate' ? 'Candidates' : 'Employers'}
              </button>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1"
              style={{
                backgroundColor: showFilters || archetypeFilter ? 'var(--color-accent)' : 'var(--color-background)',
                color: showFilters || archetypeFilter ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                border: `1px solid ${showFilters || archetypeFilter ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <Filter className="w-3 h-3" />
              Filters
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && archetypes.length > 0 && (
          <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>Archetype</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setArchetypeFilter('')}
                className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                style={{
                  backgroundColor: !archetypeFilter ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: !archetypeFilter ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                }}
              >
                All
              </button>
              {archetypes.map(arch => (
                <button
                  key={arch}
                  onClick={() => setArchetypeFilter(archetypeFilter === arch ? '' : arch)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{
                    backgroundColor: archetypeFilter === arch ? `${ARCHETYPE_COLORS[arch] || '#D97706'}20` : 'var(--color-surface)',
                    color: archetypeFilter === arch ? ARCHETYPE_COLORS[arch] || '#D97706' : 'var(--color-textMuted)',
                  }}
                >
                  {arch}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result count */}
        <p className="text-xs mb-4" style={{ color: 'var(--color-textMuted)' }}>
          Showing {Math.min(displayCount, filtered.length)} of {filtered.length} member{filtered.length !== 1 ? 's' : ''}
        </p>

        {displayed.length === 0 ? (
          <div className="py-16 text-center rounded-xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-textMuted)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>No people found</p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="show">
              {displayed.map(person => (
                <motion.div
                  key={person.id}
                  variants={fadeUp}
                  className="p-4 rounded-xl border cursor-pointer transition-all hover:border-[var(--color-borderHover)]"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                  onClick={() => setSelectedPerson(person)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                      style={{ background: avatarGradient(person.full_name) }}
                    >
                      {initials(person.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {person.full_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-textSecondary)' }}>
                        {person.role === 'employer'
                          ? person.company_name || 'Employer'
                          : person.headline || 'Community member'
                        }
                      </p>
                    </div>
                    {person.compatibilityScore != null && person.compatibilityScore > 0 && (
                      <ScoreRing score={person.compatibilityScore} />
                    )}
                  </div>

                  {(person.location || person.industry) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
                      {person.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{person.location}</span>
                      )}
                      {person.industry && <span>{person.industry}</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    {person.archetype ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${person.archetypeColor || '#D97706'}15`, color: person.archetypeColor || '#D97706' }}
                      >
                        {person.archetypeEmoji} {person.archetype}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)' }}>
                        {person.role === 'employer' ? 'Employer' : 'Candidate'}
                      </span>
                    )}
                    <Button
                      size="xs" variant="ghost"
                      rightIcon={<Coffee className="w-3 h-3" />}
                      onClick={e => { e.stopPropagation(); handleRequestChat(person); }}
                    >
                      Chat
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {displayCount < filtered.length && (
              <div className="text-center mt-6">
                <Button size="sm" variant="outline" onClick={() => setDisplayCount(prev => prev + 30)}>
                  Load more ({filtered.length - displayCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedPerson} onClose={() => setSelectedPerson(null)} title="" size="md">
        {selectedPerson && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ background: avatarGradient(selectedPerson.full_name) }}
              >
                {initials(selectedPerson.full_name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{selectedPerson.full_name}</h3>
                <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  {selectedPerson.role === 'employer' ? selectedPerson.company_name : selectedPerson.headline || 'Community member'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedPerson.archetype && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${selectedPerson.archetypeColor || '#D97706'}15`, color: selectedPerson.archetypeColor || '#D97706' }}
                >
                  {selectedPerson.archetypeEmoji} {selectedPerson.archetype}
                </span>
              )}
              {selectedPerson.location && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)', border: '1px solid var(--color-border)' }}>
                  <MapPin className="w-3 h-3" />{selectedPerson.location}
                </span>
              )}
              {selectedPerson.industry && (
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)', border: '1px solid var(--color-border)' }}>
                  {selectedPerson.industry}
                </span>
              )}
            </div>

            {selectedPerson.compatibilityScore != null && selectedPerson.compatibilityScore > 0 && (
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
              >
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-textMuted)' }}>Compatibility</p>
                  <p className="text-sm font-semibold" style={{ color: getMatchColor(selectedPerson.compatibilityScore) }}>
                    {getScoreLabel(selectedPerson.compatibilityScore)} Match
                  </p>
                </div>
                <ScoreRing score={selectedPerson.compatibilityScore} size={52} />
              </div>
            )}

            {selectedPerson.topTraits && selectedPerson.topTraits.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPerson.topTraits.map((trait, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textSecondary)', border: '1px solid var(--color-border)' }}>
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              fullWidth size="md"
              leftIcon={<Coffee className="w-4 h-4" />}
              onClick={() => { handleRequestChat(selectedPerson); setSelectedPerson(null); }}
            >
              Request Coffee Chat
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
