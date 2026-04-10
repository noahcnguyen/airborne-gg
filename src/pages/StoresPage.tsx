import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StoresTab } from "@/components/dashboard/StoresTab";
import { useStoreData } from "@/hooks/useDashboardData";

function StoresContent() {
  const { stores, loading } = useStoreData();

  return (
    <DashboardLayout title="My Stores">
      <StoresTab stores={stores} loading={loading} onStoresChanged={refetchStores} />
    </DashboardLayout>
  );
}

export default function StoresPage() {
  return (
    <AuthGuard>
      <StoresContent />
    </AuthGuard>
  );
}
