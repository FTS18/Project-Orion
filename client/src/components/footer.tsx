import { useLocation } from "wouter";
import { Github, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const [, navigate] = useLocation();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Home", href: "/" },
        { label: "Standard Mode", href: "/standard" },
        { label: "Agentic AI", href: "/agentic" },
        { label: "Features", href: "/features" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Community", href: "/community" },
        { label: "Blog", href: "/blog" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "Careers", href: "/careers" },
        { label: "Legal", href: "/legal" },
        { label: "Contact", href: "/contact" },
      ]
    }
  ];

  return (
    <footer className="bg-background border-t border-border/50 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Project Orion
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Empowering the next generation of financial decision-making with AI-driven insights and agentic workflows.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Subscribe to our newsletter</h3>
              <div className="flex gap-2 max-w-sm">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-background/50 h-10 border-foreground/10 focus-visible:ring-primary/20" 
                />
                <Button size="icon" className="h-10 w-10 shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                By subscribing, you agree to our Policy and acknowledge you've read our Privacy Notice.
              </p>

              <div className="pt-8">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Problem Statement by
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://www.ey.com/en_in/techathon-6/problem-statement-2-bfsi#tabs-f82bdd5767-item-808eebef4b-tablinks" target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                    <div className="bg-white p-2 rounded-lg h-14 w-14 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                       <img src="https://logo.clearbit.com/ey.com" alt="EY" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-muted-foreground font-medium">x</span>
                    <div className="bg-white p-2 rounded-lg h-14 w-auto min-w-[120px] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                       <img src="https://logo.clearbit.com/tatacapital.com" alt="Tata Capital" className="h-full w-full object-contain" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="font-semibold text-sm tracking-wide text-foreground/90">
                  {section.title}
                </h3>
                <ul className="space-y-1.5 md:space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => navigate(link.href)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors text-left font-medium block"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/50 mb-8" />

        {/* Branding & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Project Orion Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full" onClick={() => window.open("https://github.com/FTS18/Project-Orion", "_blank")}>
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
