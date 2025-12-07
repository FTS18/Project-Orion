import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Github, Twitter, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Join the Community</h1>
           <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
             Connect with other developers, share your Orion workflows, and contribute to the future of open finance.
           </p>

           <div className="grid md:grid-cols-2 gap-6">
              <Card className="text-left bg-zinc-900 border-zinc-800 text-zinc-100">
                 <CardHeader>
                    <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                       <MessageSquare className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Discord Server</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-zinc-400 mb-6">Chat with the core team, get styling help, and show off your projects.</p>
                    <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4]">Join Discord</Button>
                 </CardContent>
              </Card>

              <Card className="text-left bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                 <CardHeader>
                    <div className="h-12 w-12 bg-black/5 dark:bg-white/10 rounded-lg flex items-center justify-center mb-4">
                       <Github className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">GitHub Discussions</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground mb-6">Report bugs, request features, and contribute to the codebase.</p>
                    <Button variant="outline" className="w-full" onClick={() => window.open("https://github.com/FTS18/Project-Orion", "_blank")}>View Repository</Button>
                 </CardContent>
              </Card>
           </div>
           
           <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
              <div className="flex flex-col items-center">
                 <Heart className="h-12 w-12 text-pink-500 mb-4 animate-pulse" />
                 <h2 className="text-2xl font-bold mb-2">Open Source & Proud</h2>
                 <p className="text-muted-foreground mb-6">We believe in building in public.</p>
                 <div className="flex gap-4">
                    <Button variant="ghost" className="gap-2"><Twitter className="h-4 w-4" /> Follow updates</Button>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
