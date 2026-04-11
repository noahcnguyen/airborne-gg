import React, { useState, useEffect } from "react";
import { Plus, Info, Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface PoolResult {
  asin: string;
  status: string;
  ebay_url?: string;
}

function AutolisterContent() {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [listingTab, setListingTab] = useState<"products" | "leads" | "autopilot">("products");
  const [asinInput, setAsinInput] = useState("");
  const [autopilotCount, setAutopilotCount] = useState("300");
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeInfoLoading, setStoreInfoLoading] = useState(false);

  // Airborne's Pool state
  const [poolQuantity, setPoolQuantity] = useState(5);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolResults, setPoolResults] = useState<PoolResult[]>([]);

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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        let accessToken = session?.access_token;

        if (sessionError || !session) {
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (!refreshData.session) {
            setStoreInfo(null);
            setStoreInfoLoading(false);
            return;
          }
          accessToken = refreshData.session.access_token;
        }

        const res = await fetch(
          `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/ebay-store-info${selectedStoreId ? `?store_id=${selectedStoreId}` : ''}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        console.log('Store info:', data);
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

  const handlePoolList = async () => {
    if (!user) return;
    setPoolLoading(true);
    setPoolResults([]);
    try {
      const { data: storeData } = await supabase
        .from('ebay_stores')
        .select('id, refresh_token')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('connected_at', { ascending: true })
        .limit(1)
        .single();

      if (!storeData) {
        toast.error('No eBay store connected');
        return;
      }

      const res = await fetch('https://api.airborne.gg/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': 'Roxie$!21518@19129',
        },
        body: JSON.stringify({
          user_id: user.id,
          store_id: storeData.id,
          refresh_token: storeData.refresh_token,
          quantity: poolQuantity,
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Listed ${data.success} items successfully!`);
        setPoolResults(data.results || []);
      }
    } catch {
      toast.error('Failed to connect to listing server');
    } finally {
      setPoolLoading(false);
    }
  };

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
        {/* Manage Listings Panel */}
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">How many items to list? (max 25)</label>
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    placeholder="5"
                    value={poolQuantity}
                    onChange={(e) => setPoolQuantity(Math.min(25, Math.max(1, Number(e.target.value) || 1)))}
                    className="rounded-lg h-11 w-32"
                  />
                </div>
                <Button
                  onClick={handlePoolList}
                  disabled={poolLoading}
                  className="gradient-primary-bg text-primary-foreground rounded-lg gap-2"
                >
                  {poolLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {poolLoading ? "Listing..." : "List Items"}
                </Button>

                {poolResults.length > 0 && (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ASIN</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>eBay Listing</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {poolResults.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-sm">{result.asin}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1.5 text-sm ${
                                result.status === 'success' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {result.status === 'success' ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                {result.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {result.ebay_url ? (
                                <a
                                  href={result.ebay_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  View <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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

        {/* Store Info Panel */}
        {storeInfoLoading ? (
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : storeInfo && (
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">eBay Store Subscription</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                {storeInfo.subscription}
              </span>
              <span className="text-sm text-muted-foreground">{storeInfo.free_listings?.toLocaleString()}/mo free listings</span>
            </div>
            <p className="text-sm font-medium mb-3">Monthly Selling Limits</p>
            <p className="text-xs text-muted-foreground mb-4">
              You've used {(storeInfo.items_used ?? 0).toLocaleString()} of {(storeInfo.items_limit ?? 0).toLocaleString()} items
                  and ${(storeInfo.amount_used ?? 0).toLocaleString()} of ${(storeInfo.amount_limit ?? 0).toLocaleString()} USD this month.
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Items</span>
                  <span>{(storeInfo.items_used ?? 0).toLocaleString()} / {(storeInfo.items_limit ?? 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${storeInfo.items_limit > 0 ? Math.min((storeInfo.items_used / storeInfo.items_limit) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Amount</span>
                  <span>${(storeInfo.amount_used ?? 0).toLocaleString()} / ${(storeInfo.amount_limit ?? 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${storeInfo.amount_limit > 0 ? Math.min((storeInfo.amount_used / storeInfo.amount_limit) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
