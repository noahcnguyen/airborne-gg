import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreData } from "@/hooks/useDashboardData";
import { useUserPlan } from "@/hooks/useUserPlan";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreOption {
  id: string;
  ebay_username: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: List, label: "Autolister", path: "/autolister" },
  { icon: Store, label: "My Stores", path: "/stores" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  stores?: StoreOption[];
  selectedStoreId?: string;
  onStoreChange?: (storeId: string) => void;
}

export function DashboardLayout({ children, title, stores, selectedStoreId, onStoreChange }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeData } = useStoreData();
  const { planLabel } = useUserPlan();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = userName.slice(0, 2).toUpperCase();
  const rawAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  // Convert Discord animated avatars (hash starts with a_) to .gif
  const avatarUrl = rawAvatarUrl?.includes("cdn.discordapp.com") && rawAvatarUrl.match(/\/a_[a-f0-9]+\./)
    ? rawAvatarUrl.replace(/\.(png|webp|jpg)(\?|$)/, ".gif$2")
    : rawAvatarUrl;

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
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
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
              <p className="text-xs text-muted-foreground">{planLabel || <span className="opacity-0">Loading</span>}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            {stores && stores.length > 0 && onStoreChange ? (
              <Select value={selectedStoreId} onValueChange={onStoreChange}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.ebay_username || "eBay Store"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-1.5 bg-surface-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                {storeData ? storeData.ebay_username : "No store connected"}
              </div>
            )}
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

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
