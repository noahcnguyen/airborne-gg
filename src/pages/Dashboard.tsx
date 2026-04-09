import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LayoutDashboard, ShoppingCart, List, Store, Settings, Bell, RefreshCw, LogOut, Search, ChevronDown, ChevronLeft, ChevronRight, Plus, Lock, Unlink, ToggleLeft, ToggleRight, TrendingUp, TrendingDown, DollarSign, Package, Users, CreditCard, BarChart3, ShoppingBag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'overview' | 'orders' | 'autolister' | 'stores' | 'settings';

const navItems: { icon: typeof LayoutDashboard; label: string; tab: Tab }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', tab: 'overview' },
  { icon: ShoppingCart, label: 'Orders', tab: 'orders' },
  { icon: List, label: 'Autolister', tab: 'autolister' },
  { icon: Store, label: 'My Stores', tab: 'stores' },
  { icon: Settings, label: 'Settings', tab: 'settings' },
];

// Store data
interface StoreData {
  id: string;
  name: string;
  initials: string;
  orders: typeof mockOrdersDefault;
  revenueChart: { name: string; profit: number; revenue: number }[];
  activeListings: { name: string; value: number }[];
  totalSold: { name: string; value: number }[];
  listingsCount: number;
  soldCount: number;
}

const mockOrdersDefault: { id: string; asin: string; buyer: string; status: string; profit: string; time: string }[] = [];

const emptyChartData = [
  { name: 'Mon', profit: 0, revenue: 0 }, { name: 'Tue', profit: 0, revenue: 0 },
  { name: 'Wed', profit: 0, revenue: 0 }, { name: 'Thu', profit: 0, revenue: 0 },
  { name: 'Fri', profit: 0, revenue: 0 }, { name: 'Sat', profit: 0, revenue: 0 },
  { name: 'Sun', profit: 0, revenue: 0 },
];

const emptySparkline = [
  { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 },
];

const mockStores: StoreData[] = [];

const mockListings: { title: string; asin: string; ebayPrice: number; amazonCost: number; margin: number; sales30d: number; active: boolean }[] = [];

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Fulfilled: 'bg-emerald-100 text-emerald-700',
    Tracking: 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
    Processing: 'bg-violet-100 text-violet-700',
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>;
}

