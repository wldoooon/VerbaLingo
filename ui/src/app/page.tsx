"use client";

import { Hero } from "@/components/Hero";
import { Faq } from "@/components/Faq";
import Link from "next/link";
import { TooltipProvider } from "@/components/animate-ui/components/radix/tooltip";

export default function LandingPage() {
  return (
    <TooltipProvider delayDuration={200}>
      {/* Hero Section */}
      <Hero />

      {/* FAQ Section */}
      <Faq />

      {/* Modern High-End Footer - Static Version */}
      <footer className="bg-transparent border-t border-slate-100 dark:border-zinc-900/50 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          
          {/* Top Level: Brand & CTA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">
                VerbaLin<span className="text-primary">go</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed">
                The context-first engine for mastering native fluency.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
              <button className="h-12 px-8 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg active:scale-95">
                Join the Mission
              </button>
            </div>
          </div>

          {/* Middle Level: Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 pt-12 border-t border-slate-50 dark:border-zinc-900/50">
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                <li><Link href="#" className="hover:text-primary transition-colors">Context Engine</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">AI Companion</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing Plans</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Browser Extension</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                <li><Link href="#" className="hover:text-primary transition-colors">Learning Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Video Corpus</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">API Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Our Mission</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Level: Social & Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-slate-50 dark:border-zinc-900/50">
            <div className="flex items-center gap-6">
              <Link href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.02-1.04-.032-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </Link>
            </div>
            
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              © {new Date().getFullYear()} VerbaLingo Lab. Handcrafted for Mastery.
            </p>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
