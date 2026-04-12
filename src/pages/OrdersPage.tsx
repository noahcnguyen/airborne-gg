import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useStores } from "@/hooks/useStores";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function getTrackingUrl(carrier: string, trackingNumber: string): string | null {
  if (!trackingNumber) return null;
  const c = carrier?.toLowerCase() || "";
  if (c === "ups") return `https://www.ups.com/track?tracknum=${trackingNumber}&loc=en_US&requester=QUIC/trackdetails`;
  if (c === "usps") return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (c === "fedex") return `https://www.fedex.com/wtrk/track/?trknbr=${trackingNumber}`;
  if (c === "zinc") return `https://tracking.link/tracking?tracking_id=${trackingNumber}`;
  return null;
}

async function fetchOrders(storeId: string, accessToken: string) {
  try {
    const res = await fetch(
      `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data?store_id=${storeId}`,
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.orders) return data.orders;
    }
  } catch {}

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("ebay_store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}

function cents(v: any): string {
  const n = Number(v);
  if (isNaN(n)) return '—';
  return `$${(n / 100).toFixed(2)}`;
}

function DetailRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`text-sm text-right break-all ${className || ''}`}>{value ?? '—'}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-4 pb-2 border-b mb-2">
      <h4 className="text-sm font-semibold tracking-wide text-foreground">{title}</h4>
    </div>
  );
}

