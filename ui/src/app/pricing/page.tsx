"use client"

import React, { useState } from 'react';
import { Check, Zap, Star, Shield, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

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
        
        {/* Toggle */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-muted rounded-full p-1 relative transition-colors hover:bg-muted/80"
          >
            <div className={`w-6 h-6 bg-foreground rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly <span className="text-xs text-green-500 ml-1 font-bold">-20%</span>
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Starter Plan */}
        <div className="group relative bg-card border border-border rounded-3xl p-6 md:p-8 transition-all hover:bg-card/80 hover:border-border/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Starter</h3>
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
               <button className="w-full py-3 px-6 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl border border-border transition-colors flex items-center justify-center group-hover:border-border/80">
                  Current Plan
               </button>
               <div className="text-xs text-muted-foreground text-center">
                  Includes 50 searches/mo
               </div>
            </div>
          </div>
        </div>

        {/* Pro Plan - Highlighted */}
        <div className="relative bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/20 transform transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-background text-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-border">
             Most Popular
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-foreground/10 rounded-lg text-primary-foreground">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-xl font-bold text-primary-foreground">Pro Learner</h3>
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
                    <span>AI Pronunciation Coach</span>
                 </div>
                  <div className="flex items-center text-sm font-medium text-primary-foreground">
                    <Check className="w-4 h-4 mr-2" />
                    <span>Save Unlimited Clips</span>
                 </div>
              </div>
            </div>
            
            <div className="md:w-1/3 flex flex-col justify-center">
               <div className="flex items-baseline mb-1">
                 <span className="text-5xl font-bold text-primary-foreground tracking-tight">
                    ${isAnnual ? '9' : '12'}
                 </span>
                 <span className="text-primary-foreground/70 font-medium ml-1">/ month</span>
               </div>
               <div className="text-xs text-primary-foreground/60 font-medium">
                  {isAnnual ? 'Billed $108 yearly' : 'Billed monthly'}
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
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-muted rounded-lg text-foreground">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Lifetime</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4 md:mb-0">Pay once, own it forever.</p>
            </div>
            
            <div className="md:w-1/3 flex flex-col justify-center">
               <div className="flex items-baseline mb-1">
                 <span className="text-3xl font-bold text-foreground">$199</span>
                 <span className="text-muted-foreground ml-1">/ one-time</span>
               </div>
               <div className="text-xs text-muted-foreground">Lifetime access to all Pro features</div>
            </div>

            <div className="md:w-1/3 flex flex-col gap-3">
               <button className="w-full py-3 px-6 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl border border-border transition-colors flex items-center justify-center group-hover:border-primary/50">
                  Buy Lifetime Access
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
              <p className="text-muted-foreground text-sm">30-day guarantee on Lifetime.</p>
          </div>
      </div>
    </div>
  );
}
