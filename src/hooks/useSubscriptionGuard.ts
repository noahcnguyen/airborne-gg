import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  plan: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
}

export function useSubscriptionGuard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionData> => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status, trial_ends_at')
        .eq('id', user!.id)
        .single();
      return profile || { plan: null, subscription_status: null, trial_ends_at: null };
    },
    enabled: !!user,
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
  });

  const isActive = !data || !data.subscription_status
    ? true
    : data.subscription_status === 'active' ||
      data.subscription_status === 'trialing';

  return {
    plan: data?.plan ?? null,
    subscription_status: data?.subscription_status ?? null,
    trial_ends_at: data?.trial_ends_at ?? null,
    loading: isLoading,
    isActive,
  };
}
