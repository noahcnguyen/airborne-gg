import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session) navigate('/dashboard', { replace: true });
  }, [authLoading, session, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm.');
      navigate('/login');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google') => {
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
          <h2 className="text-4xl font-bold leading-tight">Start automating<br />your dropshipping.</h2>
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
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            <Plane className="h-6 w-6 text-primary" />Airborne
          </div>
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">Get started with Airborne today</p>

          <div className="space-y-3 mb-6">
            <Button variant="outline" className="w-full rounded-md h-11 gap-3" onClick={() => handleOAuth('google')}>
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">or continue with email</span></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 rounded-md h-11" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 rounded-md h-11" required />
            </div>
            <Button type="submit" className="w-full gradient-primary-bg text-primary-foreground rounded-md h-11 font-semibold" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
