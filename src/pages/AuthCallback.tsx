import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    const waitForSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        navigate('/dashboard', { replace: true });
        return;
      }

      if (Date.now() - startedAt > 5000) {
        navigate('/login', { replace: true });
        return;
      }

      window.setTimeout(waitForSession, 200);
    };

    waitForSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
