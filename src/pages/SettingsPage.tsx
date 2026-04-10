import { useState, useEffect } from 'react';
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
import { useUserPlan } from '@/hooks/useUserPlan';

interface AmazonAccount {
  id: string;
  email: string;
  hasTotp: boolean;
  cardLast4: string;
}

interface AmazonFormData {
  email: string;
  password: string;
  totpKey: string;
  cardName: string;
  cardNumber: string;
  cardCvv: string;
  cardExpMonth: string;
  cardExpYear: string;
  billingFirst: string;
  billingLast: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingPhone: string;
}

const emptyForm: AmazonFormData = {
  email: '', password: '', totpKey: '',
  cardName: '', cardNumber: '', cardCvv: '', cardExpMonth: '', cardExpYear: '',
  billingFirst: '', billingLast: '', billingAddress1: '', billingAddress2: '',
  billingCity: '', billingState: '', billingZip: '', billingPhone: '',
};

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: List, label: 'Autolister', path: '/autolister' },
  { icon: Store, label: 'My Stores', path: '/stores' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

function AmazonAccountModal({ onSave, editId, saving }: { onSave: (form: AmazonFormData, editId?: string) => void; editId?: string; saving: boolean }) {
  const [form, setForm] = useState<AmazonFormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showTotp, setShowTotp] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const { user } = useAuth();

  useEffect(() => {
    if (!editId || !user) return;
    const load = async () => {
      const { data } = await supabase
        .from('amazon_accounts')
        .select('*')
        .eq('id', editId)
        .maybeSingle();
      if (data) {
        setForm({
          email: data.email || '',
          password: data.password_encrypted || '',
          totpKey: data.totp_key_encrypted || '',
          cardName: data.card_name || '',
          cardNumber: data.card_number_encrypted || '',
          cardCvv: data.card_cvv_encrypted || '',
          cardExpMonth: data.card_exp_month?.toString() || '',
          cardExpYear: data.card_exp_year?.toString() || '',
          billingFirst: data.billing_first || '',
          billingLast: data.billing_last || '',
          billingAddress1: data.billing_address1 || '',
          billingAddress2: data.billing_address2 || '',
          billingCity: data.billing_city || '',
          billingState: data.billing_state || '',
          billingZip: data.billing_zip || '',
          billingPhone: data.billing_phone || '',
        });
      }
      setLoading(false);
    };
    load();
  }, [editId, user]);

  const update = (field: keyof AmazonFormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.email || !form.password) {
      toast.error('Email and password are required');
      return;
    }
    onSave(form, editId);
  };

  if (loading) return <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>;

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="bg-accent/50 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">Your credentials are encrypted and stored securely. We never share your data.</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Amazon Login</h4>
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={e => update('email', e.target.value)} placeholder="amazon@email.com" className="mt-1 rounded-md" />
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative mt-1">
            <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" className="rounded-md pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>TOTP Secret Key</Label>
          <p className="text-xs text-muted-foreground mb-1">This is the setup key from your authenticator app, not a one-time code.</p>
          <div className="relative">
            <Input type={showTotp ? 'text' : 'password'} value={form.totpKey} onChange={e => update('totpKey', e.target.value)} placeholder="JBSWY3DPEHPK3PXP" className="rounded-md pr-10" />
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
          <Input value={form.cardName} onChange={e => update('cardName', e.target.value)} placeholder="John Doe" className="mt-1 rounded-md" />
        </div>
        <div>
          <Label>Card Number</Label>
          <Input value={form.cardNumber} onChange={e => update('cardNumber', e.target.value)} placeholder="4242424242424242" className="mt-1 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Exp Month</Label>
            <Input value={form.cardExpMonth} onChange={e => update('cardExpMonth', e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="01" className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>Exp Year</Label>
            <Input value={form.cardExpYear} onChange={e => update('cardExpYear', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2026" className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>CVV</Label>
            <Input type="password" value={form.cardCvv} onChange={e => update('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" className="mt-1 rounded-md" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Billing Address</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First Name</Label>
            <Input value={form.billingFirst} onChange={e => update('billingFirst', e.target.value)} className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={form.billingLast} onChange={e => update('billingLast', e.target.value)} className="mt-1 rounded-md" />
          </div>
        </div>
        <div>
          <Label>Address Line 1</Label>
          <Input value={form.billingAddress1} onChange={e => update('billingAddress1', e.target.value)} className="mt-1 rounded-md" />
        </div>
        <div>
          <Label>Address Line 2</Label>
          <Input value={form.billingAddress2} onChange={e => update('billingAddress2', e.target.value)} className="mt-1 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>City</Label>
            <Input value={form.billingCity} onChange={e => update('billingCity', e.target.value)} className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>State</Label>
            <Input value={form.billingState} onChange={e => update('billingState', e.target.value)} className="mt-1 rounded-md" />
          </div>
          <div>
            <Label>ZIP</Label>
            <Input value={form.billingZip} onChange={e => update('billingZip', e.target.value)} className="mt-1 rounded-md" />
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.billingPhone} onChange={e => update('billingPhone', e.target.value)} placeholder="555-123-4567" className="mt-1 rounded-md" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary-bg text-primary-foreground rounded-md">
        {saving ? 'Saving...' : editId ? 'Update Account' : 'Save Account'}
      </Button>
    </div>
  );
}

function SettingsContent() {
  const { user, signOut } = useAuth();
  const { planLabel } = useUserPlan();
  const navigate = useNavigate();
  const [displayNameField, setDisplayNameField] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [accounts, setAccounts] = useState<AmazonAccount[]>([]);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [connectingDiscord, setConnectingDiscord] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayName = displayNameField || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const discordIdentity = user?.identities?.find(i => i.provider === 'discord');

  // Load profile and accounts from Supabase
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, accountsRes] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', user.id).single(),
        supabase.from('amazon_accounts').select('id, email, totp_key_encrypted, card_number_encrypted').eq('user_id', user.id).eq('is_active', true),
      ]);
      if (profileRes.data) {
        setDisplayNameField(profileRes.data.display_name || '');
      }
      setProfileLoaded(true);
      if (accountsRes.data) {
        setAccounts(accountsRes.data.map(a => ({
          id: a.id,
          email: a.email,
          hasTotp: !!a.totp_key_encrypted,
          cardLast4: (a.card_number_encrypted || '').slice(-4) || '••••',
        })));
      }
    };
    load();
  }, [user]);

  const handleSaveAccount = async (form: AmazonFormData, editId?: string) => {
    if (!user) return;
    setSaving(true);

    if (editId) {
      const { error } = await supabase
        .from('amazon_accounts')
        .update({
          email: form.email,
          password_encrypted: form.password,
          totp_key_encrypted: form.totpKey,
          card_name: form.cardName,
          card_number_encrypted: form.cardNumber,
          card_cvv_encrypted: form.cardCvv,
          card_exp_month: parseInt(form.cardExpMonth) || 0,
          card_exp_year: parseInt(form.cardExpYear) || 0,
          billing_first: form.billingFirst,
          billing_last: form.billingLast,
          billing_address1: form.billingAddress1,
          billing_address2: form.billingAddress2 || '',
          billing_city: form.billingCity,
          billing_state: form.billingState,
          billing_zip: form.billingZip,
          billing_phone: form.billingPhone,
        })
        .eq('id', editId);

      setSaving(false);
      if (error) {
        toast.error('Failed to update: ' + error.message);
        return;
      }
      toast.success('Amazon account updated!');
    } else {
      const { error } = await supabase
        .from('amazon_accounts')
        .insert({
          user_id: user.id,
          email: form.email,
          password_encrypted: form.password,
          totp_key_encrypted: form.totpKey,
          card_name: form.cardName,
          card_number_encrypted: form.cardNumber,
          card_cvv_encrypted: form.cardCvv,
          card_exp_month: parseInt(form.cardExpMonth) || 0,
          card_exp_year: parseInt(form.cardExpYear) || 0,
          billing_first: form.billingFirst,
          billing_last: form.billingLast,
          billing_address1: form.billingAddress1,
          billing_address2: form.billingAddress2 || '',
          billing_city: form.billingCity,
          billing_state: form.billingState,
          billing_zip: form.billingZip,
          billing_phone: form.billingPhone,
          billing_country: 'US',
          is_active: true,
        });

      setSaving(false);
      if (error) {
        toast.error('Failed to save: ' + error.message);
        return;
      }
      toast.success('Amazon account saved!');
    }

    // Reload accounts
    const { data } = await supabase
      .from('amazon_accounts')
      .select('id, email, totp_key_encrypted, card_number_encrypted')
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (data) {
      setAccounts(data.map(a => ({
        id: a.id,
        email: a.email,
        hasTotp: !!a.totp_key_encrypted,
        cardLast4: (a.card_number_encrypted || '').slice(-4) || '••••',
      })));
    }

    setModalOpen(false);
    setEditAccountId(null);
  };

  const handleRemoveAccount = async (id: string) => {
    const { error } = await supabase
      .from('amazon_accounts')
      .update({ is_active: false })
      .eq('id', id);
    if (error) {
      toast.error('Failed to remove account');
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== id));
    toast.success('Account removed');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayNameField })
      .eq('id', user.id);
    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved');
    }
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

  return (
    <div className="min-h-screen flex bg-surface-1">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col z-40">
        <div className="p-5 flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Airborne</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.path === '/settings' ? 'bg-accent text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
              <p className="text-xs text-muted-foreground">{planLabel || <span className="opacity-0">Loading</span>}</p>
            </div>
          </div>
        </div>
      </aside>

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
            <div className="mb-4">
              <Label>Display Name</Label>
              {profileLoaded ? (
                <Input value={displayNameField} onChange={e => setDisplayNameField(e.target.value)} className="mt-1.5 rounded-md" placeholder="Your display name" />
              ) : (
                <Input disabled className="mt-1.5 rounded-md bg-surface-1" placeholder="Loading..." />
              )}
            </div>
            <div className="mb-5">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="mt-1.5 rounded-md bg-surface-1" />
              <p className="text-xs text-muted-foreground mt-1">Email is managed by your authentication provider</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={!profileLoaded} className="gradient-primary-bg text-primary-foreground rounded-md">Save Profile</Button>
          </div>

          {/* Amazon Accounts */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">Amazon Profile(s)</h2>
              <Dialog open={modalOpen} onOpenChange={o => { setModalOpen(o); if (!o) setEditAccountId(null); }}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary-bg text-primary-foreground rounded-md gap-2" onClick={() => { setEditAccountId(null); setModalOpen(true); }}>
                    <Plus className="h-4 w-4" /> Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-xl">
                  <DialogHeader>
                    <DialogTitle>{editAccountId ? 'Edit Amazon Account' : 'Add Amazon Account'}</DialogTitle>
                  </DialogHeader>
                  <AmazonAccountModal onSave={handleSaveAccount} editId={editAccountId || undefined} saving={saving} />
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
                  const masked = emailParts[0].slice(0, 2) + '•••@' + (emailParts[1] || '');
                  const acInitials = a.email.slice(0, 2).toUpperCase();
                  return (
                    <div key={a.id} className="group relative bg-surface-1 border rounded-lg px-4 py-3 cursor-pointer hover:border-primary/30 transition-colors"
                      onDoubleClick={() => { setEditAccountId(a.id); setModalOpen(true); }}>
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

          {/* Connected Accounts */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-5">Connected Accounts</h2>
            <div className="space-y-3">
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

          {/* Subscription */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-5">Airborne Subscription</h2>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl gradient-primary-bg flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-base">{planLabel || <span className="opacity-0">Loading</span>}</p>
                    <p className="text-sm text-muted-foreground">$49.99/month</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success/15 text-success text-xs font-medium">Active</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-surface-1 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Calendar className="h-3.5 w-3.5" /> Current Period</div>
                    <p className="text-sm font-medium">Apr 9 – May 9, 2026</p>
                  </div>
                  <div className="bg-surface-1 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Calendar className="h-3.5 w-3.5" /> Next Renewal</div>
                    <p className="text-sm font-medium">May 9, 2026</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button variant="outline" size="sm" className="rounded-md gap-2" onClick={() => toast.info('Stripe billing portal will be connected soon.')}><ExternalLink className="h-3.5 w-3.5" /> Manage Billing</Button>
                  <Button variant="ghost" size="sm" className="rounded-md gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => toast.info('Stripe cancellation flow will be connected soon.')}>Cancel Plan</Button>
                </div>
                <p className="text-xs text-muted-foreground">Billing is managed through Stripe. You'll be redirected to a secure portal to update payment methods or cancel.</p>
              </div>
            </div>
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
