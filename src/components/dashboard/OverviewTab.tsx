import { useState } from "react";
import { ShoppingCart, Package } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Progress } from "@/components/ui/progress";

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

interface ProfitChartPoint {
  date: string;
  profit: number;
}

interface OverviewTabProps {
  stats: Stats;
  orders: OverviewOrder[];
  profitChart?: ProfitChartPoint[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function buildChartData(orders: OverviewOrder[], profitChart?: ProfitChartPoint[]) {
  // Use profitChart from API if available
  if (profitChart && profitChart.length > 0) {
    return profitChart.map((p) => ({
      day: p.date,
      Revenue: 0,
      Profit: p.profit / 100,
    }));
  }
  // Fallback: distribute orders across days
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const perDay = Math.max(1, Math.ceil(orders.length / 7));
  return days.map((day, i) => {
    const dayOrders = orders.slice(i * perDay, (i + 1) * perDay);
    const revenue = dayOrders.reduce((s, o) => s + o.payout_estimate_cents, 0) / 100;
    const profit = dayOrders.reduce((s, o) => s + o.actual_profit_cents, 0) / 100;
    return { day, Revenue: revenue || 0, Profit: profit || 0 };
  });
}

export function OverviewTab({ stats, orders, profitChart }: OverviewTabProps) {
  const chartData = buildChartData(orders, profitChart);

  const avgOrderValue =
    stats.completed_orders > 0
      ? `$${(stats.total_profit / stats.completed_orders).toFixed(2)}`
      : "$0.00";

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary-bg p-6 pb-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute bottom-0 right-0 h-80 w-80" viewBox="0 0 400 400" fill="none">
            <circle cx="350" cy="350" r="200" fill="white" fillOpacity="0.1" />
            <circle cx="280" cy="280" r="150" fill="white" fillOpacity="0.08" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="mb-1 text-2xl font-bold">Welcome to your Airborne dashboard!</h1>
          <p className="mt-1 text-sm text-primary-foreground/70">
            Here's what's happening with your stores today.
          </p>
        </div>
      </div>

      {/* Main Grid: Chart + Side Cards */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Revenue & Profits Chart */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue & Profits</h2>
            <span className="rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              Last 4 weeks
            </span>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [currencyFormatter.format(value)]}
              />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="Profit"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorProfit)"
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side Cards */}
        <div className="space-y-4">
          {/* Active Listings Card */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active_listings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Active Listings</p>
                </div>
              </div>
            </div>
            <Progress value={stats.active_listings > 0 ? 75 : 0} className="mt-3 h-1.5" />
          </div>

          {/* Total Sold Card */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed_orders.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Sold</p>
                </div>
              </div>
            </div>
            <div className="mt-3 h-8">
              <svg viewBox="0 0 200 30" className="h-full w-full">
                <path
                  d="M0,25 Q20,22 40,20 T80,18 T120,15 T160,10 T200,5"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                <path
                  d="M0,25 Q20,22 40,20 T80,18 T120,15 T160,10 T200,5 L200,30 L0,30 Z"
                  fill="#22c55e"
                  fillOpacity="0.1"
                />
              </svg>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 font-semibold">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                <span className="text-sm font-medium">{avgOrderValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Profit</span>
                <span className="text-sm font-medium">
                  {currencyFormatter.format(stats.total_profit / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price Alerts</span>
                <span className="text-sm font-medium text-primary">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border bg-card">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Recent Orders</h3>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Earnings</th>
                  <th className="text-left p-4 font-medium">Cost</th>
                  <th className="text-left p-4 font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const statusColor =
                    order.state === "completed"
                      ? "bg-green-500/15 text-green-500"
                      : order.state === "submitted_to_zinc"
                        ? "bg-blue-500/15 text-blue-500"
                        : order.state === "zinc_failed"
                          ? "bg-red-500/15 text-red-500"
                          : "bg-yellow-500/15 text-yellow-500";
                  return (
                    <tr key={order.ebay_order_id} className="border-b last:border-0">
                      <td className="p-4 font-mono text-xs">{order.ebay_order_id}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {order.state}
                        </span>
                      </td>
                      <td className="p-4">{currencyFormatter.format(order.payout_estimate_cents / 100)}</td>
                      <td className="p-4">{currencyFormatter.format(order.actual_amazon_total_cents / 100)}</td>
                      <td className={`p-4 font-semibold ${order.actual_profit_cents > 0 ? 'text-green-500' : order.actual_profit_cents < 0 ? 'text-red-500' : ''}`}>
                        {currencyFormatter.format(order.actual_profit_cents / 100)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No orders yet. Connect a store to start tracking orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}