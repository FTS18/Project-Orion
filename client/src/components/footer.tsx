import { useLocation } from "wouter";


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



  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-3 md:col-span-1">
            <span className="font-semibold text-sm">Project Orion</span>
          </div>

          {/* Footer Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-medium text-sm text-foreground mb-2">{section.title}</h3>
              <ul className="flex flex-col gap-0.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left py-0 leading-tight block"
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
        <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-4 text-[10px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Project Orion</p>
          <div className="flex gap-4">
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
