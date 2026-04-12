import { Link } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground text-sm mb-8">Last Updated: April 12, 2026</p>

            <p>Welcome to Airborne.gg ("Platform"), owned and operated by Airborne LLC, a Kansas limited liability company ("Airborne," "We," or "Us").</p>

            <h2 className="text-xl font-bold mt-10 mb-3">General Terms</h2>
            <p>Airborne is a third-party software platform designed to automate eBay dropshipping operations including product listing, order fulfillment, and tracking synchronization. By accessing or using the Platform, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must refrain from using the Platform.</p>
            <p>You confirm that you are at least 18 years old or the legally required age in your jurisdiction.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Access Permissions and Account Integration</h2>
            <p>Airborne is not affiliated with or endorsed by eBay, Amazon, or any other third-party platforms it integrates with. Your use of Airborne is entirely at your own risk.</p>
            <p>By accepting these Terms, you authorize Airborne to access and operate within your eBay and Amazon accounts, including actions such as creating and updating product listings, processing orders, and syncing tracking information. You can revoke access at any time through your account settings.</p>
            <p>You are solely responsible for complying with the terms of service of eBay, Amazon, and any other third-party platforms you use with Airborne.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Use Risks and Liabilities</h2>
            <p>Airborne operates as an automated software platform and may rely on third-party APIs which can occasionally provide inaccurate or incomplete information. Airborne does not guarantee uninterrupted access and reserves the right to modify or discontinue features without prior notice.</p>
            <p>Airborne is not liable for any direct or indirect damages arising from your use of the Platform, including account restrictions or suspensions by eBay or Amazon, data inaccuracies, or financial losses.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Account Registration</h2>
            <p>You must provide accurate and complete information when creating your account. You are solely responsible for maintaining the confidentiality of your account credentials. Sharing account access with others constitutes a material breach of these Terms.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Payments and Refunds</h2>
            <p>Use of Airborne requires payment based on the subscription plan selected. Subscription fees are billed automatically on a recurring basis unless canceled. A $1 trial fee is charged upfront and auto-renews to the full plan price after the trial period.</p>
            <p>Refunds are not guaranteed but may be granted on a case-by-case basis. To request a cancellation or refund, contact <a href="mailto:support@airborne.gg" className="text-primary hover:underline">support@airborne.gg</a>.</p>
            <p>A $1 fulfillment fee is charged per successfully fulfilled order. You are responsible for maintaining sufficient credits for fulfillment.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Compliance with eBay and Amazon Policies</h2>
            <p>You confirm that you understand and agree to comply with all applicable eBay and Amazon policies. Airborne is a third-party tool and does not provide guarantees regarding compliance. You are solely responsible for ensuring your activities adhere to all applicable platform terms.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Intellectual Property</h2>
            <p>Airborne retains all rights to the Platform's intellectual property including its software, trademarks, and design. Unauthorized use is strictly prohibited. All proprietary information including design, architecture, and features of the software is confidential.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Prohibited Activities</h2>
            <p>You agree not to use the Platform to violate any applicable laws, engage in fraudulent practices, infringe on intellectual property rights, attempt to reverse-engineer or misuse the Platform's software, share or resell access without written authorization, or upload harmful code or unauthorized scripts.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Account Termination</h2>
            <p>Airborne reserves the right to suspend or terminate your account at any time if you violate these Terms, misuse the Platform, fail to pay subscription fees, or pose a risk of liability to Airborne.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Disclaimer of Warranties</h2>
            <p>The Platform is provided "as is" and "as available" without warranties of any kind. Airborne disclaims all warranties including merchantability, fitness for a particular purpose, and non-infringement.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Airborne shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Airborne's total liability for any claim shall not exceed the amount you paid in the twelve months preceding the event.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Kansas. Any disputes shall be resolved through binding arbitration. You waive any right to participate in class action proceedings.</p>

            <h2 className="text-xl font-bold mt-10 mb-3">Contact</h2>
            <p>For questions regarding these Terms, contact us at <a href="mailto:support@airborne.gg" className="text-primary hover:underline">support@airborne.gg</a> or join our Discord at <a href="https://discord.gg/V7K9V7qzD7" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">discord.gg/V7K9V7qzD7</a>.</p>
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
