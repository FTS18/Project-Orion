import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Sitemap() {
  const [, navigate] = useLocation();

  const sections = [
    {
      title: "Main",
      links: [
        { label: "Home", href: "/" },
        { label: "Standard Mode", href: "/standard" },
        { label: "Agentic Mode", href: "/agentic" },
        { label: "Features", href: "/features" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        // { label: "API Reference", href: "/docs/api" }, // Removed per request
        { label: "Blog", href: "/blog" },
        { label: "Community", href: "/community" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookies", href: "/cookies" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-24 pb-16">
         <div className="max-w-4xl mx-auto px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Sitemap</h1>
                <p className="text-muted-foreground">Overview of all pages in Project Orion.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               {sections.map((section) => (
                  <div key={section.title} className="space-y-4">
                     <h2 className="text-lg font-semibold border-b border-border pb-2">{section.title}</h2>
                     <ul className="space-y-3">
                        {section.links.map((link) => (
                           <li key={link.href}>
                              <a 
                                href={link.href} 
                                className="text-muted-foreground hover:text-emerald-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                              >
                                 <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-emerald-500 dark:group-hover:bg-blue-400 transition-colors" />
                                 {link.label}
                              </a>
                           </li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
         </div>
      </main>
      <Footer />
    </div>
  );
}
