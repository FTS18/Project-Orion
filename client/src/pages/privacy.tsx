import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We collect information necessary to process your loan application, including:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Personal identification information</li>
                  <li>Financial information</li>
                  <li>Employment details</li>
                  <li>Contact information</li>
                  <li>Document uploads for verification</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Your information is used for:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Processing loan applications</li>
                  <li>KYC verification</li>
                  <li>Credit assessment</li>
                  <li>Fraud detection</li>
                  <li>Regulatory compliance</li>
                  <li>Service improvement</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>256-bit encryption for data in transit and at rest</li>
                  <li>Secure authentication mechanisms</li>
                  <li>Access controls and monitoring</li>
                  <li>Regular security audits</li>
                  <li>Compliance with international standards</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Process and complete your loan application</li>
                  <li>Maintain transaction history</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes</li>
                </ul>
                <p className="mt-4">
                  You may request deletion of your data at any time, subject to legal requirements.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">5. Sharing Your Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your information may be shared with:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Financial institutions for verification</li>
                  <li>Credit bureaus for assessment</li>
                  <li>Regulatory authorities when required by law</li>
                  <li>Service providers under confidentiality agreements</li>
                </ul>
                <p className="mt-4">
                  We never sell your information to third parties.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You have the right to:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Restrict processing of your information</li>
                  <li>Receive a copy of your data</li>
                  <li>Withdraw consent for processing</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We use cookies to enhance your experience:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Essential cookies for functionality</li>
                  <li>Analytics cookies to understand usage</li>
                  <li>Preference cookies for customization</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">8. Third-Party Links</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our website may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before sharing information.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">9. Policy Changes</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this policy periodically. We will notify you of significant changes through email or prominent website notice. Your continued use constitutes acceptance of updated terms.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  For privacy concerns or requests, contact us at:
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-foreground">Project Orion Privacy Team</p>
                  <p>Email: privacy@projectorion.com</p>
                </div>
              </div>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              Last Updated: December 2024
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
