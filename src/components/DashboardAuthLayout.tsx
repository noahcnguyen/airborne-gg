import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';
import { StoreProvider } from '@/contexts/StoreContext';

export function DashboardAuthLayout({ requireSubscription = false }: { requireSubscription?: boolean }) {
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

  return (
    <StoreProvider>
      <Outlet />
    </StoreProvider>
  );
}
