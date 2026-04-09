import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LayoutDashboard, ShoppingCart, List, Store, Settings, Bell, RefreshCw, LogOut, Search, ChevronDown, ChevronLeft, ChevronRight, Plus, Lock, Unlink, ToggleLeft, ToggleRight, TrendingUp, TrendingDown, DollarSign, Package, Users, CreditCard, BarChart3, ShoppingBag } from 'lucide-react';
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

// Mock data
const mockOrders = [
  { id: '#AB-7291', asin: 'B09V3KXJPB', buyer: 'Sarah Mitchell', status: 'Fulfilled', profit: '$12.40', time: '2 min ago' },
  { id: '#AB-7290', asin: 'B08N5WRWNW', buyer: 'James Kim', status: 'Tracking', profit: '$8.90', time: '15 min ago' },
  { id: '#AB-7289', asin: 'B07ZPKN6YR', buyer: 'Lisa Rodriguez', status: 'Pending', profit: '$15.20', time: '32 min ago' },
  { id: '#AB-7288', asin: 'B09B8DQ26F', buyer: 'Mike Davis', status: 'Processing', profit: '$6.70', time: '1h ago' },
  { id: '#AB-7287', asin: 'B0BSHF7WHW', buyer: 'Emma Wilson', status: 'Fulfilled', profit: '$22.10', time: '2h ago' },
  { id: '#AB-7286', asin: 'B0BN1HP798', buyer: 'Chris Lee', status: 'Fulfilled', profit: '$9.30', time: '3h ago' },
];

const revenueChartData = [
  { name: 'Mon', profit: 3200, revenue: 4800 },
  { name: 'Tue', profit: 4100, revenue: 6200 },
  { name: 'Wed', profit: 3800, revenue: 5400 },
  { name: 'Thu', profit: 5200, revenue: 7800 },
  { name: 'Fri', profit: 4600, revenue: 6900 },
  { name: 'Sat', profit: 6100, revenue: 8200 },
  { name: 'Sun', profit: 5400, revenue: 7100 },
];

const chartDataSets: Record<string, { name: string; profit: number; revenue: number }[]> = {
  'Last 4 weeks': revenueChartData,
  'Last 7 days': revenueChartData.map(d => ({ ...d, profit: d.profit * 0.3, revenue: d.revenue * 0.3 })),
  'Last 90 days': revenueChartData.map(d => ({ ...d, name: `W${revenueChartData.indexOf(d) + 1}`, profit: d.profit * 4, revenue: d.revenue * 4 })),
};

const activeListingsData = [
  { name: 'Mon', value: 820 }, { name: 'Tue', value: 835 }, { name: 'Wed', value: 842 },
  { name: 'Thu', value: 838 }, { name: 'Fri', value: 847 }, { name: 'Sat', value: 855 }, { name: 'Sun', value: 861 },
];

const totalSoldData = [
  { name: 'Mon', value: 12 }, { name: 'Tue', value: 18 }, { name: 'Wed', value: 15 },
  { name: 'Thu', value: 22 }, { name: 'Fri', value: 19 }, { name: 'Sat', value: 28 }, { name: 'Sun', value: 24 },
];

const mockListings = [
  { title: 'Wireless Bluetooth Earbuds', asin: 'B09V3KXJPB', ebayPrice: 34.99, amazonCost: 22.50, margin: 35.7, sales30d: 48, active: true },
  { title: 'USB-C Hub Adapter 7-in-1', asin: 'B08N5WRWNW', ebayPrice: 29.99, amazonCost: 18.20, margin: 39.3, sales30d: 32, active: true },
  { title: 'LED Desk Lamp Dimmable', asin: 'B07ZPKN6YR', ebayPrice: 42.99, amazonCost: 28.80, margin: 33.0, sales30d: 21, active: false },
  { title: 'Portable Phone Charger 10000mAh', asin: 'B09B8DQ26F', ebayPrice: 24.99, amazonCost: 14.30, margin: 42.8, sales30d: 67, active: true },
];

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Fulfilled: 'bg-emerald-100 text-emerald-700',
    Tracking: 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
    Processing: 'bg-violet-100 text-violet-700',
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>;
}

