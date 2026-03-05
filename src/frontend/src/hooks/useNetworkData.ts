import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface NetworkStats {
  memberCount: number;
  connectionCount: number;
  chatsThisWeek: number;
  openRolesCount: number;
}

interface FeaturedCompany {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  location: string;
  company_size: string;
  description: string;
  culture_values: string[];
  activeRolesCount: number;
}

interface RecentActivity {
  id: string;
  type: 'chat_request' | 'chat_accepted' | 'new_role';
  title: string;
  subtitle: string;
  timestamp: string;
}

export function useNetworkData() {
  const [stats, setStats] = useState<NetworkStats>({
    memberCount: 0,
    connectionCount: 0,
    chatsThisWeek: 0,
    openRolesCount: 0,
  });
  const [featuredCompanies, setFeaturedCompanies] = useState<FeaturedCompany[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [profilesRes, connectionsRes, chatsRes, rolesRes, employersRes, recentChatsRes, recentRolesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('saved_matches').select('id', { count: 'exact', head: true }).eq('status', 'connected'),
        supabase.from('coffee_chats').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('roles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('employers').select('id, user_id, company_name, industry, location, company_size, description, culture_values, roles(id, status)'),
        supabase.from('coffee_chats').select('id, status, created_at, role_title').order('created_at', { ascending: false }).limit(5),
        supabase.from('roles').select('id, title, created_at, employers!inner(company_name)').eq('status', 'active').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        memberCount: profilesRes.count || 0,
        connectionCount: connectionsRes.count || 0,
        chatsThisWeek: chatsRes.count || 0,
        openRolesCount: rolesRes.count || 0,
      });

      // Build recent activity feed
      const activities: RecentActivity[] = [];
      (recentChatsRes.data || []).forEach((chat: any) => {
        activities.push({
          id: `chat-${chat.id}`,
          type: chat.status === 'accepted' ? 'chat_accepted' : 'chat_request',
          title: chat.status === 'accepted' ? 'Chat accepted' : 'New chat request',
          subtitle: chat.role_title || 'Coffee chat',
          timestamp: chat.created_at,
        });
      });
      (recentRolesRes.data || []).forEach((role: any) => {
        activities.push({
          id: `role-${role.id}`,
          type: 'new_role',
          title: role.title,
          subtitle: `${role.employers?.company_name || 'Company'} posted a role`,
          timestamp: role.created_at,
        });
      });
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 8));

      // Featured companies
      if (employersRes.data) {
        const companiesWithCounts = employersRes.data
          .map((emp: any) => ({
            id: emp.id,
            user_id: emp.user_id,
            company_name: emp.company_name || 'Unknown',
            industry: emp.industry || '',
            location: emp.location || '',
            company_size: emp.company_size || '',
            description: emp.description || '',
            culture_values: emp.culture_values || [],
            activeRolesCount: (emp.roles || []).filter((r: any) => r.status === 'active').length,
          }))
          .sort((a: FeaturedCompany, b: FeaturedCompany) => b.activeRolesCount - a.activeRolesCount)
          .slice(0, 8);

        setFeaturedCompanies(companiesWithCounts);
      }
    } catch (err) {
      console.error('Error loading network data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, featuredCompanies, recentActivity, isLoading };
}
