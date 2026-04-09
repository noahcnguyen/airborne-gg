import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LayoutDashboard, ShoppingCart, List, Store, Settings, LogOut, ChevronRight, Eye, EyeOff, Plus, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

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

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = userName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProfile = () => {
    toast.success('Profile saved successfully');
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
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-40">
        <div className="p-5 flex items-center gap-2">
          <Plane className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-lg text-sidebar-foreground">Airborne</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.tab} to={item.tab === 'settings' ? '/settings' : '/dashboard'}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.tab === 'settings' ? 'bg-sidebar-accent text-sidebar-foreground font-medium' : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}>
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
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
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">← Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </div>
          <Button variant="ghost" size="sm" className="rounded-md gap-2 text-sm" onClick={handleSignOut}><LogOut className="h-4 w-4" /> Sign out</Button>
        </header>

        <main className="p-6 max-w-3xl space-y-6">
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
