"use client"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const mainLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQs", href: "/#faq" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Changelog", href: "#" },
]

const legalLinks = [
  { label: "Terms of service", href: "#" },
  { label: "Privacy policy", href: "#" },
  { label: "Copyright policy", href: "#" },
  { label: "Cookie policy", href: "#" },
  { label: "Cookie preferences", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

        {/* Main nav links */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 pt-16 pb-8">
          {mainLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pb-12">
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Separator className="bg-border/40" />

        {/* Bottom: Copyright + icons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-10">
          <p className="text-sm text-muted-foreground tracking-wide">
            &copy; {new Date().getFullYear()} VerbaLingo. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {/* Flag / locale placeholder */}
            <span className="text-xl" aria-label="Language">🇺🇸</span>

            {/* Twitter / X */}
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
