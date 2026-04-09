import { Package, ShoppingBag, ShoppingCart } from "lucide-react";
import { DashboardData } from "@/hooks/useDashboardData";

interface OverviewTabProps {
  dashboardData: DashboardData | null;
  loading: boolean;
}

export function OverviewTab({ dashboardData, loading }: OverviewTabProps) {
  const hasData = !!dashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden gradient-primary-bg p-6 pb-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute right-0 bottom-0 w-80 h-80" viewBox="0 0 400 400" fill="none">
            <circle cx="350" cy="350" r="200" fill="white" fillOpacity="0.1" />
            <circle cx="280" cy="280" r="150" fill="white" fillOpacity="0.08" />
            <circle cx="200" cy="200" r="100" fill="white" fillOpacity="0.05" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Welcome to your Airborne dashboard!</h1>
          <p className="text-sm text-primary-foreground/70 mt-1">
            {hasData ? "Here's your latest store data." : "Connect a store to get started."}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          {!hasData ? (
            <>
              <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No store connected</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Connect your eBay store to see revenue charts, order data, and listing analytics here.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Revenue chart coming soon.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">
                  {dashboardData?.activeListings ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Active Listings</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">
                  {dashboardData?.totalSold ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Sold</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                <span className="text-sm font-semibold">
                  {dashboardData?.avgOrderValue ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fulfillment Credits</span>
                <span className="text-sm font-semibold">
                  {dashboardData?.fulfillmentCredits ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price Alerts</span>
                <span className="text-sm font-semibold">
                  {dashboardData?.priceAlerts ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Recent Orders</h3>
        </div>
        {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Item</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="p-4 font-mono text-xs">{order.id}</td>
                    <td className="p-4">{order.title}</td>
                    <td className="p-4">${order.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-primary font-medium">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No orders yet. Orders will appear here once your store is connected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