function OverviewTab({ store }: { store: StoreData }) {
  const [chartPeriod, setChartPeriod] = useState('Last 4 weeks');
  const periods = ['Last 7 days', 'Last 4 weeks', 'Last 90 days'];

  const baseChart = store.revenueChart;
  const chartDataSets: Record<string, { name: string; profit: number; revenue: number }[]> = {
    'Last 4 weeks': baseChart,
    'Last 7 days': baseChart.map(d => ({ ...d, profit: Math.round(d.profit * 0.3), revenue: Math.round(d.revenue * 0.3) })),
    'Last 90 days': baseChart.map((d, i) => ({ ...d, name: `W${i + 1}`, profit: d.profit * 4, revenue: d.revenue * 4 })),
  };
  const chartData = chartDataSets[chartPeriod] || chartDataSets['Last 4 weeks'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden gradient-primary-bg p-6 pb-8 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute right-0 bottom-0 w-80 h-80" viewBox="0 0 400 400" fill="none">
            <circle cx="350" cy="350" r="200" fill="white" fillOpacity="0.1"/>
            <circle cx="280" cy="280" r="150" fill="white" fillOpacity="0.08"/>
            <circle cx="200" cy="200" r="100" fill="white" fillOpacity="0.05"/>
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Welcome to your Airborne dashboard!</h1>
          <p className="text-sm text-primary-foreground/70 mt-1">Here's what's happening with your stores today.</p>
        </div>
      </div>

      {/* Chart + Side Panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Revenue & Profits</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2 h-9 px-4">
                  {chartPeriod} <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1" align="end">
                {periods.map(p => (
                  <button key={p} onClick={() => setChartPeriod(p)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-surface-1 ${chartPeriod === p ? 'bg-surface-1 font-medium' : ''}`}>
                    {p}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis width={35} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Profit']}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--success))' }} />
              <span className="text-muted-foreground">Profit</span>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {/* Active Listings */}
          <div className="bg-card rounded-xl border p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{store.listingsCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Active Listings</p>
                </div>
              </div>
              <span className="flex items-center text-xs font-semibold text-success gap-0.5"><TrendingUp className="h-3 w-3" /> 13.35</span>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={store.activeListings}>
                  <defs>
                    <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorListings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Sold */}
          <div className="bg-card rounded-xl border p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{store.soldCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Sold</p>
                </div>
              </div>
              <span className="flex items-center text-xs font-semibold text-success gap-0.5"><TrendingUp className="h-3 w-3" /> 50.8%</span>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={store.totalSold}>
                  <defs>
                    <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorSold)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-xl border p-5">
            <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                <span className="text-sm font-semibold">$14.28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fulfillment Credits</span>
                <span className="text-sm font-semibold">$142.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price Alerts</span>
                <span className="text-sm font-semibold" style={{ color: 'hsl(var(--warning))' }}>3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left p-3 font-medium">Order ID</th>
              <th className="text-left p-3 font-medium">ASIN</th>
              <th className="text-left p-3 font-medium">Buyer</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Profit</th>
              <th className="text-left p-3 font-medium">Time</th>
            </tr></thead>
            <tbody>
              {store.orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet. Orders will appear here once your store starts selling.</td></tr>
              ) : store.orders.map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-surface-1 transition-colors">
                  <td className="p-3 font-mono text-xs">{o.id}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{o.asin}</td>
                  <td className="p-3">{o.buyer}</td>
                  <td className="p-3"><StatusPill status={o.status} /></td>
                  <td className="p-3 font-semibold text-success">{o.profit}</td>
                  <td className="p-3 text-muted-foreground">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ store }: { store: StoreData }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const statuses = ['All', 'Fulfilled', 'Tracking', 'Pending', 'Processing'];
  const filtered = store.orders.filter(o =>
    (statusFilter === 'All' || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.buyer.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-card rounded-xl border">
      <div className="p-5 border-b flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-md" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-md gap-2">{statusFilter} <ChevronDown className="h-4 w-4" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="end">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-surface-1">{s}</button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-muted-foreground">
            <th className="text-left p-3 font-medium">Order ID</th>
            <th className="text-left p-3 font-medium">ASIN</th>
            <th className="text-left p-3 font-medium">Buyer</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Profit</th>
            <th className="text-left p-3 font-medium">Time</th>
          </tr></thead>
           <tbody>
             {filtered.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders found. Orders will appear here once your store starts selling.</td></tr>
             ) : filtered.map(o => (
               <tr key={o.id} className="border-b last:border-0 hover:bg-surface-1 transition-colors">
                 <td className="p-3 font-mono text-xs">{o.id}</td>
                 <td className="p-3 font-mono text-xs text-muted-foreground">{o.asin}</td>
                 <td className="p-3">{o.buyer}</td>
                 <td className="p-3"><StatusPill status={o.status} /></td>
                 <td className="p-3 font-semibold text-success">{o.profit}</td>
                 <td className="p-3 text-muted-foreground">{o.time}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
      <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {store.orders.length} orders</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

// Per-store eBay subscription & limits data
const storeSubscriptionData: Record<string, { plan: string; freeListings: number; listingsUsed: number; listingsTotal: number; itemsUsed: number; itemsTotal: number; amountUsed: number; amountTotal: number }> = {};

function AutolisterTab({ store }: { store: StoreData }) {
  const [listingTab, setListingTab] = useState<'products' | 'leads' | 'autopilot'>('products');
  
  const [asinInput, setAsinInput] = useState('');

  const sub = storeSubscriptionData[store.id] || null;
  const listingsRemaining = sub ? sub.listingsTotal - sub.listingsUsed : 0;

  const [leadsCount, setLeadsCount] = useState('');
  const [autopilotCounts, setAutopilotCounts] = useState<Record<string, string>>({ 'store-1': '300', 'store-2': '150' });
  const autopilotCount = autopilotCounts[store.id] || '0';
  const setAutopilotCount = (val: string) => setAutopilotCounts(prev => ({ ...prev, [store.id]: val }));

  const listingTabs = [
    { id: 'products' as const, label: 'List My Products' },
    { id: 'leads' as const, label: "Airborne's Pool" },
    { id: 'autopilot' as const, label: 'Autopilot' },
  ];

  return (
    <div className="space-y-6">
      {/* Listing Manager */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Manage Listings</h3>
        </div>
        <div className="p-5 space-y-5">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            {listingTabs.map(tab => (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => setListingTab(tab.id)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    listingTab === tab.id
                      ? 'gradient-primary-bg text-primary-foreground font-medium'
                      : 'bg-surface-1 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </React.Fragment>
            ))}
          </div>

          {/* Tab Content */}
          {listingTab === 'products' && (
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
                onChange={e => setAsinInput(e.target.value)}
                className="rounded-lg h-11"
              />
              {sub ? (
                <p className="text-sm text-muted-foreground">
                  You have <span className="font-medium text-foreground">{listingsRemaining.toLocaleString()}</span> listings left! ({sub.listingsUsed.toLocaleString()} used of {sub.listingsTotal.toLocaleString()})
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Connect a store to see your listing limits.</p>
              )}
              <Button className="gradient-primary-bg text-primary-foreground rounded-lg gap-2">
                List ASIN(s)
              </Button>
            </div>
          )}

          {listingTab === 'leads' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">List up to 25 items at a time (numbers only)</p>
              <Input
                type="number"
                placeholder="Enter a number (max 25)"
                value={leadsCount}
                onChange={e => setLeadsCount(e.target.value)}
                className="rounded-lg h-11"
              />
              {sub ? (
                <p className="text-sm text-muted-foreground">
                  You have <span className="font-medium text-foreground">{listingsRemaining.toLocaleString()}</span> listings left! ({sub.listingsUsed.toLocaleString()} used of {sub.listingsTotal.toLocaleString()})
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Connect a store to see your listing limits.</p>
              )}
              <Button className="gradient-primary-bg text-primary-foreground rounded-lg gap-2">
                List
              </Button>
            </div>
          )}

          {listingTab === 'autopilot' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Choose how many listings you want automatically listed to your store daily</p>
              <Input
                type="number"
                placeholder="300"
                value={autopilotCount}
                onChange={e => setAutopilotCount(e.target.value)}
                className="rounded-lg h-11"
              />
              <Button className="gradient-primary-bg text-primary-foreground rounded-lg gap-2">
                Save preference
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* eBay Store Subscription */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">eBay Store Subscription</h3>
            {sub ? (
              <>
                <span className="text-muted-foreground">—</span>
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{sub.plan}</span>
                <span className="text-sm text-muted-foreground">{sub.freeListings.toLocaleString()} free listings/mo</span>
              </>
            ) : null}
          </div>

          {sub ? (
            <>
              <div>
                <h4 className="font-semibold text-sm">Monthly Selling Limits</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You've used {sub.itemsUsed.toLocaleString()} of {sub.itemsTotal.toLocaleString()} items and ${sub.amountUsed.toLocaleString()} of ${sub.amountTotal.toLocaleString()} USD this month.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: 'hsl(var(--success))' }}>Items</span>
                  <span className="text-muted-foreground">{sub.itemsUsed.toLocaleString()} / {sub.itemsTotal.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-surface-1 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(sub.itemsUsed / sub.itemsTotal) * 100}%`, backgroundColor: 'hsl(var(--success))' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: 'hsl(var(--success))' }}>Amount</span>
                  <span className="text-muted-foreground">${sub.amountUsed.toLocaleString()} / ${sub.amountTotal.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-surface-1 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(sub.amountUsed / sub.amountTotal) * 100}%`, backgroundColor: 'hsl(var(--success))' }} />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">Connect an eBay store to see your subscription details and selling limits.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StoresTab() {
  return (
    <div className="space-y-6">
      <div className="bg-accent/50 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm"><span className="font-medium">Advanced Plan:</span> 2 stores allowed. 0 connected, 2 slots available.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-1 rounded-xl border border-dashed p-5 flex items-center justify-center gap-3 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Available store slot</span>
        </div>
        <div className="bg-surface-1 rounded-xl border border-dashed p-5 flex items-center justify-center gap-3 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Available store slot</span>
        </div>
      </div>

      <Button className="gradient-primary-bg text-primary-foreground rounded-md gap-2"><Plus className="h-4 w-4" /> Connect Store</Button>
    </div>
  );
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeStoreId, setActiveStoreId] = useState(mockStores[0]?.id || '');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const defaultStore: StoreData = { id: '', name: 'No Store', initials: '--', orders: [], revenueChart: emptyChartData, activeListings: emptySparkline, totalSold: emptySparkline, listingsCount: 0, soldCount: 0 };
  const activeStore = mockStores.find(s => s.id === activeStoreId) || mockStores[0] || defaultStore;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (activeTab === 'settings') {
    navigate('/settings');
    return null;
  }

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = userName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const tabTitles: Record<Tab, string> = {
    overview: 'Overview', orders: 'Orders', autolister: 'Autolister', stores: 'My Stores', settings: 'Settings',
  };

  return (
    <div className="min-h-screen flex bg-surface-1">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col z-40">
        <div className="p-5 flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Airborne</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.tab ? 'bg-accent text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}>
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-lg gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">{initials}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Advanced Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{tabTitles[activeTab]}</h1>
          <div className="flex items-center gap-3">
            {mockStores.length > 1 ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 bg-surface-1 rounded-full px-3 py-1.5 text-xs hover:bg-surface-2 transition-colors cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse_dot" />
                    {activeStore.name}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-1" align="end">
                  {mockStores.map(s => (
                    <button key={s.id} onClick={() => setActiveStoreId(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded hover:bg-surface-1 transition-colors ${activeStoreId === s.id ? 'bg-surface-1 font-medium' : ''}`}>
                      <div className="w-7 h-7 rounded-md gradient-primary-bg flex items-center justify-center text-primary-foreground text-[10px] font-bold">{s.initials}</div>
                      <div className="text-left">
                        <p className="text-sm">{s.name}</p>
                      </div>
                      {activeStoreId === s.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            ) : mockStores.length === 1 ? (
              <div className="flex items-center gap-1.5 bg-surface-1 rounded-full px-3 py-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse_dot" />
                {activeStore.name}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-surface-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <Store className="h-3 w-3" />
                No store connected
              </div>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md"><Bell className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md"><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'overview' && <OverviewTab store={activeStore} />}
          {activeTab === 'orders' && <OrdersTab store={activeStore} />}
          {activeTab === 'autolister' && <AutolisterTab store={activeStore} />}
          {activeTab === 'stores' && <StoresTab />}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
