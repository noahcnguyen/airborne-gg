import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Zap, Package, BarChart3, RefreshCw, ChevronDown, Check, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Plane className="h-6 w-6 text-primary" />
          <span>Airborne</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
          ))}
        </div>
        <Link to="/login" className="hidden md:inline-flex">
          <Button className="gradient-primary-bg text-primary-foreground rounded-md px-6">Get Started</Button>
        </Link>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-b p-4 space-y-3">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>{l}</a>
          ))}
          <Link to="/login"><Button className="w-full gradient-primary-bg text-primary-foreground rounded-md">Get Started</Button></Link>
        </div>
      )}
    </nav>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-amber-100 text-amber-700',
    purple: 'bg-violet-100 text-violet-700',
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[color]}`}>{label}</span>;
}

function HeroDashboard() {
  const orders = [
    { id: '#AB-7291', buyer: 'Sarah M.', status: 'Fulfilled', color: 'green', profit: '$12.40' },
    { id: '#AB-7290', buyer: 'James K.', status: 'Tracking', color: 'blue', profit: '$8.90' },
    { id: '#AB-7289', buyer: 'Lisa R.', status: 'Pending', color: 'yellow', profit: '$15.20' },
    { id: '#AB-7288', buyer: 'Mike D.', status: 'Processing', color: 'purple', profit: '$6.70' },
  ];
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
      className="relative w-full max-w-lg">
      <div className="bg-card rounded-xl border shadow-2xl shadow-primary/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Live Orders</h3>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2 h-2 rounded-full bg-success animate-pulse_dot" />Connected</span>
        </div>
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{o.id}</span>
                <p className="text-sm font-medium">{o.buyer}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill label={o.status} color={o.color} />
                <span className="text-sm font-semibold text-success">{o.profit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-4 bg-card rounded-lg border shadow-lg px-3 py-2 text-xs font-semibold">
        📦 847 <span className="text-muted-foreground font-normal">active listings</span>
      </motion.div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute -bottom-4 -left-4 bg-card rounded-lg border shadow-lg px-3 py-2 text-xs font-semibold text-success">
        +$342.80 <span className="text-muted-foreground font-normal">today</span>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-xs font-medium mb-6">
              <Zap className="h-3.5 w-3.5" /> Now in Early Access
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-tight tracking-tight mb-6">
              The Fastest Way to Scale Your <span className="text-gradient">eBay Dropshipping</span> Business
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Automate listings, fulfill orders, and sync tracking — all from one dashboard. Connect your eBay and Amazon accounts and let Airborne handle the rest.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login"><Button size="lg" className="gradient-primary-bg text-primary-foreground rounded-md px-8 text-base">Start for $1 <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <a href="#how-it-works"><Button size="lg" variant="outline" className="rounded-md px-8 text-base">See How It Works</Button></a>
            </div>
          </motion.div>
          <div className="flex-1 flex justify-center">
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Package, title: 'Automated Listing Importer', desc: 'Import thousands of Amazon products to eBay in minutes. Our smart importer handles titles, descriptions, images, and pricing automatically.' },
  { icon: Zap, title: 'Smart Order Fulfillment', desc: 'Orders are automatically placed on Amazon with your saved credentials. One-click fulfillment with error handling and retry logic.' },
  { icon: RefreshCw, title: 'Real-Time Tracking Sync', desc: 'Tracking numbers are synced from Amazon to eBay automatically. Buyers stay updated and your seller metrics stay pristine.' },
  { icon: BarChart3, title: 'Price & Profit Monitoring', desc: 'Monitor price changes, stock levels, and profit margins in real time. Get alerts when margins drop below your threshold.' },
];

function Features() {
  return (
    <section id="features" className="py-20 bg-surface-1">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Dropship Smarter</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Airborne automates the tedious parts so you can focus on scaling.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card rounded-xl border p-6 card-hover">
              <div className="w-11 h-11 rounded-lg gradient-primary-bg flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Connect Your Stores', desc: 'Link your eBay and Amazon accounts securely through OAuth. No passwords stored.' },
    { num: '02', title: 'Import & List Products', desc: 'Paste ASINs or import from a pool. Airborne creates optimized eBay listings instantly.' },
    { num: '03', title: 'Sit Back & Profit', desc: 'When an order comes in, Airborne auto-fulfills on Amazon and syncs tracking to eBay.' },
  ];
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Airborne Works</h2>
              <p className="text-muted-foreground mb-10">Get up and running in under 10 minutes.</p>
            </motion.div>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}
                  className="flex gap-5">
                  <div className="w-10 h-10 rounded-lg gradient-primary-bg flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">{s.num}</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}
            className="flex-1 w-full max-w-lg">
            <div className="bg-foreground rounded-xl p-6 text-primary-foreground">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-primary-foreground/50 ml-2">Order Flow</span>
              </div>
              <div className="space-y-4 text-sm font-mono">
                <div className="flex items-center gap-3"><span className="text-blue-400">→</span> eBay order received: #EB-9821</div>
                <div className="flex items-center gap-3"><span className="text-yellow-400">⟳</span> Matching ASIN: B09V3KXJPB</div>
                <div className="flex items-center gap-3"><span className="text-blue-400">→</span> Placing Amazon order...</div>
                <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Amazon order confirmed: 114-284719</div>
                <div className="flex items-center gap-3"><span className="text-green-400">✓</span> Tracking synced to eBay</div>
                <div className="mt-4 pt-4 border-t border-primary-foreground/10 text-green-400 font-semibold">Profit: +$14.20</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const plans = [
  { name: 'Starter', price: 49, subtitle: '1,000 listings · 1 Store', popular: false, multiStore: false },
  { name: 'Growth', price: 79, subtitle: '2,500 listings · 1 Store', popular: false, multiStore: false },
  { name: 'Advanced', price: 129, subtitle: '10,000 listings per store · 2 Stores · 20,000 total listings', popular: true, multiStore: true },
  { name: 'Pro', price: 219, subtitle: '25,000 listings per store · 3 Stores · 75,000 total listings', popular: false, multiStore: true },
];
const planFeatures = ['Automated Listing Importer', 'Smart Order Fulfillment', 'Real-Time Tracking Sync', 'Price & Profit Monitoring', '24/7 Monitoring'];

function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-surface-1">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">All plans include full automation. Scale when you're ready.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
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
              <Link to="/login">
                <Button className={`w-full rounded-md ${p.popular ? 'gradient-primary-bg text-primary-foreground' : ''}`} variant={p.popular ? 'default' : 'outline'}>
                  Start for $1
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">$1 per order fulfilled. Extra stores $49/mo.</p>
      </div>
    </section>
  );
}

const faqs = [
  { q: 'What is Airborne?', a: 'Airborne is an Amazon-to-eBay dropshipping automation platform. It handles listing, order fulfillment, tracking sync, and price monitoring — all from one dashboard.' },
  { q: 'Do I need experience to use Airborne?', a: 'No. Airborne is built for beginners and experienced sellers alike. The platform handles the complex parts so you can focus on picking products.' },
  { q: 'What do I need to get started?', a: 'You need an active eBay seller account and an Amazon buyer account. Connect both through Airborne and you\'re ready to go.' },
  { q: 'Is eBay dropshipping allowed?', a: 'Yes. eBay allows dropshipping as long as you fulfill orders within the stated handling time and provide tracking. Airborne ensures you stay compliant.' },
  { q: 'What happens if prices or stock change?', a: 'Airborne monitors your listings 24/7. If an Amazon price increases or stock runs out, your eBay listing is automatically updated or paused.' },
  { q: 'Can I manage multiple eBay stores?', a: 'Yes. The Advanced plan supports 2 stores and the Pro plan supports up to 5. Each store is managed independently.' },
  { q: 'How does the $1 per order fee work?', a: 'Every time Airborne successfully fulfills an order on Amazon, a $1 fulfillment fee is charged to your account. You only pay when orders are actually fulfilled — no hidden fees.' },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}
              className="border rounded-xl overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-surface-1 transition-colors">
                {f.q}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === i && <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="gradient-primary-bg rounded-2xl p-12 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your eBay store, on autopilot.</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Start for $1. 3 days to see exactly what Airborne does to your store.</p>
          <Link to="/login"><Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 rounded-md px-8 text-base font-semibold">
            Start for $1 <ArrowRight className="ml-2 h-4 w-4" />
          </Button></Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Plane className="h-5 w-5 text-primary" />Airborne
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <a href="https://discord.gg/V7K9V7qzD7" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Join Our Discord</a>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Airborne.gg</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
