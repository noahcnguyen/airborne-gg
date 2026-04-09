import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LayoutDashboard, ShoppingCart, List, Store, Settings, LogOut, ChevronRight, Eye, EyeOff, Plus, X, Shield, Link2, CreditCard, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type Tab = 'overview' | 'orders' | 'autolister' | 'stores' | 'settings';

const navItems: { icon: typeof LayoutDashboard; label: string; tab: Tab }[] = [
  { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
  { icon: ShoppingCart, label: 'Orders', tab: 'orders' },
  { icon: List, label: 'Autolister', tab: 'autolister' },
  { icon: Store, label: 'My Stores', tab: 'stores' },
  { icon: Settings, label: 'Settings', tab: 'settings' },
];

interface AmazonAccount {
  id: string;
  email: string;
  hasTotp: boolean;
  cardLast4: string;
}

function AmazonAccountModal({ onSave, editAccount }: { onSave: (account: AmazonAccount) => void; editAccount?: AmazonAccount | null }) {
  const [email, setEmail] = useState(editAccount?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpKey, setTotpKey] = useState('');
  const [showTotp, setShowTotp] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('US');

  const formatCard = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 4);
    if (nums.length > 2) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums;
  };

  const handleSave = () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    onSave({
      id: editAccount?.id || crypto.randomUUID(),
      email,
      hasTotp: !!totpKey,
      cardLast4: cardNumber.replace(/\D/g, '').slice(-4) || '••••',
    });
    toast.success('Amazon account saved');
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="bg-accent/50 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">Your credentials are encrypted and stored securely. We never share your data.</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Amazon Login</h4>
        <div>
          <Label>Email</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="amazon@email.com" className="mt-1 rounded-md" />
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative mt-1">
            <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="rounded-md pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>TOTP Secret Key</Label>
          <p className="text-xs text-muted-foreground mb-1">This is the setup key from your authenticator app, not a one-time code.</p>
          <div className="relative">
            <Input type={showTotp ? 'text' : 'password'} value={totpKey} onChange={e => setTotpKey(e.target.value)} placeholder="JBSWY3DPEHPK3PXP" className="rounded-md pr-10" />
            <button type="button" onClick={() => setShowTotp(!showTotp)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showTotp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Payment Method</h4>
        <div>
          <Label>Cardholder Name</Label>
          <Input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John Doe" className="mt-1 rounded-md" />
        </div>
        <div>
          <Label>Card Number</Label>
          <Input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="4242 4242 4242 4242" className="mt-1 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Expiry</Label>
            <Input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>CVV</Label>
            <Input type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" className="mt-1 rounded-md" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Billing Address</h4>
        <div>
          <Label>Street</Label>
          <Input value={street} onChange={e => setStreet(e.target.value)} className="mt-1 rounded-md" />
        </div>
        <div>
          <Label>Apt / Suite</Label>
          <Input value={apt} onChange={e => setApt(e.target.value)} className="mt-1 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>City</Label>
            <Input value={city} onChange={e => setCity(e.target.value)} className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>State</Label>
            <Input value={state} onChange={e => setState(e.target.value)} className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>ZIP</Label>
            <Input value={zip} onChange={e => setZip(e.target.value)} className="mt-1 rounded-md" />
          </div>
        </div>
        <div>
          <Label>Country</Label>
          <Input value={country} onChange={e => setCountry(e.target.value)} className="mt-1 rounded-md" />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full gradient-primary-bg text-primary-foreground rounded-md">
        {editAccount ? 'Update Account' : 'Save Account'}
      </Button>
    </div>
  );
}

function SettingsContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.user_metadata?.full_name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '');
  const [accounts, setAccounts] = useState<AmazonAccount[]>([]);
  const [editAccount, setEditAccount] = useState<AmazonAccount | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [connectingDiscord, setConnectingDiscord] = useState(false);

  // Derive display name: prefer first name, then full_name, then email prefix
  const displayName = firstName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Get avatar URL from user metadata (works for Discord, Google, etc.)
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Check if Discord is already linked
  const discordIdentity = user?.identities?.find(i => i.provider === 'discord');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProfile = () => {
    toast.success('Profile saved successfully');
  };

  const handleConnectDiscord = async () => {
    setConnectingDiscord(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: window.location.origin + '/settings' },
      });
      if (error) toast.error(error.message);
    } catch {
      toast.error('Failed to connect Discord');
    } finally {
      setConnectingDiscord(false);
    }
  };

  const handleSaveAccount = (account: AmazonAccount) => {
    setAccounts(prev => {
      const idx = prev.findIndex(a => a.id === account.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = account; return next; }
      return [...prev, account];
    });
    setModalOpen(false);
    setEditAccount(null);
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    toast.success('Account removed');
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
            <Link key={item.tab} to={item.tab === 'settings' ? '/settings' : '/dashboard'}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.tab === 'settings' ? 'bg-accent text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}>
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
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
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">Advanced Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">← Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </div>
          <Button variant="ghost" size="sm" className="rounded-md gap-2 text-sm" onClick={handleSignOut}><LogOut className="h-4 w-4" /> Sign out</Button>
        </header>

        <main className="p-6 space-y-6">
          {/* Profile */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-5">Profile Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>First Name</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1.5 rounded-md" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1.5 rounded-md" />
              </div>
            </div>
            <div className="mb-5">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="mt-1.5 rounded-md bg-surface-1" />
              <p className="text-xs text-muted-foreground mt-1">Email is managed by your OAuth provider</p>
            </div>
            <Button onClick={handleSaveProfile} className="gradient-primary-bg text-primary-foreground rounded-md">Save Profile</Button>
          </div>

          {/* Connected Accounts */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-5">Connected Accounts</h2>
            <div className="space-y-3">
              {/* Discord */}
              <div className="flex items-center justify-between p-4 bg-surface-1 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5865F2' }}>
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Discord</p>
                    {discordIdentity ? (
                      <p className="text-xs text-success">Connected as {user?.user_metadata?.full_name || user?.user_metadata?.custom_claims?.global_name || 'Discord User'}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {discordIdentity ? (
                  <span className="flex items-center gap-1.5 text-xs text-success font-medium">
                    <span className="w-2 h-2 rounded-full bg-success" /> Connected
                  </span>
                ) : (
                  <Button variant="outline" size="sm" className="rounded-md gap-2" onClick={handleConnectDiscord} disabled={connectingDiscord}>
                    <Link2 className="h-3.5 w-3.5" /> Connect
                  </Button>
                )}
              </div>

              {/* Google */}
              {user?.identities?.find(i => i.provider === 'google') && (
                <div className="flex items-center justify-between p-4 bg-surface-1 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border">
                      <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Google</p>
                      <p className="text-xs text-success">Connected</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-success font-medium">
                    <span className="w-2 h-2 rounded-full bg-success" /> Connected
                  </span>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-5">Airborne Subscription</h2>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl gradient-primary-bg flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-base">Advanced Plan</p>
                    <p className="text-sm text-muted-foreground">$49.99/month</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success/15 text-success text-xs font-medium">Active</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-surface-1 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Current Period
                    </div>
                    <p className="text-sm font-medium">Apr 9 – May 9, 2026</p>
                  </div>
                  <div className="bg-surface-1 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Next Renewal
                    </div>
                    <p className="text-sm font-medium">May 9, 2026</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md gap-2"
                    onClick={() => toast.info('Stripe billing portal will be connected soon.')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Manage Billing
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-md gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => toast.info('Stripe cancellation flow will be connected soon.')}
                  >
                    Cancel Plan
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Billing is managed through Stripe. You'll be redirected to a secure portal to update payment methods or cancel.
                </p>
              </div>
            </div>

          {/* Amazon accounts */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">Amazon Profile(s)</h2>
              <Dialog open={modalOpen} onOpenChange={o => { setModalOpen(o); if (!o) setEditAccount(null); }}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary-bg text-primary-foreground rounded-md gap-2" onClick={() => { setEditAccount(null); setModalOpen(true); }}>
                    <Plus className="h-4 w-4" /> Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-xl">
                  <DialogHeader>
                    <DialogTitle>{editAccount ? 'Edit Amazon Account' : 'Add Amazon Account'}</DialogTitle>
                  </DialogHeader>
                  <AmazonAccountModal onSave={handleSaveAccount} editAccount={editAccount} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-accent/50 border border-primary/20 rounded-lg p-3 mb-5 flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">All credentials are encrypted at rest. We use bank-level encryption to protect your data.</p>
            </div>

            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No Amazon accounts added yet. Click "Add Account" to get started.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {accounts.map(a => {
                  const emailParts = a.email.split('@');
                  const masked = emailParts[0].slice(0, 2) + '•••@' + emailParts[1];
                  const acInitials = a.email.slice(0, 2).toUpperCase();
                  return (
                    <div key={a.id} className="group relative bg-surface-1 border rounded-lg px-4 py-3 cursor-pointer hover:border-primary/30 transition-colors"
                      onDoubleClick={() => { setEditAccount(a); setModalOpen(true); }}>
                      <button onClick={() => handleRemoveAccount(a.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">{acInitials}</div>
                        <div>
                          <p className="text-sm font-medium">{masked}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{a.hasTotp ? '🔐 TOTP' : '🔓 No TOTP'}</span>
                            <span>•••• {a.cardLast4}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