function OverviewTab() {
  const [chartPeriod, setChartPeriod] = useState('Last 4 weeks');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const periods = ['Last 7 days', 'Last 4 weeks', 'Last 90 days'];
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

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
        <div className="lg:col-span-2 bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
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
          <div className="h-72">
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
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Profit']}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" style={{ backgroundColor: 'hsl(var(--success))' }} />
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
                  <p className="text-2xl font-bold leading-none">6,532</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Active Listings</p>
                </div>
              </div>
              <span className="flex items-center text-xs font-semibold text-success gap-0.5"><TrendingUp className="h-3 w-3" /> 13.35</span>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeListingsData}>
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
                  <p className="text-2xl font-bold leading-none">961</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Sold</p>
                </div>
              </div>
              <span className="flex items-center text-xs font-semibold text-success gap-0.5"><TrendingUp className="h-3 w-3" /> 50.8%</span>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={totalSoldData}>
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
              {mockOrders.map(o => (
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

function OrdersTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const statuses = ['All', 'Fulfilled', 'Tracking', 'Pending', 'Processing'];
  const filtered = mockOrders.filter(o =>
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
            {filtered.map(o => (
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
        <span>Showing {filtered.length} of {mockOrders.length} orders</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

function AutolisterTab() {
  const [subTab, setSubTab] = useState<'Active' | 'Paused' | 'Ended'>('Active');
  const [search, setSearch] = useState('');
  const listings = mockListings.filter(l => {
    if (subTab === 'Active') return l.active;
    if (subTab === 'Paused') return !l.active;
    return false;
  }).filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.asin.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-surface-1 rounded-lg p-1">
          {(['Active', 'Paused', 'Ended'] as const).map(t => (
            <button key={t} onClick={() => setSubTab(t)}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${subTab === t ? 'bg-card shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {t}
            </button>
          ))}
        </div>
        <Button className="gradient-primary-bg text-primary-foreground rounded-md gap-2"><Plus className="h-4 w-4" /> Import from ASIN Pool</Button>
      </div>

      <div className="bg-card rounded-xl border">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-md" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">eBay Price</th>
              <th className="text-left p-3 font-medium">Amazon Cost</th>
              <th className="text-left p-3 font-medium">Margin</th>
              <th className="text-left p-3 font-medium">30d Sales</th>
              <th className="text-left p-3 font-medium">Active</th>
            </tr></thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.asin} className="border-b last:border-0 hover:bg-surface-1 transition-colors">
                  <td className="p-3">
                    <p className="font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{l.asin}</p>
                  </td>
                  <td className="p-3">${l.ebayPrice.toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground">${l.amazonCost.toFixed(2)}</td>
                  <td className="p-3 font-medium text-success">{l.margin.toFixed(1)}%</td>
                  <td className="p-3">{l.sales30d}</td>
                  <td className="p-3">
                    {l.active ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>{listings.length} listings</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoresTab() {
  const connectedStore = {
    name: 'TechDeals247',
    sellerId: 'techdeals247',
    connected: 'Jan 15, 2026',
    listings: 847,
    orders: 1243,
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent/50 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm"><span className="font-medium">Advanced Plan:</span> 2 stores allowed. 1 connected, 1 slot available.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary-bg flex items-center justify-center text-primary-foreground font-bold text-sm">TD</div>
              <div>
                <p className="font-semibold">{connectedStore.name}</p>
                <p className="text-xs text-muted-foreground">@{connectedStore.sellerId}</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-success font-medium"><span className="w-2 h-2 rounded-full bg-success animate-pulse_dot" /> Connected</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><p className="text-xs text-muted-foreground">Connected</p><p className="text-sm font-medium">{connectedStore.connected}</p></div>
            <div><p className="text-xs text-muted-foreground">Listings</p><p className="text-sm font-medium">{connectedStore.listings}</p></div>
            <div><p className="text-xs text-muted-foreground">Orders</p><p className="text-sm font-medium">{connectedStore.orders}</p></div>
          </div>
          <Button variant="outline" size="sm" className="rounded-md gap-2 text-destructive hover:text-destructive"><Unlink className="h-3.5 w-3.5" /> Disconnect</Button>
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (activeTab === 'settings') {
    navigate('/settings');
    return null;
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = userName.slice(0, 2).toUpperCase();

  const tabTitles: Record<Tab, string> = {
    overview: 'Overview', orders: 'Orders', autolister: 'Autolister', stores: 'My Stores', settings: 'Settings',
  };

  return (
    <div className="min-h-screen flex bg-surface-1">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-40">
        <div className="p-5 flex items-center gap-2">
          <Plane className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-lg text-sidebar-foreground">Airborne</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.tab ? 'bg-sidebar-accent text-sidebar-foreground font-medium' : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}>
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-xs text-sidebar-muted">Advanced Plan</p>
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
            <div className="flex items-center gap-1.5 bg-surface-1 rounded-full px-3 py-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse_dot" />
              TechDeals247
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md"><Bell className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md"><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'autolister' && <AutolisterTab />}
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
