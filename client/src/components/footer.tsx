import { useLocation } from "wouter";
import { 
  CreditCard, 
  Github, 
  Linkedin, 
  Twitter, 
  Mail,
  FileText,
  Shield,
  Brain,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Footer() {
  const [, navigate] = useLocation();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Standard Mode", href: "/standard", icon: FileText },
        { label: "Agentic AI Mode", href: "/agentic", icon: Brain },
        { label: "Features", href: "/features", icon: Zap },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs", icon: FileText },
        { label: "Security", href: "/security", icon: Shield },
        { label: "Privacy Policy", href: "/privacy", icon: Shield },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms", icon: FileText },
        { label: "Cookie Policy", href: "/cookies", icon: FileText },
        { label: "Contact Us", href: "/contact", icon: Mail },
      ]
    }
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/FTS18/Project-Orion", label: "GitHub", external: true },
    { icon: Linkedin, href: "#", label: "LinkedIn", external: true },
    { icon: Twitter, href: "#", label: "Twitter", external: true },
  ];

  return (
    <footer className="border-t bg-background">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="font-semibold text-lg">Project Orion</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered dual-mode loan processing platform with intelligent agent orchestration
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.href)}
                      className={cn(
                        "text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group",
                        "hover:translate-x-0.5 transition-transform"
                      )}
                    >
                      <link.icon className="h-3 w-3 opacity-50 group-hover:opacity-100" aria-hidden="true" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Project Orion. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/privacy")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </button>
            <a
              href="https://github.com/FTS18/Project-Orion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
