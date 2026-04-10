import { DollarSign, Clock, Package, Receipt, ShoppingCart, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Stats {
  total_profit: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  active_listings: number;
}

interface OverviewOrder {
  ebay_order_id: string;
  state: string;
  payout_estimate_cents: number;
  actual_amazon_total_cents: number;
  actual_profit_cents: number;
}

interface OverviewTabProps {
  stats: Stats;
  orders: OverviewOrder[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const profitabilityChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  cost: {
    label: "Cost",
    color: "hsl(var(--warning))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--success))",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--warning))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

const formatCurrencyFromCents = (value: number) => currencyFormatter.format(value / 100);

export function OverviewTab({ stats, orders }: OverviewTabProps) {
  const totalRevenueCents = orders.reduce((sum, order) => sum + order.payout_estimate_cents, 0);
  const totalCostCents = orders.reduce((sum, order) => sum + order.actual_amazon_total_cents, 0);
  const uncategorizedOrders = Math.max(
    stats.total_orders - stats.completed_orders - stats.pending_orders,
    0,
  );
  const averageProfitPerOrderCents = stats.total_orders > 0 ? stats.total_profit / stats.total_orders : 0;

  const profitabilityData = [
    {
      key: "revenue",
      label: "Revenue",
      value: Number((totalRevenueCents / 100).toFixed(2)),
    },
    {
      key: "cost",
      label: "Cost",
      value: Number((totalCostCents / 100).toFixed(2)),
    },
    {
      key: "profit",
      label: "Profit",
      value: Number((stats.total_profit / 100).toFixed(2)),
    },
  ];

  const statusData = [
    {
      key: "completed",
      label: "Completed",
      value: stats.completed_orders,
    },
    {
      key: "pending",
      label: "Pending",
      value: stats.pending_orders,
    },
    {
      key: "other",
      label: "Other",
      value: uncategorizedOrders,
    },
  ];

  const summaryItems = [
    {
      icon: ShoppingCart,
      label: "Completed orders",
      value: `${stats.completed_orders}/${stats.total_orders}`,
      helper: "Orders finished successfully",
    },
    {
      icon: TrendingUp,
      label: "Avg profit / order",
      value: formatCurrencyFromCents(averageProfitPerOrderCents),
      helper: "Based on current dashboard profit",
    },
    {
      icon: Package,
      label: "Active listings",
      value: compactNumberFormatter.format(stats.active_listings),
      helper: "Live inventory across connected stores",
    },
    {
      icon: Clock,
      label: "Pending orders",
      value: compactNumberFormatter.format(stats.pending_orders),
      helper: "Still waiting to be fulfilled",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl gradient-primary-bg p-6 pb-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute bottom-0 right-0 h-80 w-80" viewBox="0 0 400 400" fill="none">
            <circle cx="350" cy="350" r="200" fill="white" fillOpacity="0.1" />
            <circle cx="280" cy="280" r="150" fill="white" fillOpacity="0.08" />
            <circle cx="200" cy="200" r="100" fill="white" fillOpacity="0.05" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="mb-1 text-2xl font-bold">Welcome to your Airborne dashboard!</h1>
          <p className="mt-1 text-sm text-primary-foreground/70">Here's your latest store data.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{formatCurrencyFromCents(stats.total_profit)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Total Profit</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{stats.total_orders}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{stats.pending_orders}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Pending Orders</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{stats.active_listings}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Active Listings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Revenue snapshot</h2>
              <p className="text-sm text-muted-foreground">Real totals derived from your fetched orders.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
          </div>

          <ChartContainer config={profitabilityChartConfig} className="h-[280px] w-full aspect-auto">
            <BarChart data={profitabilityData} margin={{ top: 12, right: 12, left: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${compactNumberFormatter.format(Number(value))}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => [currencyFormatter.format(Number(value)), item.payload.label]}
                  />
                }
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {profitabilityData.map((entry) => (
                  <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Order status breakdown</h2>
              <p className="text-sm text-muted-foreground">Completed, pending, and uncategorized orders.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </div>

          <ChartContainer config={statusChartConfig} className="h-[280px] w-full aspect-auto">
            <BarChart data={statusData} margin={{ top: 12, right: 12, left: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => [`${value}`, item.payload.label]}
                  />
                }
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <h2 className="font-semibold">Performance summary</h2>
            <p className="text-sm text-muted-foreground">Quick readouts from your live dashboard totals.</p>
          </div>

          <div className="space-y-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg bg-surface-1/70 p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <h2 className="font-semibold">Recent order profits</h2>
            <p className="text-sm text-muted-foreground">Latest fetched orders from your connected store.</p>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.ebay_order_id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-surface-1/70 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-foreground">{order.ebay_order_id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{order.state || "Unknown state"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrencyFromCents(order.actual_profit_cents)}</p>
                    <p className="text-xs text-muted-foreground">profit</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center rounded-lg bg-surface-1/70 text-sm text-muted-foreground">
              No order data yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
