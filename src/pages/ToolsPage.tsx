import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function ManualOrderPanel() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/manual-order", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcG50eHlmdG9sa2NyYnVtZ2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTgyNzIsImV4cCI6MjA5MTI3NDI3Mn0.XlJ6hNFR-2ZJFHUZu2vS2uxwsv_z8mMH_1FQuJS2n90", "Content-Type": "application/json" },
        body: JSON.stringify({ ebay_order_id: orderId.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Request failed");
      toast.success("Manual order created successfully.");
      setOrderId("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manual Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ebay-order-id">eBay Order ID</Label>
            <Input
              id="ebay-order-id"
              placeholder="Enter eBay Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading || !orderId.trim()} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Place Order
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AsinLookupPanel() {
  const [legacyId, setLegacyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [asin, setAsin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legacyId.trim()) return;
    setLoading(true);
    setAsin(null);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(
        `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/asin-lookup?legacy_id=${encodeURIComponent(legacyId.trim())}`,
        { headers: { "Authorization": `Bearer ${token}`, "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcG50eHlmdG9sa2NyYnVtZ2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTgyNzIsImV4cCI6MjA5MTI3NDI3Mn0.XlJ6hNFR-2ZJFHUZu2vS2uxwsv_z8mMH_1FQuJS2n90", "Content-Type": "application/json" } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Lookup failed");
      setAsin(data.asin || data.ASIN || JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!asin) return;
    await navigator.clipboard.writeText(asin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ASIN Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legacy-item-id">eBay Legacy Item ID</Label>
            <Input
              id="legacy-item-id"
              placeholder="Enter eBay Legacy Item ID"
              value={legacyId}
              onChange={(e) => setLegacyId(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading || !legacyId.trim()} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Look Up ASIN
          </Button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}

        {asin && (
          <div className="mt-4 p-4 rounded-lg bg-surface-1 border flex items-center justify-between gap-3">
            <span className="text-xl font-semibold text-foreground font-mono">{asin}</span>
            <Button variant="ghost" size="sm" className="shrink-0" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  return (
    <DashboardLayout title="Tools">
      <div className="grid grid-cols-1 gap-6">
        <ManualOrderPanel />
        <AsinLookupPanel />
      </div>
    </DashboardLayout>
  );
}
