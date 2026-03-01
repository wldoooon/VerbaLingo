"use client"

import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { AuthDialog } from '@/components/auth-dialog';
import ShinyText from '@/components/ShinyText';

export default function PricingPage() {
  const authStatus = useAuthStore((s) => s.status);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in pb-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-muted-foreground font-medium uppercase tracking-widest text-xs mb-4">Membership</h2>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tighter">
          Unlock the full potential.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Simple pricing. No hidden fees. Cancel anytime.
        </p>
      </div>

      <div className="space-y-6">
        {/* Starter Plan */}
        <div className="group relative bg-card border border-border rounded-3xl p-6 md:p-8 transition-all hover:bg-card/80 hover:border-border/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-bold text-foreground">Basic</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4 md:mb-0">Essential tools for casual learners.</p>
            </div>

            <div className="md:w-1/3 flex flex-col justify-center">
              <div className="flex items-baseline mb-1">
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground ml-1">/ forever</span>
              </div>
              <div className="text-xs text-muted-foreground">No credit card required</div>
            </div>

            <div className="md:w-1/3 flex flex-col gap-3">
              {authStatus === 'guest' ? (
                <div className="w-full">
                  <AuthDialog defaultTab="signup">
                    <div className="w-full py-3 px-6 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl border border-border transition-colors flex items-center justify-center group-hover:border-border/80 cursor-pointer">
                      Sign up for free
                    </div>
                  </AuthDialog>
                </div>
              ) : (
                <button className="w-full py-3 px-6 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl border border-border transition-colors flex items-center justify-center group-hover:border-border/80">
                  Current Plan
                </button>
              )}
              <div className="text-xs text-muted-foreground text-center">
                Includes 50 searches/mo
              </div>
            </div>
          </div>
        </div>

        {/* Pro Plan - Highlighted */}
        <div className="relative bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/20 transform transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-background px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-border">
            <ShinyText
              text="Recommended"
              speed={3}
              delay={0}
              color="#71717a"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              className="inline-block"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-bold text-primary-foreground">Pro</h3>
              </div>
              <p className="text-primary-foreground/70 text-sm mb-4 md:mb-0">Unlimited access & advanced AI tools.</p>

              {/* Feature List for Pro */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm font-medium text-primary-foreground">
                  <Check className="w-4 h-4 mr-2" />
                  <span>Unlimited Context Searches</span>
                </div>
                <div className="flex items-center text-sm font-medium text-primary-foreground">
                  <Check className="w-4 h-4 mr-2" />
                  <span>2000 AI Chat Credit</span>
                </div>
              </div>
            </div>

            <div className="md:w-1/3 flex flex-col justify-center">
              <div className="flex items-baseline mb-1">
                <span className="text-5xl font-bold text-primary-foreground tracking-tight">
                  $7.99
                </span>
                <span className="text-primary-foreground/70 font-medium ml-1">/ month</span>
              </div>
              <div className="text-xs text-primary-foreground/60 font-medium">
                Billed monthly
              </div>
            </div>

            <div className="md:w-1/3 flex flex-col gap-3">
              <button className="w-full py-4 px-6 bg-background text-foreground font-bold rounded-xl hover:bg-background/90 transition-all shadow-lg flex items-center justify-center gap-2 group">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-xs text-primary-foreground/60 text-center font-medium">
                14-day free trial, cancel anytime
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Plan */}
        <div className="group relative bg-card border border-border rounded-3xl p-6 md:p-8 transition-all hover:border-primary/50 overflow-hidden">
          {/* Grid Pattern in background of card */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:14px_14px] rounded-3xl pointer-events-none opacity-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-bold text-foreground">Advanced</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4 md:mb-0">For power users who need zero limits.</p>
            </div>

            <div className="md:w-1/3 flex flex-col justify-center">
              <div className="flex items-baseline mb-1">
                <span className="text-3xl font-bold text-foreground">$14.99</span>
                <span className="text-muted-foreground ml-1">/ month</span>
              </div>
              <div className="text-xs text-muted-foreground">Unlimited searching, chatting, and clips</div>
            </div>

            <div className="md:w-1/3 flex flex-col gap-3">
              <button className="w-full py-3 px-6 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl border border-border transition-colors flex items-center justify-center group-hover:border-primary/50 cursor-pointer">
                Upgrade to Advanced
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ or Trust Section */}
      <div className="mt-20 pt-10 border-t border-border grid md:grid-cols-3 gap-8 text-center">
        <div>
          <h4 className="text-foreground font-bold mb-2">Secure Payment</h4>
          <p className="text-muted-foreground text-sm">Encrypted transactions via Stripe.</p>
        </div>
        <div>
          <h4 className="text-foreground font-bold mb-2">Cancel Anytime</h4>
          <p className="text-muted-foreground text-sm">No lock-in contracts.</p>
        </div>
        <div>
          <h4 className="text-foreground font-bold mb-2">Money Back</h4>
          <p className="text-muted-foreground text-sm">30-day guarantee on Advanced.</p>
        </div>
      </div>
    </div>
  );
}
