import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Briefcase, Rocket } from "lucide-react";

export default function CareersPage() {
  const positions = [
    { id: 1, title: "Founding AI Engineer", department: "Swarms", location: "Remote", type: "Full-time" },
    { id: 2, title: "Senior Rust Developer", department: "Core Infrastructure", location: "Remote", type: "Full-time" },
    { id: 3, title: "AI Research Intern", department: "R&D", location: "Remote", type: "Internship" },
    { id: 4, title: "Frontend Engineering Intern", department: "Product", location: "Remote", type: "Internship" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="text-center py-20 px-4">
           <Badge variant="secondary" className="mb-6 px-4 py-1">We're Hiring</Badge>
           <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-6">
             Build the Future of <br/>
             <span className="text-emerald-500">Intelligent Capital</span>
           </h1>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
             Join a team of visionaries, engineers, and problem solvers dedicated to rewriting the rules of finance with code.
           </p>
           <Button size="lg" className="h-14 px-8 text-lg rounded-full" onClick={() => window.open("https://hexaforces.netlify.app", "_blank")}>
             View Open Roles
           </Button>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid gap-4">
            {positions.map((job) => (
              <div 
                key={job.id} 
                className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between"
                onClick={() => window.open("https://hexaforces.netlify.app", "_blank")}
              >
                 <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-500 transition-colors">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1"><Code className="h-3 w-3" /> {job.department}</span>
                       <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.type}</span>
                       <span className="flex items-center gap-1"><Rocket className="h-3 w-3" /> {job.location}</span>
                    </div>
                 </div>
                 <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowRight className="h-5 w-5" />
                 </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
