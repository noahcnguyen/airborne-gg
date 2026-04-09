import { Package, ShoppingBag, ShoppingCart, DollarSign, Clock } from "lucide-react";

interface Stats {
  total_profit: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  active_listings: number;
}

interface OverviewTabProps {
  stats: Stats;
}

export function OverviewTab({ stats }: OverviewTabProps) {
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
            Here's your latest store data.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                ${(stats.total_profit / 100).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Profit</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {stats.total_orders}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {stats.pending_orders}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {stats.active_listings}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Listings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
