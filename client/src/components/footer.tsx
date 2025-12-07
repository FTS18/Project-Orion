import { useLocation } from "wouter";
import { 
  CreditCard, 
  Github, 
  Linkedin, 
  Twitter, 
} from "lucide-react";

export function Footer() {
  const [, navigate] = useLocation();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Home", href: "/" },
        { label: "Standard", href: "/standard" },
        { label: "Agentic AI", href: "/agentic" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "/docs" },
        { label: "Security", href: "/security" },
        { label: "Privacy", href: "/privacy" },
      ]
    },
    {
      title: "Account",
      links: [
        { label: "Login", href: "/auth/login" },
        { label: "Sign Up", href: "/auth/signup" },
        { label: "Contact", href: "/contact" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/FTS18/Project-Orion", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        {/* Main Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-8">
          {/* Brand Section - Full width on mobile, first column on desktop */}
          <div className="col-span-3 md:col-span-1 flex flex-col md:block gap-3 pb-4 md:pb-0 border-b md:border-0 border-border/50">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Project Orion" className="h-6 w-6 object-contain" />
              <span className="font-semibold text-sm">Project Orion</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
              AI-powered loan processing with intelligent agents
            </p>
            <div className="flex gap-1.5 mt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted"
                  aria-label={social.label}
                >
                  <social.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-medium text-xs text-foreground mb-1">{section.title}</h3>
              <ul className="flex flex-col gap-0 m-0 p-0">
                {section.links.map((link) => (
                  <li key={link.label} className="m-0 p-0 leading-none">
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors text-left py-0 block leading-none h-auto min-h-0"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-center md:justify-between gap-2 text-[10px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Project Orion</p>
          <div className="flex gap-3">
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">Privacy</button>
            <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">Terms</button>
            <a href="https://github.com/FTS18/Project-Orion" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
