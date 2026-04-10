import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plane,
  LayoutDashboard,
  ShoppingCart,
  List,
  Store,
  Settings,
  Bell,
  RefreshCw,
  LogOut,
  Plus,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { toast } from "sonner";
import { useStoreData } from "@/hooks/useDashboardData";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { StoresTab } from "@/components/dashboard/StoresTab";
import { supabase } from "@/lib/supabase";

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

type Tab = "overview" | "orders" | "autolister" | "stores" | "settings";

const navItems: { icon: typeof LayoutDashboard; label: string; tab: Tab }[] = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "overview" },
  { icon: ShoppingCart, label: "Orders", tab: "orders" },
  { icon: List, label: "Autolister", tab: "autolister" },
  { icon: Store, label: "My Stores", tab: "stores" },
  { icon: Settings, label: "Settings", tab: "settings" },
];

function OrdersTab({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-card rounded-xl border">
      <div className="p-5 border-b">
        <h3 className="font-semibold">Orders</h3>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-3 px-4">eBay Order ID</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Carrier</th>
                <th className="text-left py-3 px-4">Tracking</th>
                <th className="text-right py-3 px-4">Earnings</th>
                <th className="text-right py-3 px-4">Cost</th>
                <th className="text-right py-3 px-4">Profit</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.ebay_order_id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono text-xs">{order.ebay_order_id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.state === 'completed' ? 'bg-green-100 text-green-700' :
                      order.state === 'submitted_to_zinc' ? 'bg-blue-100 text-blue-700' :
                      order.state === 'zinc_failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.state}
                    </span>
                  </td>
                  <td className="py-3 px-4">{order.tracking_carrier || '—'}</td>
                  <td className="py-3 px-4 font-mono text-xs">{order.tracking_number || '—'}</td>
                  <td className="py-3 px-4 text-right">${(order.payout_estimate_cents / 100).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">${(order.actual_amazon_total_cents / 100).toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${order.actual_profit_cents > 0 ? 'text-green-600' : order.actual_profit_cents < 0 ? 'text-red-600' : ''}`}>
                    ${(order.actual_profit_cents / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AutolisterTab() {
  const [listingTab, setListingTab] = useState<"products" | "leads" | "autopilot">("products");
  const [asinInput, setAsinInput] = useState("");
  const [leadsCount, setLeadsCount] = useState("");
  const [autopilotCount, setAutopilotCount] = useState("300");

  const listingTabs = [
    { id: "products" as const, label: "List My Products" },
    { id: "leads" as const, label: "Airborne's Pool" },
    { id: "autopilot" as const, label: "Autopilot" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Manage Listings</h3>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            {listingTabs.map((tab) => (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => setListingTab(tab.id)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    listingTab === tab.id
                      ? "gradient-primary-bg text-primary-foreground font-medium"
                      : "bg-surface-1 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </React.Fragment>
            ))}
          </div>

          {listingTab === "products" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Enter up to 50 ASINs (comma separated)</p>
                <button className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                  <Plus className="h-3.5 w-3.5" /> Upload CSV
                </button>
              </div>
              <Input
                placeholder="e.g. B012345678, B0ABCDEFGH1"
                value={asinInput}
                onChange={(e) => setAsinInput(e.target.value)}
                className="rounded-lg h-11"
              />
              <Button className="gradient-primary-bg text-primary-foreground rounded-lg gap-2">List ASIN(s)</Button>
            </div>
          )}

          {listingTab === "leads" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">List up to 25 items at a time (numbers only)</p>
              <Input
                type="number"
                placeholder="Enter a number (max 25)"
                value={leadsCount}
                onChange={(e) => setLeadsCount(e.target.value)}
                className="rounded-lg h-11"
              />
              <Button className="gradient-primary-bg text-primary-foreground rounded-lg gap-2">List</Button>
            </div>
          )}

          {listingTab === "autopilot" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Choose how many listings you want automatically listed to your store daily
              </p>
              <Input
                type="number"
                placeholder="300"
                value={autopilotCount}
                onChange={(e) => setAutopilotCount(e.target.value)}
                className="rounded-lg h-11"
              />
              <Button className="gradient-primary-bg text-primary-foreground rounded-lg gap-2">Save preference</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "overview";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { storeData, loading: storeLoading } = useStoreData();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total_profit: 0, total_orders: 0, completed_orders: 0, pending_orders: 0, active_listings: 0 });
  const [profitChart, setProfitChart] = useState<ProfitChartPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error('No session:', error);
          return;
        }

        // Try edge function first
        let edgeFunctionWorked = false;
        try {
          const res = await fetch(
            'https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            console.log('Dashboard data:', data);
            if (data.orders) setOrders(data.orders);
            if (data.stats) setStats(data.stats);
            if (data.profitChart) setProfitChart(data.profitChart);
            edgeFunctionWorked = true;
          }
        } catch (err) {
          console.error('Edge function failed, falling back to direct query:', err);
        }

        // Fallback: query Supabase directly
        if (!edgeFunctionWorked) {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

          if (ordersData && ordersData.length > 0) {
            setOrders(ordersData);
            const completed = ordersData.filter((o: any) => o.state === 'completed');
            const sold = ordersData.filter((o: any) =>
              ['completed', 'submitted_to_zinc', 'awaiting_tba_conversion', 'tracking_pending_manual_carrier'].includes(o.state)
            );
            setStats({
              total_profit: completed.reduce((sum: number, o: any) => sum + (o.actual_profit_cents / 100), 0),
              total_orders: ordersData.length,
              completed_orders: sold.length,
              pending_orders: ordersData.filter((o: any) => o.state === 'submitted_to_zinc').length,
              active_listings: 0,
            });
          }
        }

        // Fetch active eBay listing count via edge function
        try {
          const listingRes = await fetch(
            'https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/ebay-listing-count',
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (listingRes.ok) {
            const listingData = await listingRes.json();
            if (listingData.total > 0) {
              setStats(prev => ({ ...prev, active_listings: listingData.total }));
            }
          }
        } catch (e) {
          console.error('eBay listings fetch failed:', e);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as Tab | null;
    if (tabParam && tabParam !== activeTab && ["overview", "orders", "autolister", "stores", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("ebay") === "connected") {
      toast.success("eBay store connected successfully!");
      setActiveTab("stores");
      searchParams.delete("ebay");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (activeTab === "settings") {
    navigate("/settings");
    return null;
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = userName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const tabTitles: Record<Tab, string> = {
    overview: "Overview",
    orders: "Orders",
    autolister: "Autolister",
    stores: "My Stores",
    settings: "Settings",
  };

  return (
    <div className="min-h-screen flex bg-surface-1">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col z-40">
        <div className="p-5 flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Airborne</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.tab
                  ? "bg-accent text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-lg gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Advanced Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{tabTitles[activeTab]}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-surface-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
              {storeData ? storeData.ebay_username : "No store connected"}
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="p-6">
          {activeTab === "overview" && <OverviewTab stats={stats} orders={orders} profitChart={profitChart} />}
          {activeTab === "orders" && <OrdersTab orders={orders} />}
          {activeTab === "autolister" && <AutolisterTab />}
          {activeTab === "stores" && <StoresTab storeData={storeData} loading={storeLoading} />}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
