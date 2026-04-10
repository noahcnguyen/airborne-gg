import React, { useState, useEffect } from "react";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreOption {
  id: string;
  ebay_username: string;
}

interface StoreInfo {
  subscription: string;
  free_listings: number;
  items_limit: number;
  items_used: number;
  amount_limit: number;
  amount_used: number;
}

function AutolisterContent() {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [listingTab, setListingTab] = useState<"products" | "leads" | "autopilot">("products");
  const [asinInput, setAsinInput] = useState("");
  const [leadsCount, setLeadsCount] = useState("");
  const [autopilotCount, setAutopilotCount] = useState("300");
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeInfoLoading, setStoreInfoLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStores = async () => {
      const { data } = await supabase
        .from("ebay_stores")
        .select("id, ebay_username, connected_at, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("connected_at", { ascending: true });
      if (data) {
        setStores(data);
        if (data.length > 0 && !selectedStoreId) {
          setSelectedStoreId(data[0].id);
        }
      }
    };
    fetchStores();
  }, [user]);

  useEffect(() => {
    if (!selectedStoreId) return;
    const fetchStoreInfo = async () => {
      setStoreInfoLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/ebay-store-info?store_id=${selectedStoreId}`,
          { headers: { Authorization: `Bearer ${session?.access_token}` } }
        );
        const data = await res.json();
        if (data && !data.error) setStoreInfo(data);
        else setStoreInfo(null);
      } catch {
        setStoreInfo(null);
      } finally {
        setStoreInfoLoading(false);
      }
    };
    fetchStoreInfo();
  }, [selectedStoreId]);

  const listingTabs = [
    { id: "products" as const, label: "List My Products" },
    { id: "leads" as const, label: "Airborne's Pool" },
    { id: "autopilot" as const, label: "Autopilot" },
  ];

  return (
    <DashboardLayout
      title="Autolister"
      stores={stores}
      selectedStoreId={selectedStoreId}
      onStoreChange={setSelectedStoreId}
    >
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
    </DashboardLayout>
  );
}

export default function AutolisterPage() {
  return (
    <AuthGuard>
      <AutolisterContent />
    </AuthGuard>
  );
}
