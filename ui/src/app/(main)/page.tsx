"use client";

import { Hero } from "@/components/Hero";
import { Faq } from "@/components/Faq";
import { ContactFormSection } from "@/components/uitripled/contact-form-section-shadcnui";
import { TooltipProvider } from "@/components/animate-ui/components/radix/tooltip";

export default function LandingPage() {
  return (
    <TooltipProvider delayDuration={200}>
      {/* Hero Section */}
      <Hero />

      {/* FAQ Section */}
      <Faq />

      {/* Contact Section */}
      <ContactFormSection />
    </TooltipProvider>
  );
}
