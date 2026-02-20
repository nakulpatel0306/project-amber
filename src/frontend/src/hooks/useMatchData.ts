import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateCompatibility, type OCEANScores } from '../lib/compatibilityScoring';
import { determineArchetype, type Archetype } from '../lib/archetypes';
import { generateHighlightPills } from '../utils/matchHelpers';
import type {
  CandidateData,
  EmployerData,
  RoleData,
  RoleOption,
  MatchResult,
  CandidateResult,
  EmberInsights,
} from '../types/matching.types';

const API_BASE = 'http://127.0.0.1:8000';

interface UseCandidateMatchDataReturn {
  candidate: CandidateData | null;
  matches: MatchResult[];
  archetype: (Archetype & { confidence: number }) | null;
  insights: EmberInsights | null;
  pendingChats: number;
  isLoading: boolean;
  error: string | null;
  setPendingChats: React.Dispatch<React.SetStateAction<number>>;
}

interface UseEmployerMatchDataReturn {
  employer: EmployerData | null;
  candidates: CandidateResult[];
  rawCandidates: any[];
  roles: RoleOption[];
  archetype: (Archetype & { confidence: number }) | null;
  insights: EmberInsights | null;
  pendingChats: number;
  isLoading: boolean;
  error: string | null;
  selectedRoleId: string | null;
  handleRoleChange: (roleId: string | null) => void;
  setPendingChats: React.Dispatch<React.SetStateAction<number>>;
}

