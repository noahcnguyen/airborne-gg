import { Lock, Plus, Store, X, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { StoreData } from "@/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface StoresTabProps {
  stores: StoreData[];
  loading: boolean;
  onStoresChanged?: () => void;
}

const PLAN_CONFIG: Record<string, { stores: number; listings: number; label: string }> = {
  starter: { stores: 1, listings: 1000, label: "Starter Plan: 1 store allowed, 1,000 listings per store." },
  growth: { stores: 1, listings: 2500, label: "Growth Plan: 1 store allowed, 2,500 listings per store." },
  advanced: { stores: 2, listings: 10000, label: "Advanced Plan: 2 stores allowed, 10,000 listings per store · 20,000 total listings." },
  pro: { stores: 3, listings: 25000, label: "Pro Plan: 3 stores allowed, 25,000 listings per store · 75,000 total listings." },
};

function getSubscriptionPlan(stores: StoreData[]): string {
  const sub = stores[0]?.subscription;
  if (sub && PLAN_CONFIG[sub.toLowerCase()]) return sub.toLowerCase();
  return "starter";
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function StoresTab({ stores, loading, onStoresChanged }: StoresTabProps) {
  const { user } = useAuth();

  const plan = getSubscriptionPlan(stores);
  const config = PLAN_CONFIG[plan];
  const storeLimit = config.stores;
  const listingLimit = config.listings;
  const connectedCount = stores.length;
  const availableSlots = Math.max(0, storeLimit - connectedCount);
  const atLimit = connectedCount >= storeLimit;

  const disconnectStore = async (storeId: string) => {
    const { error } = await supabase
      .from("ebay_stores")
      .delete()
      .eq("id", storeId);

    if (error) {
      toast.error("Failed to remove store");
    } else {
      toast.success("Store removed successfully");
      onStoresChanged?.();
    }
  };

  const handleConnectStore = () => {
    const userId = user?.id;
    const scopes = [
      "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
      "https://api.ebay.com/oauth/api_scope/sell.finances",
      "https://api.ebay.com/oauth/api_scope/sell.inventory",
      "https://api.ebay.com/oauth/api_scope/sell.account",
      "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: "NohNgyen-Airborne-PRD-36c1164ac-4eb558e5",
      response_type: "code",
      redirect_uri: "Noh_Ngyen-NohNgyen-Airbor-tohbcuscg",
      scope: scopes,
      state: userId || "",
      prompt: "login",
    });

    window.location.href = `https://auth.ebay.com/oauth2/authorize?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent/50 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm">
          <span className="font-medium">{config.label}</span>
        </p>
      </div>

      <div className="space-y-4">
        {stores.map((store, i) => {
          const used = store.items_used ?? 0;
          const pct = listingLimit > 0 ? (used / listingLimit) * 100 : 0;
          const usageColor = pct >= 100 ? "text-destructive" : pct >= 80 ? "text-orange-500" : "text-muted-foreground";

          return (
            <div key={store.id || store.ebay_username + i} className="bg-card rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {store.ebay_username || "eBay Store"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(store.connected_at).toLocaleDateString()}
                    </p>
                    <p className={`text-xs mt-0.5 ${usageColor}`}>
                      {formatNumber(used)} / {formatNumber(listingLimit)} listings used
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-500">
                    Connected
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove store?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this eBay store and stop all order fulfillment for it. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => store.id && disconnectStore(store.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          );
        })}

        {Array.from({ length: availableSlots }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-1 rounded-xl border border-dashed p-5 flex items-center justify-center gap-3 text-muted-foreground"
          >
            <Lock className="h-4 w-4" />
            <span className="text-sm">Available store slot</span>
          </div>
        ))}
      </div>

      {!atLimit ? (
        <Button
          className="gradient-primary-bg text-primary-foreground rounded-md gap-2"
          onClick={handleConnectStore}
        >
          <Plus className="h-4 w-4" /> Connect Store
        </Button>
      ) : (
        <a href="https://www.airborne.gg/#pricing">
          <Button variant="secondary" className="rounded-md gap-2 text-muted-foreground">
            <ArrowUpCircle className="h-4 w-4" /> Upgrade to add more stores →
          </Button>
        </a>
      )}
    </div>
  );
}