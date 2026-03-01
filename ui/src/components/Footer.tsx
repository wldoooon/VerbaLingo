"use client"

import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Heart, Github, Twitter, Linkedin, Globe } from "lucide-react"
import { useState } from "react"

const mainLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQs", href: "/#faq" },
  { label: "Changelog", href: "/changelog" },
]

const legalLinks = [
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

        {/* Top left: Logo + domain */}
        <div className="flex justify-start pt-8 pb-2">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image src="/main_logo.png" alt="PokiSpokey" width={52} height={52} />
            <span className="text-2xl font-black text-muted-foreground group-hover:text-foreground transition-colors">
              pokispokey.com
            </span>
          </Link>
        </div>

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
          <div className="flex items-center gap-3">
            <Image src="/main_logo.png" alt="PokiSpokey Logo" width={24} height={24} />
            <p className="text-sm text-muted-foreground tracking-wide">
              &copy; {new Date().getFullYear()} PokiSpokey. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* Made with love */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 animate-pulse" />
              <span>by</span>
              <div className="relative group/card">
                <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  @wldooon
                </span>
                {/* Hover card */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 opacity-0 scale-95 pointer-events-none group-hover/card:opacity-100 group-hover/card:scale-100 group-hover/card:pointer-events-auto transition-all duration-200 ease-out z-50">
                  <div className="rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-6">
                    {/* Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card/95 border-r border-b border-border/60" />

                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                        <span className="text-xl font-black text-primary">W</span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base">Walid</p>
                        <p className="text-sm text-muted-foreground">@wldooon</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Solo developer & creator of PokiSpokey. Passionate about languages, AI, and building tools that make learning fun.
                    </p>

                    <div className="flex items-center gap-2.5">
                      <Link href="https://github.com/wldoooon" target="_blank" className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Github className="h-4 w-4" />
                      </Link>
                      <Link href="https://x.com/wldooon" target="_blank" className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Twitter className="h-4 w-4" />
                      </Link>
                      <Link href="https://linkedin.com/in/wldooon" target="_blank" className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator dot */}
            <span className="text-muted-foreground/40">·</span>

            {/* Flag / locale placeholder */}
            <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-border/50 flex-shrink-0 cursor-pointer" aria-label="English">
              <img
                src="https://flagcdn.com/gb.svg"
                alt="English"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

