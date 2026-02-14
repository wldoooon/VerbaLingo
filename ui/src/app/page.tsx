"use client";

import { Hero } from "@/components/Hero";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { TooltipProvider } from "@/components/animate-ui/components/radix/tooltip";

export default function LandingPage() {
  return (
    <TooltipProvider delayDuration={200}>
      {/* Hero Section */}
      <Hero />

      {/* FAQ Section */}
      <Faq />

      {/* Footer */}
      <Footer />
    </TooltipProvider>
  );
}
