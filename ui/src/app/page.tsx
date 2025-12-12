"use client";

import { Hero } from "@/components/Hero";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl bg-primary px-6 py-16 sm:px-16 sm:py-24 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight">
                Ready to speak naturally?
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                Join thousands of learners who are mastering English through the power of context. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="h-12 px-8 rounded-full bg-background text-foreground font-semibold hover:bg-background/90 transition-colors shadow-lg">
                  Get Started for Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/5 mt-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                VerbaLingo
              </span>
              <p className="mt-4 text-sm text-muted-foreground">
                The context-first English learning platform powered by real-world video content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">For Teachers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Community</Link></li>
                <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} VerbaLingo. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

