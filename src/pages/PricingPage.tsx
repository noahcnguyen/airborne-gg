import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const plans = [
  { name: 'Starter', key: 'starter', price: 49, subtitle: '1,000 listings · 1 Store', popular: false, multiStore: false },
  { name: 'Growth', key: 'growth', price: 79, subtitle: '2,500 listings · 1 Store', popular: false, multiStore: false },
  { name: 'Advanced', key: 'advanced', price: 129, subtitle: '10,000 listings per store · 2 Stores · 20,000 total listings', popular: true, multiStore: true },
  { name: 'Pro', key: 'pro', price: 219, subtitle: '25,000 listings per store · 3 Stores · 75,000 total listings', popular: false, multiStore: true },
];

const planFeatures = ['Automated Listing Importer', 'Smart Order Fulfillment', 'Real-Time Tracking Sync', 'Price & Profit Monitoring', '24/7 Monitoring'];

function PricingContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        "https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/create-checkout",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcG50eHlmdG9sa2NyYnVtZ2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTgyNzIsImV4cCI6MjA5MTI3NDI3Mn0.XlJ6hNFR-2ZJFHUZu2vS2uxwsv_z8mMH_1FQuJS2n90",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan: planKey }),
        }
      );
      const { url } = await response.json();
      if (url) window.location.href = url;
      else toast.error('Failed to create checkout session');
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-1">
      <header className="bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Plane className="h-6 w-6 text-primary" />
            <span>Airborne</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 rounded-md">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground">All plans include full automation. Scale when you're ready.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {plans.map((p) => (
            <div key={p.name}
              className={`relative bg-card rounded-xl border p-7 ${p.popular ? 'border-primary shadow-lg shadow-primary/15 ring-1 ring-primary/20' : ''}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary-bg text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>}
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{p.subtitle}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">${p.price}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {planFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success flex-shrink-0" />{f}</li>
                ))}
                <li className="flex items-center gap-2 text-sm">
                  <Check className={`h-4 w-4 flex-shrink-0 ${p.multiStore ? 'text-success' : 'text-muted-foreground/30'}`} />
                  <span className={p.multiStore ? '' : 'text-muted-foreground/50'}>Multi-Store Management</span>
                </li>
              </ul>
              <Button
                className={`w-full rounded-md ${p.popular ? 'gradient-primary-bg text-primary-foreground' : ''}`}
                variant={p.popular ? 'default' : 'outline'}
                disabled={loadingPlan === p.key}
                onClick={() => handleCheckout(p.key)}
              >
                {loadingPlan === p.key ? 'Redirecting...' : 'Start for $1'}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">$1 per order fulfilled. Extra stores $49/mo.</p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <AuthGuard>
      <PricingContent />
    </AuthGuard>
  );
}
