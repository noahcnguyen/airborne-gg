import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  Package,
  ShoppingBag,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "overview" | "orders" | "autolister" | "stores" | "settings";

const navItems: { icon: typeof LayoutDashboard; label: string; tab: Tab }[] = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "overview" },
  { icon: ShoppingCart, label: "Orders", tab: "orders" },
  { icon: List, label: "Autolister", tab: "autolister" },
  { icon: Store, label: "My Stores", tab: "stores" },
  { icon: Settings, label: "Settings", tab: "settings" },
];

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden gradient-primary-bg p-6 pb-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute right-0 bottom-0 w-80 h-80" viewBox="0 0 400 400" fill="none">
            <circle cx="350" cy="350" r="200" fill="white" fillOpacity="0.1" />
            <circle cx="280" cy="280" r="150" fill="white" fillOpacity="0.08" />
            <circle cx="200" cy="200" r="100" fill="white" fillOpacity="0.05" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Welcome to your Airborne dashboard!</h1>
          <p className="text-sm text-primary-foreground/70 mt-1">Connect a store to get started.</p>
        </div>
      </div>

      {/* Empty state cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No store connected</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Connect your eBay store to see revenue charts, order data, and listing analytics here.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">0</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active Listings</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">0</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Sold</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                <span className="text-sm font-semibold">—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fulfillment Credits</span>
                <span className="text-sm font-semibold">—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price Alerts</span>
                <span className="text-sm font-semibold">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty orders table */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Recent Orders</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No orders yet. Orders will appear here once your store is connected.</p>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="bg-card rounded-xl border">
      <div className="p-5 border-b">
        <h3 className="font-semibold">Orders</h3>
      </div>
      <div className="p-8 text-center text-muted-foreground">
        <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No orders yet. Connect a store to start tracking orders.</p>
      </div>
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
      {/* Listing Manager */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Manage Listings</h3>
        </div>
        <div className="p-5 space-y-5">
          {/* Tabs */}
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

          {/* Tab Content */}
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

function StoresTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-accent/50 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm">
          <span className="font-medium">Advanced Plan:</span> 2 stores allowed. 0 connected, 2 slots available.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-1 rounded-xl border border-dashed p-5 flex items-center justify-center gap-3 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Available store slot</span>
        </div>

        <div className="bg-surface-1 rounded-xl border border-dashed p-5 flex items-center justify-center gap-3 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Available store slot</span>
        </div>
      </div>

      <Button
        className="gradient-primary-bg text-primary-foreground rounded-md gap-2"
        onClick={() => {
          const userId = user?.id;
          const scopes = [
            "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
            "https://api.ebay.com/oauth/api_scope/sell.finances",
            "https://api.ebay.com/oauth/api_scope/sell.inventory",
            "https://api.ebay.com/oauth/api_scope/sell.account",
          ].join(" ");

          const params = new URLSearchParams({
            client_id: "NohNgyen-Airborne-PRD-36c1164ac-4eb558e5",
            response_type: "code",
            redirect_uri: "Noh_Ngyen-NohNgyen-Airbor-tohbcuscg",
            scope: scopes,
            state: userId || "",
          });

          window.location.href = `https://auth.ebay.com/oauth2/authorize?${params.toString()}`;
        }}
      >
        <Plus className="h-4 w-4" /> Connect Store
      </Button>
    </div>
  );
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const tabTitles: Record<Tab, string> = {
    overview: "Overview",
    orders: "Orders",
    autolister: "Autolister",
    stores: "My Stores",
    settings: "Settings",
  };

  return (
    <div className="min-h-screen flex bg-surface-1">
      {/* Sidebar */}
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
            <div className="w-9 h-9 rounded-lg gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Advanced Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{tabTitles[activeTab]}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-surface-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
              No store connected
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
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "autolister" && <AutolisterTab />}
          {activeTab === "stores" && <StoresTab />}
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
