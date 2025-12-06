import Header from "@/components/header";
import Footer from "@/components/footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  const cookieTypes = [
    {
      name: "Essential Cookies",
      key: "essential",
      description: "Required for basic website functionality, security, and user authentication. Cannot be disabled.",
      examples: ["Session tokens", "Security tokens", "CSRF protection"],
      necessary: true
    },
    {
      name: "Analytics Cookies",
      key: "analytics",
      description: "Help us understand how you use the website to improve our services.",
      examples: ["Page views", "User interactions", "Conversion tracking"],
      necessary: false
    },
    {
      name: "Marketing Cookies",
      key: "marketing",
      description: "Used to track your activity across websites for targeted advertising.",
      examples: ["Browsing history", "Interest tracking", "Ad preferences"],
      necessary: false
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>

          <div className="space-y-8">
            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Cookies are small text files stored on your device that help websites function and remember your preferences. They are widely used to enhance user experience.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">Our Cookie Policy</h2>
              <div className="space-y-6">
                {cookieTypes.map((cookie) => (
                  <div key={cookie.key} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">{cookie.name}</h3>
                      {cookie.necessary && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{cookie.description}</p>
                    <p className="text-sm font-medium text-foreground mb-2">Examples:</p>
                    <ul className="space-y-1 list-disc list-inside text-sm text-muted-foreground">
                      {cookie.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">Managing Your Preferences</h2>
              <div className="space-y-6">
                {cookieTypes.map((cookie) => (
                  <div key={cookie.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{cookie.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cookie.necessary ? "Always enabled" : "Toggle to enable/disable"}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[cookie.key as keyof typeof preferences]}
                      onChange={(e) => {
                        if (!cookie.necessary) {
                          setPreferences({
                            ...preferences,
                            [cookie.key]: e.target.checked
                          });
                        }
                      }}
                      disabled={cookie.necessary}
                      className="w-5 h-5"
                    />
                  </div>
                ))}
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">How to Control Cookies</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Most browsers allow you to control cookies through settings. Here's how:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">Chrome</p>
                    <p className="text-sm">Settings → Privacy and security → Cookies and other site data</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground">Firefox</p>
                    <p className="text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground">Safari</p>
                    <p className="text-sm">Preferences → Privacy → Cookies and website data</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground">Edge</p>
                    <p className="text-sm">Settings → Privacy, search, and services → Cookies</p>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may allow third parties to place cookies on your device for:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Analytics and performance measurement</li>
                  <li>Advertising and marketing purposes</li>
                  <li>Social media integration</li>
                </ul>
                <p className="mt-4">
                  You can control third-party cookies through your browser settings or opt-out services.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this cookie policy periodically to reflect changes in technology, legal requirements, or our practices. We will notify you of significant changes through email or website notice.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6 bg-gradient-to-r from-primary/5 to-accent/5" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">Save Your Preferences</h2>
              <p className="text-muted-foreground mb-6">
                Your cookie preferences have been updated. They will be saved in your browser and applied to future visits.
              </p>
              <Button className="w-full">Save & Accept</Button>
            </SpotlightCard>

            <SpotlightCard className="p-6" spotlightColor="rgba(var(--primary), 0.1)">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about our cookie policy, please contact:
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-foreground">Project Orion Privacy Team</p>
                  <p>Email: privacy@projectorion.com</p>
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
