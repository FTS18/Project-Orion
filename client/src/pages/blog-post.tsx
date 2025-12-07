import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect } from "react";
import { BLOG_POSTS } from "@/data/blog-posts";

export default function BlogPostPage() {
  const [match, params] = useRoute("/blog/:id");
  const [, navigate] = useLocation();
  const postId = params?.id ? parseInt(params.id) : 0;
  const post = BLOG_POSTS[postId as keyof typeof BLOG_POSTS];

  const totalPosts = Object.keys(BLOG_POSTS).length;
  const prevId = postId > 1 ? postId - 1 : null;
  const nextId = postId < totalPosts ? postId + 1 : null;

  // Calculate read time
  const wordCount = post?.content?.replace(/<[^>]*>?/gm, '').split(/\s+/).length || 0;
  const readTime = `${Math.ceil(wordCount / 200)} min read`;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!post) {
      // Redirect or show 404 handled by generic not found, 
      // but for now let's just stay here or show error
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <main className="flex-1 pt-32 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4">
          {/* Breadcrumb / Back */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="pl-0 gap-2 hover:bg-transparent hover:text-emerald-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => navigate("/blog")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </div>

          {/* Header */}
          <header className="mb-10">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary" className="bg-emerald-100 dark:bg-blue-900/30 text-emerald-700 dark:text-blue-300 hover:bg-emerald-100">
                {post.category}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-8">
               <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                 </div>
                 <span className="font-medium text-foreground">{post.author}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <Calendar className="h-4 w-4" />
                 {post.date}
               </div>
               <div className="flex items-center gap-1.5">
                 <Clock className="h-4 w-4" />
                 {readTime}
               </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-border/50">
            <img 
              src={post.image} 
              alt={post.title} 
              loading="lazy"
              className="w-full h-auto md:h-[400px] object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Content */}
          <div 
            className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-6 prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Navigation Buttons for Next/Prev Blog */}
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8">
             {prevId ? (
                <Button variant="outline" onClick={() => navigate(`/blog/${prevId}`)} className="gap-2">
                   <ArrowLeft className="h-4 w-4" /> Previous Post
                </Button>
             ) : <div />} {/* Empty div to keep alignment if no prev */}
             
             {nextId ? (
                <Button variant="outline" onClick={() => navigate(`/blog/${nextId}`)} className="gap-2">
                   Next Post <ChevronRight className="h-4 w-4" />
                </Button>
             ) : <div />}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border text-center">
             <h3 className="text-xl font-bold mb-2">Build with Orion</h3>
             <p className="text-muted-foreground mb-6">Ready to implement these concepts? Start your journey today.</p>
             <div className="flex justify-center gap-4">
               <Button onClick={() => navigate("/audio")}>Get Started</Button>
               <Button variant="outline" onClick={() => navigate("/contact")}>Contact Sales</Button>
             </div>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
