import Header from "@/components/header";
import Footer from "@/components/footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

          <div className="space-y-8">
            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By using Project Orion, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Project Orion is an AI-powered loan processing platform offering:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Standard mode with guided wizard interface</li>
                  <li>Agentic AI mode with conversational AI assistance</li>
                  <li>Automated document processing and verification</li>
                  <li>Instant loan decision generation</li>
                </ul>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">3. User Eligibility</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You must be:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>At least 18 years old</li>
                  <li>A legal resident of the applicable jurisdiction</li>
                  <li>Capable of entering into binding contracts</li>
                  <li>Acting on your own behalf, not for others</li>
                </ul>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">4. User Responsibilities</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You are responsible for:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Providing accurate and truthful information</li>
                  <li>Maintaining account confidentiality</li>
                  <li>All activities under your account</li>
                  <li>Complying with all applicable laws</li>
                  <li>Not using the service for illegal purposes</li>
                </ul>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  All content, features, and functionality are owned by Project Orion, protected by copyright and other intellectual property laws. Unauthorized use is prohibited.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To the extent permitted by law, Project Orion is not liable for:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of data or profits</li>
                  <li>Service interruptions or delays</li>
                  <li>Third-party actions</li>
                </ul>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">7. Disclaimer of Warranties</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Project Orion is provided "as is" without warranties. We do not guarantee:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Uninterrupted service availability</li>
                  <li>Accuracy of loan decisions</li>
                  <li>Specific results or outcomes</li>
                  <li>Freedom from errors or defects</li>
                </ul>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We reserve the right to terminate or suspend access for:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Violation of these terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Non-payment of fees</li>
                  <li>Extended inactivity</li>
                </ul>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">9. Modifications</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may modify these terms at any time. Continued use constitutes acceptance of updated terms. Major changes will be communicated through email or website notice.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">10. Dispute Resolution</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Disputes shall be resolved through:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Good faith negotiation</li>
                  <li>Mediation if negotiation fails</li>
                  <li>Binding arbitration as a last resort</li>
                  <li>Governed by applicable law</li>
                </ul>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These terms are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">12. Entire Agreement</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These terms, including our Privacy Policy, constitute the entire agreement between you and Project Orion and supersede all prior agreements.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">13. Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  For questions about these terms, contact us at:
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-foreground">Project Orion Legal Team</p>
                  <p>Email: legal@projectorion.com</p>
                </div>
              </div>
            </SpotlightCard>

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
