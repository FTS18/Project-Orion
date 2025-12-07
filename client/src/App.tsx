import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { InitialLoader } from "@/components/initial-loader";
import { PageTransition } from "@/components/page-transition";
import { ScrollToTop } from "@/components/scroll-to-top";

import LandingPage from "@/pages/landing";
import StandardModePage from "@/pages/standard-mode";
import AgenticModePage from "@/pages/agentic-mode";
import FeaturesPage from "@/pages/features";
import DocsPage from "@/pages/docs";
import SecurityPage from "@/pages/security";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import ContactPage from "@/pages/contact";
import CookiesPage from "@/pages/cookies";
import NotFound from "@/pages/not-found";

import AdminDashboard from "@/pages/admin-dashboard";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import AuthCallbackPage from "@/pages/auth/callback";
import OnboardingPage from "@/pages/auth/onboarding";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <PageTransition>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/standard" component={StandardModePage} />
        <Route path="/agentic" component={AgenticModePage} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <Route path="/features" component={FeaturesPage} />
        <Route path="/docs" component={DocsPage} />
        <Route path="/security" component={SecurityPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/cookies" component={CookiesPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/signup" component={SignupPage} />
        <Route path="/auth/callback" component={AuthCallbackPage} />
        <Route path="/auth/onboarding" component={OnboardingPage} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

import { GrainyBackground } from "@/components/ui/grainy-background";

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Only show loader on very first page load
    const hasLoadedBefore = sessionStorage.getItem('app-loaded');
    
    if (hasLoadedBefore) {
      setIsInitialLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
        sessionStorage.setItem('app-loaded', 'true');
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="loan-assistant-theme">
      <GrainyBackground />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AnimatePresence mode="wait">
            {isInitialLoading ? (
              <InitialLoader key="loader" />
            ) : (
              <Router key="app" />
            )}
          </AnimatePresence>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
