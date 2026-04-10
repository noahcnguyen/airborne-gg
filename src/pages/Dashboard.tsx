import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
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

interface ProfitChartPoint {
  date: string;
  profit: number;
}

interface StoreOption {
  id: string;
  ebay_username: string;
  connected_at: string;
  is_active: boolean;
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
  if (orderIds.length === 0) {
    return orders;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("ebay_order_id, amazon_url, created_at")
    .eq("user_id", userId)
    .in("ebay_order_id", orderIds);

  if (error || !data?.length) {
    return orders;
  }

  const orderDataMap = new Map(data.map((order) => [order.ebay_order_id, order]));

  return orders.map((order) => ({
    ...order,
    ...orderDataMap.get(order.ebay_order_id),
  }));
}

function DashboardContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total_profit: 0, total_orders: 0, completed_orders: 0, pending_orders: 0, active_listings: 0 });
  const [profitChart, setProfitChart] = useState<ProfitChartPoint[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  // Fetch connected stores on mount
  useEffect(() => {
    if (!user) return;

    const fetchStores = async () => {
      const { data: storesData } = await supabase
        .from("ebay_stores")
        .select("id, ebay_username, connected_at, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("connected_at", { ascending: true });

      if (storesData) {
        setStores(storesData);
        if (storesData.length > 0 && !selectedStoreId) {
          setSelectedStoreId(storesData[0].id);
        }
      }
    };

    fetchStores();
  }, [user]);

  useEffect(() => {
    if (searchParams.get("ebay") === "connected") {
      toast.success("eBay store connected successfully!");
      searchParams.delete("ebay");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch dashboard data when selectedStoreId changes
  useEffect(() => {
    if (!user || !selectedStoreId) return;

    const fetchData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return;

        let edgeFunctionWorked = false;
        try {
          const res = await fetch(
            `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data?store_id=${selectedStoreId}`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.orders) {
              const enrichedOrders = await enrichOrdersWithAmazonData(data.orders, session.user.id);
              setOrders(enrichedOrders);
              setStats(buildStats(enrichedOrders, data.stats?.active_listings || 0));
            } else if (data.stats) {
              setStats(data.stats);
            }
            if (data.profitChart) setProfitChart(data.profitChart);
            if (data.stores) setStores(data.stores);
            edgeFunctionWorked = true;
          }
        } catch (err) {
          console.error("Edge function failed:", err);
        }

        if (!edgeFunctionWorked) {
          const { data: ordersData } = await supabase
            .from("orders")
            .select("*")
            .eq("store_id", selectedStoreId)
            .order("created_at", { ascending: false })
            .limit(50);
          if (ordersData && ordersData.length > 0) {
            setOrders(ordersData);
            setStats(buildStats(ordersData, 0));
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user, selectedStoreId]);

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
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
