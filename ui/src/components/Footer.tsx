"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ShinyText from "./ShinyText"
import AnimatedContent from "./AnimatedContent"

const footerLinks = {
  product: [
    { label: "Context Engine", href: "#" },
    { label: "AI Companion", href: "#" },
    { label: "Pricing Plans", href: "/pricing" },
    { label: "Browser Extension", href: "#" },
  ],
  resources: [
    { label: "Learning Blog", href: "#" },
    { label: "Video Corpus", href: "#" },
    { label: "API Documentation", href: "#" },
    { label: "Community", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Our Mission", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Careers", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

        {/* Top: Brand + CTA */}
        <AnimatedContent distance={30} direction="vertical" duration={0.8} threshold={0.2}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 py-16">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                <ShinyText
                  text="VerbaLingo"
                  speed={3}
                  delay={0}
                  color="#4b5563"
                  shineColor="#ffffff"
                  spread={100}
                  direction="left"
                  className="inline-block"
                />
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                The context-first engine for mastering native fluency.
              </p>
            </div>

         </div>
        </AnimatedContent>

        <Separator className="bg-border/40" />

        {/* Navigation Grid */}
        <AnimatedContent distance={30} direction="vertical" delay={0.1} duration={0.8} threshold={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 py-14">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AnimatedContent>

        <Separator className="bg-border/40" />

        {/* Bottom: Social + Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-8">
          <div className="flex items-center gap-5">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.02-1.04-.032-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground tracking-wide">
            &copy; {new Date().getFullYear()} VerbaLingo Lab. Handcrafted for Mastery.
          </p>
        </div>
      </div>
    </footer>
  )
}
