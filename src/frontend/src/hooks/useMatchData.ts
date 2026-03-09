import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateCompatibility, type OCEANScores } from '../lib/compatibilityScoring';
import { determineArchetype, type Archetype } from '../lib/archetypes';
import type {
  CandidateData,
  EmployerData,
  RoleOption,
  CandidateResult,
  EmployerResult,
  EmberInsights,
} from '../types/matching.types';

const API_BASE = 'http://127.0.0.1:8000';

interface UseCandidateMatchDataReturn {
  candidate: CandidateData | null;
  employers: EmployerResult[];
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
  const [employers, setEmployers] = useState<EmployerResult[]>([]);
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

        // Step 2: Fetch employers via RPC function (bypasses RLS to avoid recursion)
        const { data: employersRaw, error: empErr } = await supabase
          .rpc('get_employers_for_candidate', { candidate_user_id: user.id });
        const employersData = employersRaw as EmployerData[] | null;

        if (empErr) {
          console.error('[Ember] Employers fetch error:', empErr.message);
        }

        console.log('[Ember] Employers found:', employersData?.length || 0);

        if (!employersData || employersData.length === 0) {
          console.warn('[Ember] No employers returned. Make sure get_employers_for_candidate RPC function exists.');
          setIsLoading(false);
          return;
        }

        // Step 3: Fetch employer profile names
        const employerUserIds = employersData.map((emp: EmployerData) => emp.user_id);
        let employerProfilesData: any[] = [];
        try {
          const { data: rpcData, error: rpcErr } = await supabase
            .rpc('get_profiles_by_ids', { user_ids: employerUserIds });
          if (rpcErr) {
            const { data: fallbackData } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', employerUserIds);
            employerProfilesData = fallbackData || [];
          } else {
            employerProfilesData = rpcData || [];
          }
        } catch {
          // Profile lookup failed
        }
        const employerProfileMap = new Map((employerProfilesData || []).map((p: any) => [p.id, p]));

        // Step 4: Score employers directly (like how employers score candidates)
        const employerResults: EmployerResult[] = employersData
          .filter((emp: EmployerData) => emp.openness_preference !== null) // Only employers with preferences set
          .map((emp: EmployerData) => {
            const employerOcean: OCEANScores = {
              openness: emp.openness_preference || 50,
              conscientiousness: emp.conscientiousness_preference || 50,
              extraversion: emp.extraversion_preference || 50,
              agreeableness: emp.agreeableness_preference || 50,
              neuroticism: emp.neuroticism_preference || 50,
            };

            const result = calculateCompatibility({
              candidateOCEAN: candidateOcean,
              employerPreferences: {
                ...employerOcean,
                cultureValues: emp.culture_values || [],
              },
              candidateWorkStyle: cand.preferred_work_style || undefined,
            });

            const empArchetype = determineArchetype(employerOcean);

            const empProfile = employerProfileMap.get(emp.user_id);

            return {
              employerId: emp.id,
              profileName: empProfile?.full_name || emp.company_name,
              companyName: emp.company_name,
              description: emp.description || '',
              industry: emp.industry || '',
              location: emp.location || '',
              companySize: emp.company_size || '',
              logoUrl: emp.logo_url || null,
              archetype: { name: empArchetype.name, key: empArchetype.key, description: empArchetype.description, strengths: empArchetype.strengths },
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
              employerOcean,
              cultureValues: emp.culture_values || [],
              createdAt: (emp as any).created_at || undefined,
            };
          });

        employerResults.sort((a, b) => b.overallScore - a.overallScore);
        setEmployers(employerResults);
        console.log('[Ember] Employer matches computed:', employerResults.length);

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

  return { candidate, employers, archetype, insights, pendingChats, isLoading, error, setPendingChats };
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

        // Step 3: Fetch candidates via RPC function (bypasses RLS to avoid recursion)
        const { data: candidatesRaw, error: candidatesErr } = await supabase
          .rpc('get_candidates_for_employer', { employer_user_id: user.id });
        const candidatesData = candidatesRaw as CandidateData[] | null;

        if (candidatesErr) {
          console.error('[Ember] Candidates fetch error:', candidatesErr.message);
        }

        console.log('[Ember] Candidates found:', candidatesData?.length || 0);

        if (!candidatesData || candidatesData.length === 0) {
          console.warn('[Ember] No candidates returned. Make sure get_candidates_for_employer RPC function exists.');
          setIsLoading(false);
          return;
        }

        // Step 4: Fetch profiles via RPC function (bypasses RLS — no self-referencing policy needed)
        const candidateUserIds = candidatesData.map((c: any) => c.user_id);
        let profilesData: any[] = [];
        try {
          const { data: rpcData, error: rpcErr } = await supabase
            .rpc('get_profiles_by_ids', { user_ids: candidateUserIds });
          if (rpcErr) {
            console.warn('[Ember] RPC get_profiles_by_ids failed, falling back to direct query:', rpcErr.message);
            // Fallback: try direct query (works if profiles cross-visibility policy exists)
            const { data: fallbackData } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', candidateUserIds);
            profilesData = fallbackData || [];
          } else {
            profilesData = rpcData || [];
          }
        } catch {
          console.warn('[Ember] Profile lookup failed, using fallback names');
        }

        console.log('[Ember] Profiles found:', profilesData.length);

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
