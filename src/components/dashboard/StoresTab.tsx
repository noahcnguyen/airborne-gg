import { Lock, Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { StoreData } from "@/hooks/useDashboardData";

interface StoresTabProps {
  stores: StoreData[];
  loading: boolean;
}

export function StoresTab({ stores, loading }: StoresTabProps) {
  const { user } = useAuth();

  const maxSlots = 2;
  const connectedCount = stores.length;
  const availableSlots = Math.max(0, maxSlots - connectedCount);

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
          <span className="font-medium">Advanced Plan:</span> {maxSlots} stores allowed. {connectedCount} connected, {availableSlots} slots available.
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
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-500">
                Connected
              </span>
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

      {availableSlots > 0 && (
        <Button
          className="gradient-primary-bg text-primary-foreground rounded-md gap-2"
          onClick={handleConnectStore}
        >
          <Plus className="h-4 w-4" /> Connect Store
        </Button>
      )}
    </div>
  );
}
