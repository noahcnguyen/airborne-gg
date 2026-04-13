import React, { useState, useEffect } from "react";
import { Plus, Info, Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  const [poolProgress, setPoolProgress] = useState(0);
  const [poolStatusText, setPoolStatusText] = useState("");

  // List My Products state
  const [asinLoading, setAsinLoading] = useState(false);
  const [asinResults, setAsinResults] = useState<PoolResult[]>([]);
  const [asinProgress, setAsinProgress] = useState(0);
  const [asinStatusText, setAsinStatusText] = useState("");

  // Pool progress animation
  useEffect(() => {
    if (!poolLoading) return;
    setPoolProgress(0);
    const total = poolQuantity * 8000;
    const interval = 100;
    let elapsed = 0;
    let currentItem = 1;
    const itemInterval = 8000;
    const timer = setInterval(() => {
      elapsed += interval;
      setPoolProgress(Math.min((elapsed / total) * 95, 95));
      const newItem = Math.min(Math.floor(elapsed / itemInterval) + 1, poolQuantity);
      if (newItem !== currentItem) currentItem = newItem;
      setPoolStatusText(`Listing ${currentItem} of ${poolQuantity}...`);
      if (elapsed >= total) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [poolLoading, poolQuantity]);

  // Pool completion
  useEffect(() => {
    if (!poolLoading && poolResults.length > 0) {
      setPoolProgress(100);
      const successCount = poolResults.filter(r => r.status === 'success').length;
      setPoolStatusText(`${successCount}/${poolResults.length} listed successfully`);
    }
  }, [poolLoading, poolResults]);

  // ASIN progress animation
  useEffect(() => {
    if (!asinLoading) return;
    setAsinProgress(0);
    const asinCount = asinInput.split(",").map(s => s.trim()).filter(Boolean).length || 1;
    const total = asinCount * 8000;
    const interval = 100;
    let elapsed = 0;
    let currentItem = 1;
    const itemInterval = 8000;
    const timer = setInterval(() => {
      elapsed += interval;
      setAsinProgress(Math.min((elapsed / total) * 95, 95));
      const newItem = Math.min(Math.floor(elapsed / itemInterval) + 1, asinCount);
      if (newItem !== currentItem) currentItem = newItem;
      setAsinStatusText(`Listing ${currentItem} of ${asinCount}...`);
      if (elapsed >= total) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [asinLoading, asinInput]);

  // ASIN completion
  useEffect(() => {
    if (!asinLoading && asinResults.length > 0) {
      setAsinProgress(100);
      const successCount = asinResults.filter(r => r.status === 'success').length;
      setAsinStatusText(`${successCount}/${asinResults.length} listed successfully`);
    }
  }, [asinLoading, asinResults]);

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
    if (!selectedStoreId || !user) return;
    let cancelled = false;
    const fetchStoreInfo = async () => {
      setStoreInfoLoading(true);
      try {
        const { data, error } = await supabase
          .from('ebay_stores')
          .select('subscription, free_listings, items_used, items_limit, amount_used, amount_limit')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('id', selectedStoreId)
          .maybeSingle();

        console.log('storeInfo fetch result:', { data, error, selectedStoreId });
        if (!cancelled) {
          if (data && !error) {
            setStoreInfo(data);
          } else {
            setStoreInfo(null);
          }
        }
      } catch (err) {
        console.error('storeInfo fetch error:', err);
        if (!cancelled) setStoreInfo(null);
      } finally {
        if (!cancelled) setStoreInfoLoading(false);
      }
    };
    fetchStoreInfo();
    return () => { cancelled = true; };
  }, [selectedStoreId, user]);

  const handleListingError = (data: { error: string; error_code?: string }) => {
    const upgradeErrors = ['airborne_plan_limit_reached', 'airborne_store_limit_reached'];
    if (data.error_code && upgradeErrors.includes(data.error_code)) {
      toast.error(data.error, {
        action: {
          label: 'Upgrade Plan',
          onClick: () => window.open('https://www.airborne.gg/#pricing', '_blank'),
        },
      });
    } else {
      toast.error(data.error);
    }
  };

  const handlePoolList = async () => {
    console.log('[Autolister] Pool List button clicked, quantity:', poolQuantity, 'store:', selectedStoreId);
    setPoolLoading(true);
    setPoolResults([]);
    setPoolProgress(0);
    setPoolStatusText("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        console.error('[Autolister] No session found:', sessionError);
        toast.error('Not logged in — please refresh and try again');
        return;
      }
      console.log('[Autolister] user_id:', session.user.id);
      console.log('[Autolister] session token:', session.access_token?.substring(0, 20));

      const requestBody = {
        quantity: poolQuantity,
        store_id: selectedStoreId,
      };

      console.log('[Autolister] Invoking trigger-listing with:', JSON.stringify(requestBody));

      const { data, error: fnError } = await supabase.functions.invoke('trigger-listing', {
        body: requestBody,
      });

      console.log('[Autolister] Response:', JSON.stringify(data), 'Error:', fnError);

      if (fnError) {
        console.error('[Autolister] Edge function error:', fnError);
        toast.error('Failed to connect to listing server');
        return;
      }

      if (data.error) {
        handleListingError(data);
      } else {
        toast.success(`Listed ${data.success ?? 0} of ${data.total ?? 0} items!`);
        setPoolResults(data.results || []);
        if (data.ebay_limit_warning) {
          toast.warning(data.ebay_limit_warning);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[Autolister] CATCH ERROR:', error);
      console.error('[Autolister] Error name:', error?.name);
      console.error('[Autolister] Error message:', error?.message);
      console.error('[Autolister] Error stack:', error?.stack);
      toast.error('Failed to connect to listing server');
    } finally {
      setPoolLoading(false);
    }
  };

  const handleAsinList = async () => {
    const asins = asinInput.split(",").map(s => s.trim()).filter(Boolean);
    if (asins.length === 0) { toast.error("Enter at least one ASIN"); return; }
    console.log('[Autolister] ASIN List button clicked, asins:', asins, 'store:', selectedStoreId);
    setAsinLoading(true);
    setAsinResults([]);
    setAsinProgress(0);
    setAsinStatusText("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        console.error('[Autolister] No session found:', sessionError);
        toast.error('Not logged in — please refresh and try again');
        return;
      }
      console.log('[Autolister] user_id:', session.user.id);
      console.log('[Autolister] session token:', session.access_token?.substring(0, 20));

      const requestBody = {
        asins,
        store_id: selectedStoreId,
      };
      console.log('[Autolister] Sending ASIN request:', requestBody);

      const { data, error: fnError } = await supabase.functions.invoke('trigger-listing', {
        body: requestBody,
      });

      console.log('[Autolister] ASIN response:', data, 'Error:', fnError);

      if (fnError) {
        console.error('[Autolister] Edge function error:', fnError);
        toast.error('Failed to connect to listing server');
        return;
      }

      if (data.error) {
        handleListingError(data);
      } else {
        toast.success(`Listed ${data.success ?? 0} of ${data.total ?? 0} items!`);
        setAsinResults(data.results || []);
        if (data.ebay_limit_warning) {
          toast.warning(data.ebay_limit_warning);
        }
      }
    } catch {
      toast.error('Failed to connect to listing server');
    } finally {
      setAsinLoading(false);
    }
  };

  const listingTabs = [
    { id: "products" as const, label: "List My Products" },
    { id: "leads" as const, label: "Airborne's Pool" },
    { id: "autopilot" as const, label: "Autopilot" },
  ];

  const renderResultsTable = (results: PoolResult[]) => (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ASIN</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-mono text-sm">{result.asin}</TableCell>
              <TableCell className="text-right">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderProgressSection = (loading: boolean, progress: number, statusText: string) => (
    (loading || progress > 0) && (
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className={`text-xs ${progress === 100 ? 'text-green-400 font-medium' : 'text-muted-foreground'}`}>
          {statusText}
        </p>
      </div>
    )
  );

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
              <div className="space-y-3">
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
                <Button
                  onClick={handleAsinList}
                  className="gradient-primary-bg text-primary-foreground rounded-lg gap-2"
                >
                  {asinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "List ASIN(s)"}
                </Button>
                {renderProgressSection(asinLoading, asinProgress, asinStatusText)}
                {asinResults.length > 0 && renderResultsTable(asinResults)}
              </div>
            )}

            {listingTab === "leads" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">How many items to list? (max 25)</p>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  value={poolQuantity}
                  onChange={(e) => setPoolQuantity(Math.min(25, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="rounded-lg h-11"
                />
                <Button
                  onClick={handlePoolList}
                  className="gradient-primary-bg text-primary-foreground rounded-lg gap-2"
                >
                  {poolLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "List Items"}
                </Button>
                {renderProgressSection(poolLoading, poolProgress, poolStatusText)}
                {poolResults.length > 0 && renderResultsTable(poolResults)}
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
  return <AutolisterContent />;
}