function OrderDetailView({ detail }: { detail: any }) {
  const buyer = detail.buyer || {};
  const items = Array.isArray(detail.items) ? detail.items : detail.item ? [detail.item] : [];
  const payment = detail.payment || {};

  const profitCents = Number(detail.actual_profit_cents);
  const profitColor = profitCents > 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="max-h-[80vh] overflow-y-auto space-y-1 text-sm pr-2 custom-scrollbar">
      {/* Order Info */}
      <SectionHeader title="Order Info" />
      <DetailRow label="eBay Order ID" value={detail.ebay_order_id} />
      <DetailRow label="Status" value={detail.state} />
      <DetailRow label="Created" value={detail.created_at ? new Date(detail.created_at).toLocaleString() : '—'} />
      {detail.amazon_order_id && (
        <DetailRow label="Amazon Order ID" value={detail.amazon_order_id} />
      )}
      {detail.amazon_url && (
        <DetailRow label="Amazon URL" value={
          <a href={detail.amazon_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            View on Amazon
          </a>
        } />
      )}

      {/* Shipping */}
      <SectionHeader title="Shipping" />
      <DetailRow label="Carrier" value={detail.tracking_carrier || '—'} />
      <DetailRow label="Tracking" value={
        detail.tracking_number ? (
          <a href={`https://www.google.com/search?q=${detail.tracking_number}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {detail.tracking_number}
          </a>
        ) : '—'
      } />
      {buyer.name && <DetailRow label="Name" value={buyer.name} />}
      {buyer.phone && <DetailRow label="Phone" value={buyer.phone} />}
      {buyer.address_line_1 && <DetailRow label="Address Line 1" value={buyer.address_line_1} />}
      {buyer.address_line_2 && <DetailRow label="Address Line 2" value={buyer.address_line_2} />}
      {(buyer.city || buyer.state || buyer.zip) && (
        <DetailRow label="City, State ZIP" value={`${buyer.city || ''}, ${buyer.state || ''} ${buyer.zip || ''}`.trim()} />
      )}
      {buyer.country && <DetailRow label="Country" value={buyer.country} />}

      {/* Items */}
      {items.length > 0 && (
        <>
          <SectionHeader title="Item" />
          {items.map((item: any, i: number) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price_cents || item.item_price_cents);
            const itemTotal = isNaN(price) ? null : qty * price;
            return (
              <div key={i} className={i > 0 ? 'pt-3 border-t' : ''}>
                {item.title && <DetailRow label="Title" value={item.title} />}
                {item.legacy_item_id && <DetailRow label="Legacy Item ID" value={item.legacy_item_id} />}
                <DetailRow label="Quantity" value={qty} />
                {!isNaN(price) && <DetailRow label="Item Price" value={cents(price)} />}
                {itemTotal !== null && <DetailRow label="Item Total" value={cents(itemTotal)} />}
              </div>
            );
          })}
        </>
      )}

      {/* Payment */}
      <SectionHeader title="Payment" />
      {payment.subtotal_cents != null && <DetailRow label="Subtotal" value={cents(payment.subtotal_cents)} />}
      {payment.shipping_cents != null && <DetailRow label="Shipping" value={cents(payment.shipping_cents)} />}
      {payment.sales_tax_cents != null && <DetailRow label="Sales Tax" value={cents(payment.sales_tax_cents)} />}
      <DetailRow label="Order Total" value={cents(detail.order_total_cents)} className="font-bold" />
      {detail.ebay_fee_cents != null && (
        <DetailRow label="eBay Fee" value={`-${cents(detail.ebay_fee_cents)}`} className="text-red-600" />
      )}
      <DetailRow label="Order Earnings" value={cents(detail.payout_estimate_cents)} className="font-bold" />
      <DetailRow label="Amazon Cost" value={cents(detail.actual_amazon_total_cents)} />
      <DetailRow label="Profit" value={cents(detail.actual_profit_cents)} className={`font-bold ${profitColor}`} />
    </div>
  );
}

function OrdersContent() {
  const { session } = useAuth();
  const { data: stores = [] } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", selectedStoreId],
    queryFn: () => fetchOrders(selectedStoreId, session!.access_token),
    enabled: !!selectedStoreId && !!session?.access_token,
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
  });

  const handleOrderDoubleClick = useCallback(async (ebayOrderId: string) => {
    setDetailLoading(true);
    setDetailOpen(true);
    setOrderDetail(null);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/order-details?ebay_order_id=${ebayOrderId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${currentSession?.access_token}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcG50eHlmdG9sa2NyYnVtZ2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTgyNzIsImV4cCI6MjA5MTI3NDI3Mn0.XlJ6hNFR-2ZJFHUZu2vS2uxwsv_z8mMH_1FQuJS2n90",
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch order details");
      const data = await response.json();
      setOrderDetail(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load order details");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <DashboardLayout
      title="Orders"
      stores={stores}
      selectedStoreId={selectedStoreId}
      onStoreChange={setSelectedStoreId}
    >
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
                {orders.map((order: any) => {
                  const trackingUrl = getTrackingUrl(order.tracking_carrier, order.tracking_number);
                  return (
                    <tr key={order.ebay_order_id} className="border-b hover:bg-muted/50 cursor-pointer" onDoubleClick={() => handleOrderDoubleClick(order.ebay_order_id)}>
                      <td className="py-3 px-4 font-mono text-xs">{order.ebay_order_id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.state === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          order.state === 'submitted_to_zinc' ? 'bg-purple-100 text-purple-600' :
                          order.state === 'zinc_failed' ? 'bg-red-100 text-red-600' :
                          order.state === 'tracking_pending_manual_carrier' ? 'bg-blue-100 text-blue-600' :
                          order.state === 'awaiting_tba_conversion' ? 'bg-orange-100 text-orange-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {order.state === 'completed' ? 'Fulfilled' :
                           order.state === 'submitted_to_zinc' ? 'Processing' :
                           order.state === 'zinc_failed' ? 'Failed' :
                           order.state === 'tracking_pending_manual_carrier' ? 'Tracking' :
                           order.state === 'awaiting_tba_conversion' ? 'Pending' :
                           order.state}
                        </span>
                      </td>
                      <td className="py-3 px-4">{order.tracking_carrier || '—'}</td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {order.tracking_number ? (
                          trackingUrl ? (
                            <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {order.tracking_number}
                            </a>
                          ) : order.tracking_number
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">${(order.payout_estimate_cents / 100).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${(order.actual_amazon_total_cents / 100).toFixed(2)}</td>
                      <td className={`py-3 px-4 text-right font-medium ${order.actual_profit_cents > 0 ? 'text-green-600' : order.actual_profit_cents < 0 ? 'text-red-600' : ''}`}>
                        ${(order.actual_profit_cents / 100).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : orderDetail ? (
            <OrderDetailView detail={orderDetail} />
          ) : (
            <div className="py-8 text-center text-muted-foreground">No details available.</div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard requireSubscription>
      <OrdersContent />
    </AuthGuard>
  );
}
