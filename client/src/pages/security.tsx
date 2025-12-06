import Header from "@/components/header";
import Footer from "@/components/footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import {
  Lock,
  Shield,
  Eye,
  Key,
  Server,
  AlertCircle,
  CheckCircle,
  Cpu,
  Database,
  Network
} from "lucide-react";

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "256-bit Encryption",
      description: "Military-grade encryption for all data in transit and at rest",
      details: ["TLS 1.3", "AES-256", "End-to-end encryption"]
    },
    {
      icon: Shield,
      title: "Authentication",
      description: "Secure authentication and authorization mechanisms",
      details: ["JWT tokens", "Secure sessions", "Rate limiting"]
    },
    {
      icon: Key,
      title: "Access Control",
      description: "Fine-grained access control and permission management",
      details: ["Role-based", "Per-customer isolation", "Audit trails"]
    },
    {
      icon: Eye,
      title: "Monitoring",
      description: "Continuous security monitoring and threat detection",
      details: ["Real-time logs", "Intrusion detection", "Anomaly alerts"]
    },
    {
      icon: Database,
      title: "Data Protection",
      description: "Customer data is isolated and protected with multiple layers",
      details: ["Data isolation", "Backup encryption", "GDPR compliant"]
    },
    {
      icon: Server,
      title: "Infrastructure",
      description: "Secure cloud infrastructure with redundancy and failover",
      details: ["SSL certificates", "CDN protection", "DDoS mitigation"]
    }
  ];

  const complianceItems = [
    { label: "GDPR", description: "General Data Protection Regulation", status: "compliant" },
    { label: "PCI DSS", description: "Payment Card Industry Data Security", status: "compliant" },
    { label: "ISO 27001", description: "Information Security Management", status: "compliant" },
    { label: "SOC 2", description: "Service Organization Control", status: "in-progress" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Security & Privacy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Your data security and privacy are our highest priorities. Learn about our comprehensive security measures
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {securityFeatures.map((feature, idx) => (
              <SpotlightCard key={idx} className="hover:border-primary/50 transition-colors" spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" aria-hidden="true" />
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </SpotlightCard>
            ))}
          </div>

          {/* Compliance Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Compliance & Standards</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {complianceItems.map((item, idx) => (
                <SpotlightCard key={idx} className="p-4" spotlightColor="rgba(var(--primary), 0.05)">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "compliant" 
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                    }`}>
                      {item.status === "compliant" ? "✓ Compliant" : "In Progress"}
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>

          {/* Security Best Practices */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Security Practices</h2>
            <div className="space-y-4">
              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold">Secure Code Development</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Regular security audits and code reviews</p>
                  <p>• OWASP security guidelines compliance</p>
                  <p>• Continuous integration with security tests</p>
                  <p>• Dependency vulnerability scanning</p>
                </CardContent>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold">Network Security</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Enterprise-grade firewalls and VPN</p>
                  <p>• DDoS protection and rate limiting</p>
                  <p>• SSL/TLS certificate pinning</p>
                  <p>• Regular penetration testing</p>
                </CardContent>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold">Incident Response</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• 24/7 security monitoring</p>
                  <p>• Rapid incident response team</p>
                  <p>• Breach notification procedures</p>
                  <p>• Regular disaster recovery drills</p>
                </CardContent>
              </SpotlightCard>
            </div>
          </div>

          {/* Data Privacy */}
          <SpotlightCard className="bg-gradient-to-r from-primary/5 to-accent/5" spotlightColor="rgba(var(--primary), 0.1)">
            <CardHeader>
              <h2 className="text-2xl font-bold">Data Privacy</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Your Data Rights</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Right to access your personal data</li>
                  <li>• Right to correct inaccurate data</li>
                  <li>• Right to request data deletion</li>
                  <li>• Right to data portability</li>
                  <li>• Right to withdraw consent</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Usage</h3>
                <p className="text-sm text-muted-foreground">
                  We collect only necessary information for loan processing. Your data is never sold to third parties and is protected under strict confidentiality agreements.
                </p>
              </div>
            </CardContent>
          </SpotlightCard>

          {/* Support Section */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Security Questions?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our security team for any concerns or inquiries
            </p>
            <a href="mailto:security@projectorion.com" className="text-primary hover:underline">
              security@projectorion.com
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