export function useCandidateMatchData(): UseCandidateMatchDataReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [archetype, setArchetype] = useState<(Archetype & { confidence: number }) | null>(null);
  const [insights, setInsights] = useState<EmberInsights | null>(null);
  const [pendingChats, setPendingChats] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Fetch own candidate record
        const { data: cand, error: candErr } = await supabase
          .from('candidates')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (candErr) {
          console.error('[Ember] Candidate fetch error:', candErr.message);
        }

        if (candErr || !cand || cand.openness_score === null) {
          setCandidate(null);
          setIsLoading(false);
          return;
        }

        setCandidate(cand);

        const candidateOcean: OCEANScores = {
          openness: cand.openness_score || 50,
          conscientiousness: cand.conscientiousness_score || 50,
          extraversion: cand.extraversion_score || 50,
          agreeableness: cand.agreeableness_score || 50,
          neuroticism: cand.neuroticism_score || 50,
        };

        const arch = determineArchetype(candidateOcean);
        setArchetype(arch);

        // Step 2: Fetch active roles (separate from employers to avoid RLS join issues)
        const { data: roles, error: rolesErr } = await supabase
          .from('roles')
          .select('*')
          .eq('status', 'active');

        if (rolesErr) {
          console.error('[Ember] Roles fetch error:', rolesErr.message);
        }

        console.log('[Ember] Active roles found:', roles?.length || 0);

        if (!roles || roles.length === 0) {
          // No active roles — nothing to match against
          setIsLoading(false);
          return;
        }

        // Step 3: Fetch employers for those roles (separate query — avoids !inner join RLS issues)
        const employerIds = [...new Set(roles.map((r: any) => r.employer_id))];
        const { data: employers, error: empErr } = await supabase
          .from('employers')
          .select('*')
          .in('id', employerIds);

        if (empErr) {
          console.error('[Ember] Employers fetch error:', empErr.message);
        }

        console.log('[Ember] Employers found:', employers?.length || 0);

        if (!employers || employers.length === 0) {
          // RLS might still be blocking — log clearly
          console.warn('[Ember] No employers returned. RLS policy "Candidates can view employers" may be missing. Run migrate-matching-cross-visibility.sql');
          setIsLoading(false);
          return;
        }

        // Step 4: Merge employers into roles and compute matches
        const employerMap = new Map(employers.map((e: any) => [e.id, e]));

        const matchResults: MatchResult[] = [];
        for (const role of roles) {
          const employer = employerMap.get(role.employer_id);
          if (!employer) continue; // Skip roles whose employer we can't see

          const result = calculateCompatibility({
            candidateOCEAN: candidateOcean,
            employerPreferences: {
              openness: employer.openness_preference || 50,
              conscientiousness: employer.conscientiousness_preference || 50,
              extraversion: employer.extraversion_preference || 50,
              agreeableness: employer.agreeableness_preference || 50,
              neuroticism: employer.neuroticism_preference || 50,
              cultureValues: employer.culture_values || [],
            },
            candidateWorkStyle: cand.preferred_work_style || undefined,
            roleWorkStyle: role.work_style || undefined,
            roleRequirements: {
              required_openness_min: role.required_openness_min,
              required_openness_max: role.required_openness_max,
              required_conscientiousness_min: role.required_conscientiousness_min,
              required_conscientiousness_max: role.required_conscientiousness_max,
              required_extraversion_min: role.required_extraversion_min,
              required_extraversion_max: role.required_extraversion_max,
              required_agreeableness_min: role.required_agreeableness_min,
              required_agreeableness_max: role.required_agreeableness_max,
              required_neuroticism_min: role.required_neuroticism_min,
              required_neuroticism_max: role.required_neuroticism_max,
              work_style: role.work_style,
            },
          });

          const employerOcean: OCEANScores = {
            openness: employer.openness_preference || 50,
            conscientiousness: employer.conscientiousness_preference || 50,
            extraversion: employer.extraversion_preference || 50,
            agreeableness: employer.agreeableness_preference || 50,
            neuroticism: employer.neuroticism_preference || 50,
          };
          const empArchetype = determineArchetype(employerOcean);

          // Attach employer data to role for downstream components
          const roleWithEmployer = { ...role, employers: employer } as RoleData;

          matchResults.push({
            role: roleWithEmployer,
            traitMatchScore: result.traitMatchScore,
            cultureMatchScore: result.cultureMatchScore,
            overallMatchScore: result.overallMatchScore,
            employerArchetype: { name: empArchetype.name, key: empArchetype.key, description: empArchetype.description },
            breakdown: result.breakdown,
            highlightPills: generateHighlightPills({
              cultureMatchScore: result.cultureMatchScore,
              traitMatchScore: result.traitMatchScore,
              breakdown: result.breakdown,
            }),
          });
        }

        matchResults.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
        setMatches(matchResults);
        console.log('[Ember] Matches computed:', matchResults.length);

        const { count } = await supabase
          .from('coffee_chats')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', cand.id)
          .eq('status', 'pending');
        setPendingChats(count || 0);

        try {
          const res = await fetch(`${API_BASE}/api/ember/candidate-matches/${cand.id}`);
          if (res.ok) {
            const data = await res.json();
            setInsights({
              ember_message: data.ember_message || data.message,
              strengths: data.strengths || [],
              growth_areas: data.growth_areas || [],
              tips: data.tips || data.recommendations || [],
            });
          }
        } catch {
          // Backend unavailable
        }
      } catch (err) {
        console.error('[Ember] Error loading candidate match data:', err);
        setError('Failed to load match data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  return { candidate, matches, archetype, insights, pendingChats, isLoading, error, setPendingChats };
}

export function useEmployerMatchData(): UseEmployerMatchDataReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employer, setEmployer] = useState<EmployerData | null>(null);
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [rawCandidates, setRawCandidates] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<(Archetype & { confidence: number }) | null>(null);
  const [insights, setInsights] = useState<EmberInsights | null>(null);
  const [pendingChats, setPendingChats] = useState(0);

  const scoreCandidates = useCallback((
    candidatesData: any[],
    emp: EmployerData,
    role: RoleOption | null,
  ) => {
    const employerOcean: OCEANScores = {
      openness: emp.openness_preference || 50,
      conscientiousness: emp.conscientiousness_preference || 50,
      extraversion: emp.extraversion_preference || 50,
      agreeableness: emp.agreeableness_preference || 50,
      neuroticism: emp.neuroticism_preference || 50,
    };

    const results: CandidateResult[] = candidatesData.map((c: any) => {
      const candidateOcean: OCEANScores = {
        openness: c.openness_score || 50,
        conscientiousness: c.conscientiousness_score || 50,
        extraversion: c.extraversion_score || 50,
        agreeableness: c.agreeableness_score || 50,
        neuroticism: c.neuroticism_score || 50,
      };

      const compatInput: any = {
        candidateOCEAN: candidateOcean,
        employerPreferences: {
          ...employerOcean,
          cultureValues: emp.culture_values || [],
        },
        candidateWorkStyle: c.preferred_work_style || undefined,
      };

      if (role) {
        compatInput.roleWorkStyle = role.work_style || undefined;
        compatInput.roleRequirements = {
          required_openness_min: role.required_openness_min,
          required_openness_max: role.required_openness_max,
          required_conscientiousness_min: role.required_conscientiousness_min,
          required_conscientiousness_max: role.required_conscientiousness_max,
          required_extraversion_min: role.required_extraversion_min,
          required_extraversion_max: role.required_extraversion_max,
          required_agreeableness_min: role.required_agreeableness_min,
          required_agreeableness_max: role.required_agreeableness_max,
          required_neuroticism_min: role.required_neuroticism_min,
          required_neuroticism_max: role.required_neuroticism_max,
          work_style: role.work_style,
        };
      }

      const result = calculateCompatibility(compatInput);
      const arch = determineArchetype(candidateOcean);

      return {
        candidateId: c.id,
        name: c._profileName || 'Unknown',
        headline: c.headline || arch.name,
        location: c.location || '',
        workStyle: c.preferred_work_style || '',
        archetype: { name: arch.name, key: arch.key, description: arch.description, strengths: arch.strengths },
        overallScore: result.overallMatchScore,
        traitScore: result.traitMatchScore,
        cultureScore: result.cultureMatchScore,
        workStyleFit: result.breakdown.workStyleFit,
        breakdown: {
          opennessFit: result.breakdown.opennessFit,
          conscientiousnessFit: result.breakdown.conscientiousnessFit,
          extraversionFit: result.breakdown.extraversionFit,
          agreeablenessFit: result.breakdown.agreeablenessFit,
          neuroticismFit: result.breakdown.neuroticismFit,
        },
        candidateOcean,
      };
    });

    results.sort((a, b) => b.overallScore - a.overallScore);
    setCandidates(results);
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Fetch own employer record
        const { data: emp, error: empErr } = await supabase
          .from('employers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (empErr) {
          console.error('[Ember] Employer fetch error:', empErr.message);
        }

        if (!emp) {
          setIsLoading(false);
          return;
        }
        setEmployer(emp);

        const employerOcean: OCEANScores = {
          openness: emp.openness_preference || 50,
          conscientiousness: emp.conscientiousness_preference || 50,
          extraversion: emp.extraversion_preference || 50,
          agreeableness: emp.agreeableness_preference || 50,
          neuroticism: emp.neuroticism_preference || 50,
        };

        const arch = determineArchetype(employerOcean);
        setArchetype(arch);

        // Step 2: Fetch employer's own roles
        const { data: rolesData } = await supabase
          .from('roles')
          .select('id, title, work_style, required_openness_min, required_openness_max, required_conscientiousness_min, required_conscientiousness_max, required_extraversion_min, required_extraversion_max, required_agreeableness_min, required_agreeableness_max, required_neuroticism_min, required_neuroticism_max')
          .eq('employer_id', emp.id);

        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData);
        }

        // Step 3: Fetch candidates (separate query — no !inner join to avoid RLS chain issues)
        const { data: candidatesData, error: candidatesErr } = await supabase
          .from('candidates')
          .select('*')
          .not('openness_score', 'is', null);

        if (candidatesErr) {
          console.error('[Ember] Candidates fetch error:', candidatesErr.message);
        }

        console.log('[Ember] Candidates found:', candidatesData?.length || 0);

        if (!candidatesData || candidatesData.length === 0) {
          console.warn('[Ember] No candidates returned. RLS policy "Employers can view assessed candidates" may be missing. Run migrate-matching-cross-visibility.sql');
          setIsLoading(false);
          return;
        }

        // Step 4: Fetch profiles for those candidates (separate query)
        const candidateUserIds = candidatesData.map((c: any) => c.user_id);
        const { data: profilesData, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', candidateUserIds);

        if (profilesErr) {
          console.error('[Ember] Profiles fetch error:', profilesErr.message);
        }

        console.log('[Ember] Profiles found:', profilesData?.length || 0);

        // Step 5: Merge profile names into candidate data
        const profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
        const enrichedCandidates = candidatesData.map((c: any) => {
          const profile = profileMap.get(c.user_id);
          return { ...c, _profileName: profile?.full_name || 'Unknown' };
        });

        setRawCandidates(enrichedCandidates);
        scoreCandidates(enrichedCandidates, emp, null);
        console.log('[Ember] Candidates scored:', enrichedCandidates.length);

        const { count } = await supabase
          .from('coffee_chats')
          .select('*', { count: 'exact', head: true })
          .eq('employer_id', emp.id)
          .eq('status', 'pending');
        setPendingChats(count || 0);

        try {
          const res = await fetch(`${API_BASE}/api/ember/employer-matches/${emp.id}`);
          if (res.ok) {
            const data = await res.json();
            setInsights({
              ember_message: data.ember_message || data.message,
              strengths: data.strengths || [],
              growth_areas: data.growth_areas || [],
              tips: data.tips || data.recommendations || [],
            });
          }
        } catch {
          // Backend unavailable
        }
      } catch (err) {
        console.error('[Ember] Error loading employer match data:', err);
        setError('Failed to load match data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, scoreCandidates]);

  const handleRoleChange = useCallback((roleId: string | null) => {
    setSelectedRoleId(roleId);
    if (!employer || rawCandidates.length === 0) return;
    const role = roleId ? roles.find(r => r.id === roleId) || null : null;
    scoreCandidates(rawCandidates, employer, role);
  }, [employer, rawCandidates, roles, scoreCandidates]);

  return {
    employer, candidates, rawCandidates, roles, archetype, insights,
    pendingChats, isLoading, error, selectedRoleId, handleRoleChange, setPendingChats,
  };
}
