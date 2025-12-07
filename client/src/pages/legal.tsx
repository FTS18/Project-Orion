import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LegalPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/terms");
  }, [navigate]);

  return <div className="min-h-screen bg-background" />;
}
