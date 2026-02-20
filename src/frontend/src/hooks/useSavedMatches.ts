import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { SavedMatch, PipelineTab } from '../types/matching.types';

interface UseSavedMatchesReturn {
  savedMatches: SavedMatch[];
  save: (data: Omit<SavedMatch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  unsave: (id: string) => Promise<void>;
  updateStatus: (id: string, status: PipelineTab) => Promise<void>;
  isSaved: (targetType: 'role' | 'candidate', targetId: string) => boolean;
  getSavedMatch: (targetType: 'role' | 'candidate', targetId: string) => SavedMatch | undefined;
  counts: Record<PipelineTab, number>;
  isLoading: boolean;
}

export function useSavedMatches(): UseSavedMatchesReturn {
  const { user } = useAuth();
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadSavedMatches = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('saved_matches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          // Table may not exist yet — fail gracefully
          console.warn('saved_matches query error (table may not exist):', error.message);
        } else if (data) {
          setSavedMatches(data as SavedMatch[]);
        }
      } catch (err) {
        console.error('Error loading saved matches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedMatches();
  }, [user]);

  const save = useCallback(async (data: Omit<SavedMatch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    try {
      const { data: inserted, error } = await supabase
        .from('saved_matches')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      if (inserted) {
        setSavedMatches(prev => [inserted as SavedMatch, ...prev]);
      }
    } catch (err) {
      console.error('Error saving match:', err);
      throw err;
    }
  }, [user]);

  const unsave = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_matches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSavedMatches(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error removing saved match:', err);
      throw err;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: PipelineTab) => {
    try {
      const { error } = await supabase
        .from('saved_matches')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setSavedMatches(prev =>
        prev.map(m => (m.id === id ? { ...m, status, updated_at: new Date().toISOString() } : m))
      );
    } catch (err) {
      console.error('Error updating match status:', err);
      throw err;
    }
  }, []);

  const isSaved = useCallback((targetType: 'role' | 'candidate', targetId: string) => {
    return savedMatches.some(m => {
      if (targetType === 'role') return m.role_id === targetId;
      return m.candidate_id === targetId;
    });
  }, [savedMatches]);

  const getSavedMatch = useCallback((targetType: 'role' | 'candidate', targetId: string) => {
    return savedMatches.find(m => {
      if (targetType === 'role') return m.role_id === targetId;
      return m.candidate_id === targetId;
    });
  }, [savedMatches]);

  const counts = useMemo(() => {
    return savedMatches.reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      },
      { saved: 0, pending: 0, connected: 0 } as Record<PipelineTab, number>
    );
  }, [savedMatches]);

  return { savedMatches, save, unsave, updateStatus, isSaved, getSavedMatch, counts, isLoading };
}
