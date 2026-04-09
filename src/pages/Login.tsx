import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session) navigate('/dashboard', { replace: true });
  }, [authLoading, session, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'discord') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary-bg flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl mb-2">
            <Plane className="h-7 w-7" />Airborne
          </div>
          <p className="text-primary-foreground/70 text-sm">Amazon → eBay Automation</p>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold leading-tight">Your store runs<br />while you sleep.</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: '20K+', label: 'Listings managed' },
              { val: '24/7', label: 'Monitoring' },
              { val: '$1', label: 'Per order' },
            ].map(s => (
              <div key={s.label} className="bg-primary-foreground/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{s.val}</div>
                <div className="text-xs text-primary-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-primary-foreground/40">© 2026 Airborne.gg</div>
        {/* decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            <Plane className="h-6 w-6 text-primary" />Airborne
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <div className="space-y-3 mb-6">
            <Button variant="outline" className="w-full rounded-md h-11 gap-3" onClick={() => handleOAuth('google')}>
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full rounded-md h-11 gap-3" onClick={() => handleOAuth('discord')}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Continue with Discord
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">or continue with email</span></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 rounded-md h-11" required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 rounded-md h-11" required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-input" />
              <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal">Remember me</Label>
            </div>
            <Button type="submit" className="w-full gradient-primary-bg text-primary-foreground rounded-md h-11 font-semibold" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in to Airborne'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account? <button className="text-primary hover:underline font-medium">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}
