import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useDashboardOrders } from "@/hooks/useDashboardOrders";

function OrdersContent() {
  const { orders } = useDashboardOrders();

  return (
    <DashboardLayout title="Orders">
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
                {orders.map((order: any) => (
                  <tr key={order.ebay_order_id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-xs">{order.ebay_order_id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.state === 'completed' ? 'bg-green-100 text-green-700' :
                        order.state === 'submitted_to_zinc' ? 'bg-blue-100 text-blue-700' :
                        order.state === 'zinc_failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.state}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.tracking_carrier || '—'}</td>
                    <td className="py-3 px-4 font-mono text-xs">{order.tracking_number || '—'}</td>
                    <td className="py-3 px-4 text-right">${(order.payout_estimate_cents / 100).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${(order.actual_amazon_total_cents / 100).toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right font-medium ${order.actual_profit_cents > 0 ? 'text-green-600' : order.actual_profit_cents < 0 ? 'text-red-600' : ''}`}>
                      ${(order.actual_profit_cents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}
