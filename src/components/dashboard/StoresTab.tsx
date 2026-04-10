import { Lock, Plus, Store, X, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { StoreData } from "@/hooks/useDashboardData";
import { useUserPlan } from "@/hooks/useUserPlan";
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

export function StoresTab({ stores, loading, onStoresChanged }: StoresTabProps) {
  const { user } = useAuth();
  const { plan, planLabel } = useUserPlan();

  const PLAN_STORE_LIMITS: Record<string, number> = {
    free: 0,
    starter: 1,
    advanced: 2,
    pro: 5,
    founder: 2,
  };

  const storeLimit = PLAN_STORE_LIMITS[plan || 'free'] ?? 0;
  const connectedCount = stores.length;
  const availableSlots = Math.max(0, storeLimit - connectedCount);

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
          <span className="font-medium">{planLabel}:</span> {storeLimit} stores allowed. {connectedCount} connected, {availableSlots} slots available.
        </p>
      </div>

      <div className="space-y-4">
        {stores.map((store, i) => (
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
        ))}

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

      {connectedCount < storeLimit ? (
        <Button
          className="gradient-primary-bg text-primary-foreground rounded-md gap-2"
          onClick={handleConnectStore}
        >
          <Plus className="h-4 w-4" /> Connect Store
        </Button>
      ) : (
        <div className="bg-accent/50 border border-dashed rounded-xl p-5 flex items-center justify-center gap-3 text-muted-foreground">
          <ArrowUpCircle className="h-4 w-4" />
          <span className="text-sm">Upgrade your plan to add more stores</span>
        </div>
      )}
    </div>
  );
}
