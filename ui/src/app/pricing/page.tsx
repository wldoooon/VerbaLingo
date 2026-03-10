"use client"

import React from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { AuthDialog } from '@/components/auth-dialog';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ShinyText from '@/components/ShinyText';
import { Carter_One, Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400']
})

const caveatFont = Carter_One({
  subsets: ['latin'],
  weight: ['400']
});

// ─── Pricing Data ────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "price_free_starter",
    name: "FREE STARTER",
    price: 0,
    interval: null,
    isPopular: false,
    aiCredits: "50,000",
    searches: "100",
    description: "Get started with language learning. Explore the app and enjoy free AI-powered word lookups.",
    features: [
      "50,000 AI Sparks",
      "100 searches / month",
      "Transcript highlighting",
      "Word lookup & context",
      "Basic AI explanations",
    ],
    gumroadLink: null,
    cta: "Get Started Free",
  },
  {
    id: "price_basic_learner",
    name: "BASIC LEARNER",
    price: 4.99,
    interval: "month",
    isPopular: false,
    aiCredits: "800,000",
    searches: "500",
    description: "Great for regular learners who want more AI power and daily practice.",
    features: [
      "Everything in Free, plus:",
      "800,000 AI Sparks / month",
      "500 searches / month",
      "Priority support",
      "Advanced AI explanations",
    ],
    gumroadLink: "https://gumroad.com/l/your-basic-link",
    cta: "Get Started",
  },
  {
    id: "price_pro_student",
    name: "PRO STUDENT",
    price: 8.99,
    interval: "month",
    isPopular: true,
    aiCredits: "5,000,000",
    searches: "2,000",
    description: "The sweet spot for serious language students who want unlimited AI power and deep immersion.",
    features: [
      "Everything in Basic, plus:",
      "5,000,000 AI Sparks / month",
      "2,000 searches / month",
      "Early access to new features",
      "Advanced usage analytics",
      "Priority support",
    ],
    gumroadLink: "https://gumroad.com/l/your-pro-link",
    cta: "Get Started",
  },
  {
    id: "price_scholar_max",
    name: "SCHOLAR MAX",
    price: 14.99,
    interval: "month",
    isPopular: false,
    aiCredits: "15,000,000",
    searches: "∞",
    description: "For dedicated power learners with unlimited search and massive AI credit budget.",
    features: [
      "Everything in Pro, plus:",
      "15,000,000 AI Sparks / month",
      "Unlimited searches",
      "Bulk export",
      "Priority support",
    ],
    gumroadLink: "https://gumroad.com/l/your-scholar-link",
    cta: "Get Started",
  },
  {
    id: "price_vip_unlimited",
    name: "VIP UNLIMITED",
    price: 18.99,
    interval: "month",
    isPopular: false,
    aiCredits: "∞",
    searches: "∞",
    description: "No limits. The ultimate language immersion experience with founding member perks.",
    features: [
      "Everything in Scholar, plus:",
      "∞ AI Sparks / month",
      "Unlimited searches",
      "Dedicated support channel",
      "Founding member badge",
    ],
    gumroadLink: "https://gumroad.com/l/your-vip-link",
    cta: "Get Started",
  },
];

function PricingCard({
  tier,
  index,
  authStatus,
}: {
  tier: typeof TIERS[0];
  index: number;
  authStatus: string;
}) {
  const isPopular = tier.isPopular;

  const handleCta = () => {
    if (tier.gumroadLink) {
      window.open(tier.gumroadLink, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={cn(
        "relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700/60 shadow-md px-7 py-8 transition-all duration-300",
        isPopular
          ? "shadow-2xl shadow-orange-200/40 dark:shadow-orange-900/20 border-orange-200 dark:border-orange-800/40 -mt-6 pb-14 pt-10"
          : "hover:shadow-lg hover:-translate-y-1"
      )}
    >
      {/* Most Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 right-15 translate-x-1/2 bg-background px-4 py-1.5 rounded-full shadow-md border border-border whitespace-nowrap z-10">
          <ShinyText
            text="Recommended"
            speed={3}
            delay={0}
            color="#71717a"
            shineColor="#ffffffff"
            spread={120}
            direction="left"
            className="text-[11px] font-black uppercase tracking-widest inline-block"
          />
        </div>
      )}

      {/* Plan name */}
      <p className={cn(
        "text-orange-500 font-medium text-3xl mb-4 text-center capitalize mt-4 tracking-normal",
        caveat.className
      )}>
        {tier.name.toLowerCase()}
      </p>

      {/* Price */}
      <div className="flex items-start justify-center mb-1">
        <span className="text-3xl font-black text-foreground mt-2 mr-0.5">$</span>
        <span className="text-7xl font-black text-foreground leading-none tracking-tighter">
          {tier.price === 0 ? "0" : tier.price}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-8 text-center font-medium">
        {tier.price === 0 ? "free forever" : "per user per month"}
      </p>

      {/* CTA Button */}
      {!tier.gumroadLink ? (
        authStatus === "guest" ? (
          <AuthDialog defaultTab="signup">
            <button className="w-full py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer mb-7">
              {tier.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </AuthDialog>
        ) : (
          <button disabled className="w-full py-3 px-6 rounded-xl bg-muted text-muted-foreground font-bold text-sm mb-7 cursor-default">
            Current Plan
          </button>
        )
      ) : (
        <button
          onClick={handleCta}
          className={cn(
            "w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer mb-7",
            isPopular
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          )}
        >
          {tier.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}


      {/* Divider */}
      <div className="h-px w-full bg-slate-100 dark:bg-zinc-800 mb-5" />

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {tier.features.map((f, fi) => (
          <li
            key={f}
            className={cn(
              "flex items-start gap-3 text-sm",
              fi === 0 && f.includes("plus")
                ? "font-black text-foreground"
                : "text-foreground/80 font-medium"
            )}
          >
            {fi === 0 && f.includes("plus") ? null : (
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
              </span>
            )}
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function PricingPage() {
  const authStatus = useAuthStore((s) => s.status);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-12 pb-32">

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-orange-500 font-black uppercase tracking-[0.25em] text-xs mb-4"
        >
          Membership
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tighter"
        >
          <span className={caveatFont.className}>Fuel your language journey.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          Simple pricing. No hidden fees. Payments via{" "}
          <strong className="text-foreground">Gumroad</strong>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-muted border border-border text-xs text-muted-foreground"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          Secure checkout via <span className="font-bold text-foreground ml-1">Gumroad</span>
        </motion.div>
      </div>

      {/* ── Pricing Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {TIERS.map((tier, i) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            index={i}
            authStatus={authStatus}
          />
        ))}
      </div>

      {/* ── Trust Footer ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mt-20 pt-10 border-t border-border grid md:grid-cols-3 gap-8 text-center"
      >
        <div>
          <h4 className="text-foreground font-bold mb-2">Secure Payments</h4>
          <p className="text-muted-foreground text-sm">All transactions handled securely by Gumroad.</p>
        </div>
        <div>
          <h4 className="text-foreground font-bold mb-2">Cancel Anytime</h4>
          <p className="text-muted-foreground text-sm">No lock-in. Stop your plan whenever you want.</p>
        </div>
        <div>
          <h4 className="text-foreground font-bold mb-2">Sparks Reset Monthly</h4>
          <p className="text-muted-foreground text-sm">Your AI credits refresh automatically each billing cycle.</p>
        </div>
      </motion.div>
    </div>
  );
}
