import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { useStores } from "@/hooks/useStores";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Order {
  ebay_order_id: string;
  state: string;
  tracking_carrier: string;
  tracking_number: string;
  payout_estimate_cents: number;
  actual_amazon_total_cents: number;
  actual_profit_cents: number;
  created_at?: string;
  amazon_url?: string | null;
  asin?: string | null;
}

interface Stats {
  total_profit: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  active_listings: number;
}

const SOLD_ORDER_STATES = [
  "completed",
  "submitted_to_zinc",
  "awaiting_tba_conversion",
  "tracking_pending_manual_carrier",
];

function buildStats(orders: Order[], activeListings: number): Stats {
  const sold = orders.filter((order) => SOLD_ORDER_STATES.includes(order.state));
  return {
    total_profit: sold.reduce((sum, order) => sum + order.actual_profit_cents / 100, 0),
    total_orders: orders.length,
    completed_orders: sold.length,
    pending_orders: orders.filter((order) => order.state === "submitted_to_zinc").length,
    active_listings: activeListings,
  };
}

async function enrichOrdersWithAmazonData(orders: Order[], userId: string) {
  if (orders.length === 0 || orders.every((order) => order.asin || order.amazon_url)) {
    return orders;
  }
  const orderIds = orders.map((order) => order.ebay_order_id).filter(Boolean);
  if (orderIds.length === 0) return orders;

  const { data, error } = await supabase
    .from("orders")
    .select("ebay_order_id, amazon_url, created_at")
    .eq("user_id", userId)
    .in("ebay_order_id", orderIds);

  if (error || !data?.length) return orders;
  const orderDataMap = new Map(data.map((order) => [order.ebay_order_id, order]));
  return orders.map((order) => ({ ...order, ...orderDataMap.get(order.ebay_order_id) }));
}

async function fetchDashboardData(selectedStoreId: string, accessToken: string, userId: string) {
  // Try edge function first
  try {
    const res = await fetch(
      `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data?store_id=${selectedStoreId}`,
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.orders) {
        const enrichedOrders = await enrichOrdersWithAmazonData(data.orders, userId);
        return {
          orders: enrichedOrders,
          stats: buildStats(enrichedOrders, data.stats?.active_listings || 0),
          profitChart: data.profitChart || [],
        };
      }
      return { orders: [], stats: buildStats([], data.stats?.active_listings || 0), profitChart: data.profitChart || [] };
    }
  } catch (err) {
    console.error("Edge function failed:", err);
  }

  // Fallback to direct query
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .eq("ebay_store_id", selectedStoreId)
    .order("created_at", { ascending: false })
    .limit(50);

  const orders = ordersData || [];
  return { orders, stats: buildStats(orders, 0), profitChart: [] };
}

function DashboardContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { session } = useAuth();
  const { data: stores = [] } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  // Auto-select first store
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  useEffect(() => {
    if (searchParams.get("ebay") === "connected") {
      toast.success("eBay store connected successfully!");
      searchParams.delete("ebay");
      setSearchParams(searchParams, { replace: true });
    }
    if (searchParams.get("billing") === "success") {
      toast.success("Welcome to Airborne! Your 3-day trial has started.");
      searchParams.delete("billing");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", selectedStoreId],
    queryFn: () => fetchDashboardData(selectedStoreId, session!.access_token, session!.user.id),
    enabled: !!selectedStoreId && !!session?.access_token,
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
  });

  const orders = dashboardData?.orders || [];
  const stats = dashboardData?.stats || { total_profit: 0, total_orders: 0, completed_orders: 0, pending_orders: 0, active_listings: 0 };
  const profitChart = dashboardData?.profitChart || [];

  return (
    <DashboardLayout
      title="Overview"
      stores={stores}
      selectedStoreId={selectedStoreId}
      onStoreChange={setSelectedStoreId}
    >
      <OverviewTab stats={stats} orders={orders} profitChart={profitChart} />
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard requireSubscription>
      <DashboardContent />
    </AuthGuard>
  );
}
