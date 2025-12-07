import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Brain,
  FileText,
  Lock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Mail
} from "lucide-react";

export default function FeaturesPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Lending</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              The Operating System for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Modern Lending
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience cutting-edge AI technology designed specifically for loan processing, 
              combining speed, security, and smart automation.
            </p>
          </motion.div>

          {/* Custom Bento Grid Layout - Green (Light) / Blue (Dark) Theme */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-24 max-w-6xl mx-auto h-auto">
             
             {/* 1. Brand Card */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
               className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-emerald-600 dark:bg-blue-600 flex items-center justify-center p-8 aspect-square relative overflow-hidden group transition-colors duration-300"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                <h3 className="text-4xl font-bold text-white tracking-tighter z-10">Orion<span className="text-emerald-200 dark:text-blue-200">.</span></h3>
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500 dark:bg-blue-500 rounded-full blur-2xl" />
             </motion.div>

             {/* 2. Intelligent Lending */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
               className="md:col-span-2 md:row-span-1 rounded-[2rem] bg-zinc-100 dark:bg-neutral-900 p-8 flex items-center relative overflow-hidden group"
             >
                <div className="flex flex-col z-10 max-w-[60%]">
                   <div className="flex gap-4 mb-auto">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-xl text-emerald-600 dark:text-blue-500 transition-colors">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-xl text-emerald-600 dark:text-blue-500 transition-colors">
                        <Shield className="h-5 w-5" />
                      </div>
                   </div>
                   <h3 className="text-xl font-semibold mt-4 text-neutral-800 dark:text-neutral-100">Credit Bureau Integration</h3>
                   <p className="text-sm text-muted-foreground mt-1">Direct fetch from CIBIL & Experian for instant credit scoring.</p>
                </div>
                {/* Mock UI */}
                <div className="absolute right-[-20px] top-6 w-48 h-64 bg-emerald-600 dark:bg-blue-600 rounded-[2rem] border-[6px] border-neutral-900 shadow-2xl rotate-12 flex flex-col p-3 overflow-hidden transition-colors duration-300">
                   <div className="w-full h-8 bg-white/20 rounded-full mb-3" />
                   <div className="space-y-2">
                      <div className="h-16 w-full bg-white/20 rounded-xl" />
                      <div className="h-16 w-full bg-white/20 rounded-xl" />
                   </div>
                </div>
             </motion.div>

             {/* 3. AI Agent Persona */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
               className="md:col-span-1 md:row-span-2 rounded-[2rem] bg-emerald-50 dark:bg-blue-900/20 p-6 flex flex-col items-center justify-center relative overflow-hidden text-center transition-colors duration-300"
             >
                 <div className="h-32 w-32 rounded-full bg-emerald-200 dark:bg-blue-800/50 mb-6 overflow-hidden border-4 border-white dark:border-neutral-800 shadow-xl relative grid place-items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=300"
                      alt="Agent"
                      className="object-cover w-full h-full"
                    />
                 </div>
                 <div className="bg-white dark:bg-neutral-800 rounded-full px-5 py-2 shadow-sm mb-4">
                    <span className="font-bold text-emerald-600 dark:text-blue-400 text-sm">Credit Analyst AI</span>
                 </div>
                 <h3 className="text-neutral-600 dark:text-neutral-300 font-medium">"CIBIL 750+. Low DTI. Approved."</h3>
             </motion.div>


             {/* 4. Instant Decisions */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
               className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-white dark:bg-neutral-900 p-8 flex flex-col justify-between shadow-sm border border-neutral-100 dark:border-neutral-800"
             >
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">Instant</h3>
                   <span className="text-muted-foreground font-medium text-sm">Sanction Letters</span>
                </div>
             </motion.div>

             {/* 5. Security Rating */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
               className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-blue-50 dark:bg-blue-900/40 p-8 flex flex-col justify-between"
             >
                <div className="flex items-center gap-2">
                   <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">256-bit</h3>
                   <Lock className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                </div>
                <div className="mt-auto">
                   <p className="text-sm font-medium text-blue-800 dark:text-blue-200">API First</p>
                   <p className="text-xs text-blue-600 dark:text-blue-300">Headless Ready</p>
                </div>
             </motion.div>

             {/* 6. Document Processing */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
               className="md:col-span-1 md:row-span-2 rounded-[2rem] bg-zinc-100 dark:bg-neutral-800/50 p-8 flex flex-col relative overflow-hidden"
             >
                <h3 className="text-3xl font-medium text-neutral-800 dark:text-neutral-100 leading-tight mb-4">
                  Bank Statement <br/>
                  <span className="text-neutral-400">Analyzer</span><br/>
                  Engine
                </h3>
                <div className="mt-auto self-center relative w-full h-32 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-border/50 p-4 space-y-2 opacity-80 rotate-6">
                   <div className="h-2 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
                   <div className="h-2 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                   <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
                   <div className="absolute -right-2 -bottom-2 bg-emerald-500 dark:bg-blue-500 rounded-full p-1 border-2 border-white transition-colors">
                     <CheckCircle className="h-4 w-4 text-white" />
                   </div>
                </div>
             </motion.div>


             {/* 7. Analytics/Charts */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
               className="md:col-span-2 md:row-span-1 rounded-[2rem] bg-emerald-600 dark:bg-blue-600 p-8 relative overflow-hidden text-white transition-colors duration-300"
             >
                 <div className="flex justify-between items-start z-10 relative">
                    <div>
                       <div className="flex gap-2 mb-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-300 dark:bg-blue-300" />
                          <span className="h-2 w-2 rounded-full bg-white" />
                       </div>
                       <h3 className="text-lg font-medium opacity-90">Live Portfolio</h3>
                    </div>
                    <div className="text-right">
                       <p className="text-xs opacity-70">ACTIVE LOANS</p>
                       <p className="text-2xl font-bold">₹12.5 Cr</p>
                    </div>
                 </div>
                 
                 {/* CSS Wave Chart */}
                 <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end opacity-40">
                    <svg viewBox="0 0 100 20" className="w-full h-full fill-white/30" preserveAspectRatio="none">
                       <path d="M0 20 L0 10 Q 25 20 50 10 T 100 5 L 100 20 Z" />
                    </svg>
                 </div>
             </motion.div>

             {/* 8. Cost Efficiency */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
               className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-emerald-500 dark:bg-blue-500 p-8 flex flex-col justify-end relative overflow-hidden transition-colors duration-300"
             >
                <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full border-[1.5rem] border-emerald-400 dark:border-blue-400 border-t-white opacity-80" />
                <div className="bg-white rounded-full px-3 py-1 w-fit mb-2 z-10 shadow-sm">
                   <span className="text-emerald-600 dark:text-blue-600 text-xs font-bold">-60%</span>
                </div>
                <h3 className="text-white text-sm opacity-80">Cost Reduction</h3>
                <p className="text-white text-2xl font-bold">High</p>
             </motion.div>
          </div>
        </section>

        {/* SECURITY SECTION (Merged as Bento Grid) */}
        <section className="bg-zinc-50 dark:bg-black/50 py-24 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Uncompromising Security</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Defense-in-depth strategies to ensure your financial information remains protected.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              
              {/* Card 1: Encryption (Purple) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-purple-600 p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500"
              >
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 
                 <div className="relative z-10 flex justify-between items-start text-white/80">
                   <span className="font-medium tracking-wide">Security Layer 01</span>
                   <ArrowRight className="h-6 w-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                 </div>
                 
                 <h3 className="relative z-10 text-4xl font-bold text-white tracking-tight mt-auto">
                    AES-256<br/>Encryption
                 </h3>
              </motion.div>

              {/* Card 2: Compliance (Rose - Wide) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-rose-600 p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500"
              >
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                 <div className="absolute top-1/2 right-0 w-96 h-96 bg-rose-400 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 
                 <div className="relative z-10 flex justify-between items-start text-white/80">
                   <span className="font-medium tracking-wide">Security Layer 02</span>
                   <ArrowRight className="h-6 w-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                 </div>
                 
                 <div className="relative z-10 mt-auto flex items-end justify-between">
                    <h3 className="text-5xl font-bold text-white tracking-tight">
                        SOC2 & <span className="opacity-50">GDPR</span>
                    </h3>
                    <Shield className="h-16 w-16 text-white/20" />
                 </div>
              </motion.div>

              {/* Card 3: Privacy (Cyan - Tall via Row Span if needed, using standard here for balance) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-cyan-600 p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500"
              >
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 
                 <div className="relative z-10 flex justify-between items-start text-white/80">
                   <span className="font-medium tracking-wide">Security Layer 03</span>
                   <ArrowRight className="h-6 w-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                 </div>
                 
                 <h3 className="relative z-10 text-4xl font-bold text-white tracking-tight mt-auto">
                    Zero-Trust <br/>Architecture
                 </h3>
              </motion.div>

              {/* Card 4: Audits (Amber) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-amber-500 p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500"
              >
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                 <div className="absolute top-0 right-0 w-48 h-48 bg-amber-300 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 
                 <div className="relative z-10 flex justify-between items-start text-white/80">
                   <span className="font-medium tracking-wide">Security Layer 04</span>
                   <ArrowRight className="h-6 w-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                 </div>
                 
                 <h3 className="relative z-10 text-4xl font-bold text-white tracking-tight mt-auto">
                    Continuous<br/>Auditing
                 </h3>
              </motion.div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-600 dark:bg-blue-600 py-16 rounded-3xl text-center relative overflow-hidden transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative z-10 space-y-6 text-white">
              <h2 className="text-3xl font-bold">Ready to Transform Your Lending Process?</h2>
              <p className="text-emerald-100 dark:text-blue-100 max-w-xl mx-auto text-lg">
                Join thousands of users who have streamlined their loan applications with Project Orion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button onClick={() => navigate("/standard")} className="gap-2 h-12 px-8 text-lg bg-white text-emerald-700 dark:text-blue-700 hover:bg-white/90 shadow-lg border-0">
                  <FileText className="h-5 w-5" />
                  Standard Mode
                </Button>
                <Button onClick={() => navigate("/agentic")} variant="outline" className="gap-2 h-12 px-8 text-lg border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <Brain className="h-5 w-5" />
                  Agentic AI Mode
                </Button>
              </div>

              <div className="pt-8 border-t border-white/20 mt-12 max-w-2xl mx-auto">
                 <p className="font-medium mb-4 opacity-90">Have questions? Contact us directly:</p>
                 <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-sm">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                       <Mail className="h-4 w-4" />
                       <span>dubeyananay@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                       <span className="font-bold">WhatsApp:</span> 9580711960
                    </div>
                 </div>
              </div>

            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
