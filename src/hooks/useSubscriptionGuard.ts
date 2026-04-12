import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  plan: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
}

export function useSubscriptionGuard() {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status, trial_ends_at')
        .eq('id', user.id)
        .single();
      setData(profile || { plan: null, subscription_status: null, trial_ends_at: null });
      setLoading(false);
    };
    fetch();
  }, [user]);

  const isActive = !data || !data.subscription_status
    ? true // If no subscription data, allow access (free/no billing yet)
    : data.subscription_status === 'active' ||
      data.subscription_status === 'trialing';

  return { ...data, loading, isActive };
}
