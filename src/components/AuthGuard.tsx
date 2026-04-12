import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';

export function AuthGuard({ children, requireSubscription = false }: { children: React.ReactNode; requireSubscription?: boolean }) {
  const { session, loading } = useAuth();
  const { isActive, loading: subLoading } = useSubscriptionGuard();
  const location = useLocation();

  if (loading || (requireSubscription && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireSubscription && !isActive) {
    return <Navigate to="/pricing" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
