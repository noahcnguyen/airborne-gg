import { Link } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Plane className="h-6 w-6 text-primary" />
            <span>Airborne</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-[800px] mx-auto prose prose-slate">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm mb-8">Last Updated: April 12, 2026</p>

            <p>Airborne LLC ("Airborne," "We," or "Us") operates the Airborne.gg platform. This Privacy Policy explains how we collect, use, and protect your information.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Information We Collect</h2>
            <ul className="space-y-1.5 text-sm leading-relaxed">
              <li><strong>Account information:</strong> name, email address, password</li>
              <li><strong>eBay account credentials:</strong> OAuth tokens (we never store your eBay password)</li>
              <li><strong>Amazon account credentials:</strong> email, encrypted password, billing information, and card details stored securely</li>
              <li><strong>Order data:</strong> eBay order IDs, shipping addresses, tracking numbers, profit data</li>
              <li><strong>Usage data:</strong> listing activity, fulfillment history, platform interactions</li>
            </ul>

            <h2 className="text-xl font-bold mt-10 mb-3">How We Use Your Information</h2>
            <ul className="space-y-1.5 text-sm leading-relaxed">
              <li>To provide and operate the Platform</li>
              <li>To automate listings, order fulfillment, and tracking on your behalf</li>
              <li>To calculate and display profit and performance data</li>
              <li>To communicate with you about your account and orders</li>
              <li>To improve the Platform and fix issues</li>
            </ul>

            <h2 className="text-xl font-bold mt-10 mb-3">Data Storage and Security</h2>
            <p>Your data is stored securely using PostgreSQL. Sensitive credentials such as Amazon passwords and card numbers are stored encrypted. We use Cloudflare for network security and access protection.</p>
            <p>We do not sell your personal information to third parties.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Third-Party Services</h2>
            <p>Airborne integrates with the following third-party services to operate:</p>
            <ul className="space-y-1.5 text-sm leading-relaxed">
              <li><strong>eBay API</strong> — for listing management and order fulfillment</li>
              <li><strong>Amazon (via Zinc API)</strong> — for automated order placement</li>
              <li><strong>Stripe</strong> — for payment processing</li>
              <li><strong>Cloudflare</strong> — for network security</li>
            </ul>
            <p>Each of these services has their own privacy policies which govern their use of your data.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Data Retention</h2>
            <p>We retain your data for as long as your account is active. Upon account deletion, your personal data is removed within 30 days. Order history may be retained for legal and accounting purposes.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To request data deletion or export, contact us at <a href="mailto:support@airborne.gg" className="text-primary hover:underline">support@airborne.gg</a>.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Cookies</h2>
            <p>Airborne uses cookies and local storage for authentication and session management. We do not use tracking cookies for advertising purposes.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Changes to This Policy</h2>
            <p>We may update this Privacy Policy at any time. Continued use of the Platform constitutes acceptance of any updates.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:support@airborne.gg" className="text-primary hover:underline">support@airborne.gg</a> or join our Discord at <a href="https://discord.gg/V7K9V7qzD7" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">discord.gg/V7K9V7qzD7</a>.</p>
          </div>
        </div>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Plane className="h-5 w-5 text-primary" />Airborne
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <a href="https://discord.gg/V7K9V7qzD7" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">Join Our Discord</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Airborne.gg</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
