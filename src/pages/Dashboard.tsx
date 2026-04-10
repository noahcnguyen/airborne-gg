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

function DashboardContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total_profit: 0, total_orders: 0, completed_orders: 0, pending_orders: 0, active_listings: 0 });
  const [profitChart, setProfitChart] = useState<ProfitChartPoint[]>([]);

  useEffect(() => {
    if (searchParams.get("ebay") === "connected") {
      toast.success("eBay store connected successfully!");
      searchParams.delete("ebay");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return;

        let edgeFunctionWorked = false;
        try {
          const res = await fetch(
            'https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data',
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.orders) {
              setOrders(data.orders);
              const allOrders = data.orders;
              const sold = allOrders.filter((o: any) =>
                ['completed', 'submitted_to_zinc', 'awaiting_tba_conversion', 'tracking_pending_manual_carrier'].includes(o.state)
              );
              setStats({
                total_profit: sold.reduce((sum: number, o: any) => sum + (o.actual_profit_cents / 100), 0),
                total_orders: allOrders.length,
                completed_orders: sold.length,
                pending_orders: allOrders.filter((o: any) => o.state === 'submitted_to_zinc').length,
                active_listings: data.stats?.active_listings || 0,
              });
            } else if (data.stats) {
              setStats(data.stats);
            }
            if (data.profitChart) setProfitChart(data.profitChart);
            edgeFunctionWorked = true;
          }
        } catch (err) {
          console.error('Edge function failed:', err);
        }

        if (!edgeFunctionWorked) {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          if (ordersData && ordersData.length > 0) {
            setOrders(ordersData);
            const sold = ordersData.filter((o: any) =>
              ['completed', 'submitted_to_zinc', 'awaiting_tba_conversion', 'tracking_pending_manual_carrier'].includes(o.state)
            );
            setStats({
              total_profit: sold.reduce((sum: number, o: any) => sum + (o.actual_profit_cents / 100), 0),
              total_orders: ordersData.length,
              completed_orders: sold.length,
              pending_orders: ordersData.filter((o: any) => o.state === 'submitted_to_zinc').length,
              active_listings: 0,
            });
          }
        }


      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <DashboardLayout title="Overview">
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
