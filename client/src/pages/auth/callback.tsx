import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error);
        navigate("/auth/login");
        return;
      }

      if (session?.user) {
        // Check if user has completed onboarding
        const metadata = session.user.user_metadata;
        const hasOnboarded = metadata?.onboarding_complete === true;
        
        if (hasOnboarded) {
          // Redirect to home, not admin
          navigate("/");
        } else {
          navigate("/auth/onboarding");
        }
      } else {
        navigate("/auth/login");
      }
    };

    // Small delay to let Supabase process the hash
    const timer = setTimeout(handleAuthCallback, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
