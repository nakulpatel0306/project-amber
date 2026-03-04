import { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Users,
  Globe,
  Briefcase,
  Star,
  Sparkles,
  User,
  Heart,
  Target,
  MessageCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { determineArchetype } from '../../lib/archetypes';
import type { OCEANScores } from '../../lib/compatibilityScoring';

interface EmployerDetails {
  id: string;
  company_name: string;
  description: string;
  industry: string;
  company_size: string;
  location: string;
  company_website: string | null;
  culture_values: string[];
  openness_preference: number;
  conscientiousness_preference: number;
  extraversion_preference: number;
  agreeableness_preference: number;
  neuroticism_preference: number;
}

interface RoleDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  work_style: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
}

interface CandidateDetails {
  id: string;
  user_id: string;
  headline: string | null;
  location: string | null;
  preferred_work_style: string | null;
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  neuroticism_score: number;
  top_traits: string[];
  profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface CoffeeChatDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  coffeeChatId?: string; // For future use
  viewerRole: 'candidate' | 'employer';
  partnerId: string; // employer_id for candidates, candidate_id for employers
  partnerName: string;
  matchScore?: number;
  onMessage?: () => void;
}

export function CoffeeChatDetailModal({
  isOpen,
  onClose,
  viewerRole,
  partnerId,
  partnerName,
  matchScore,
  onMessage,
}: CoffeeChatDetailModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [employerDetails, setEmployerDetails] = useState<EmployerDetails | null>(null);
  const [roles, setRoles] = useState<RoleDetails[]>([]);
  const [candidateDetails, setCandidateDetails] = useState<CandidateDetails | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadDetails();
  }, [isOpen, partnerId, viewerRole]);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      if (viewerRole === 'candidate') {
        // Load employer details and their roles via RPC (bypasses RLS safely)
        const { data, error } = await supabase
          .rpc('get_employer_with_roles', { employer_uuid: partnerId });

        if (!error && data) {
          if (data.employer) {
            setEmployerDetails(data.employer);
          }
          if (data.roles) {
            setRoles(data.roles);
          }
        }
      } else {
        // Load candidate details
        const { data: candidate } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', partnerId)
          .single();

        if (candidate) {
          // Try to get profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', candidate.user_id)
            .single();

          setCandidateDetails({
            ...candidate,
            profile: profile || undefined,
          });
        }
      }
    } catch (err) {
      console.error('Error loading details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const format = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `From ${format(min)}`;
    if (max) return `Up to ${format(max)}`;
    return null;
  };

  const getCandidateArchetype = () => {
    if (!candidateDetails) return null;
    const ocean: OCEANScores = {
      openness: candidateDetails.openness_score || 50,
      conscientiousness: candidateDetails.conscientiousness_score || 50,
      extraversion: candidateDetails.extraversion_score || 50,
      agreeableness: candidateDetails.agreeableness_score || 50,
      neuroticism: candidateDetails.neuroticism_score || 50,
    };
    return determineArchetype(ocean);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="relative">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              }}
            >
              {viewerRole === 'candidate' ? (
                <Building2 className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                {partnerName}
              </h2>
              {matchScore && (
                <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-accent)' }}>
                  <Star className="w-3.5 h-3.5" />
                  {matchScore}% match
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-textMuted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-accent)] border-t-transparent" />
            </div>
          ) : viewerRole === 'candidate' && employerDetails ? (
            // Employer details for candidate view
            <div className="space-y-6">
              {/* Company Overview */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Building2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  Company Overview
                </h3>
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  {employerDetails.description && (
                    <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                      {employerDetails.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {employerDetails.industry && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <Briefcase className="w-4 h-4" />
                        <span>{employerDetails.industry}</span>
                      </div>
                    )}
                    {employerDetails.company_size && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <Users className="w-4 h-4" />
                        <span>{employerDetails.company_size} employees</span>
                      </div>
                    )}
                    {employerDetails.location && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-4 h-4" />
                        <span>{employerDetails.location}</span>
                      </div>
                    )}
                    {employerDetails.company_website && (
                      <a
                        href={employerDetails.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Culture Values */}
              {employerDetails.culture_values && employerDetails.culture_values.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Heart className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    Culture Values
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {employerDetails.culture_values.map((value, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Roles */}
              {roles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Target className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    Open Roles ({roles.length})
                  </h3>
                  <div className="space-y-3">
                    {roles.map(role => (
                      <div
                        key={role.id}
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                      >
                        <h4 className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                          {role.title}
                        </h4>
                        {role.description && (
                          <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
                            {role.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--color-textMuted)' }}>
                          {role.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {role.location}
                            </span>
                          )}
                          {role.work_style && (
                            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-background)' }}>
                              {role.work_style}
                            </span>
                          )}
                          {role.employment_type && (
                            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-background)' }}>
                              {role.employment_type}
                            </span>
                          )}
                          {formatSalary(role.salary_min, role.salary_max) && (
                            <span style={{ color: 'var(--color-success)' }}>
                              {formatSalary(role.salary_min, role.salary_max)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : viewerRole === 'employer' && candidateDetails ? (
            // Candidate details for employer view
            <div className="space-y-6">
              {/* Profile Overview */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  Profile Overview
                </h3>
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  {candidateDetails.headline && (
                    <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                      {candidateDetails.headline}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {candidateDetails.location && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--color-textMuted)' }}>
                        <MapPin className="w-4 h-4" />
                        <span>{candidateDetails.location}</span>
                      </div>
                    )}
                    {candidateDetails.preferred_work_style && (
                      <span
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                      >
                        {candidateDetails.preferred_work_style}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Personality Archetype */}
              {(() => {
                const archetype = getCandidateArchetype();
                if (!archetype) return null;
                return (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                      <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                      Personality Archetype
                    </h3>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: `var(--color-accent)15`, color: 'var(--color-accent)' }}
                        >
                          {archetype.name}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                        {archetype.description}
                      </p>
                      {archetype.strengths && archetype.strengths.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {archetype.strengths.slice(0, 4).map((strength, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-lg text-xs"
                              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* OCEAN Scores */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Target className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  Personality Traits
                </h3>
                <div
                  className="p-4 rounded-xl space-y-3"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  {[
                    { label: 'Openness', score: candidateDetails.openness_score, color: '#8B5CF6' },
                    { label: 'Conscientiousness', score: candidateDetails.conscientiousness_score, color: '#10B981' },
                    { label: 'Extraversion', score: candidateDetails.extraversion_score, color: '#F59E0B' },
                    { label: 'Agreeableness', score: candidateDetails.agreeableness_score, color: '#EC4899' },
                    { label: 'Stability', score: 100 - (candidateDetails.neuroticism_score || 50), color: '#06B6D4' },
                  ].map(trait => (
                    <div key={trait.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: 'var(--color-textSecondary)' }}>{trait.label}</span>
                        <span style={{ color: trait.color }}>{trait.score}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-background)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${trait.score}%`, backgroundColor: trait.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Traits */}
              {candidateDetails.top_traits && candidateDetails.top_traits.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Star className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    Top Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidateDetails.top_traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--color-textMuted)' }}>
              No details available
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onMessage && (
            <Button leftIcon={<MessageCircle className="w-4 h-4" />} onClick={onMessage}>
              Message
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
