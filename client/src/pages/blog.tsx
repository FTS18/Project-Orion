import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";

import { BLOG_POSTS } from "@/data/blog-posts";
import { useLocation } from "wouter";

export default function BlogPage() {
  const [, navigate] = useLocation();

  const posts = Object.values(BLOG_POSTS);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Blog</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Latest from Orion</h1>
            <p className="text-muted-foreground text-lg">Insights, updates, and engineering deep dives.</p>
          </div>

          <div className="grid gap-8">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="group cursor-pointer hover:border-emerald-500/50 dark:hover:border-blue-500/50 transition-all hover:bg-muted/50"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="text-primary font-medium">{post.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center text-primary font-medium text-sm">
                    Read Article <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
