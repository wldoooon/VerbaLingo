"use client"

import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { AuthDialog } from '@/components/auth-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ShinyText from '@/components/ShinyText';
import { Carter_One, Caveat, Comfortaa } from 'next/font/google';
import { BetaDialog } from '@/components/beta-dialog';
import { Tabs, Tab } from '@heroui/tabs';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400']
})

const caveatFont = Carter_One({
  subsets: ['latin'],
  weight: ['400']
})

const comfortaaFont = Comfortaa({
  subsets: ['latin'],
  weight: ['700']
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
    annualPrice: 49.90,   // 10 months (2 months free)
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
    annualPrice: 89.90,   // 10 months (2 months free)
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
    annualPrice: 149.90,  // 10 months (2 months free)
    interval: "month",
    isPopular: false,
    aiCredits: "15,000,000",
    searches: "∞",
    description: "For dedicated power learners with unlimited search and massive AI credit budget.",
    features: [
      "Everything in Pro, plus:",
      "15,000,000 AI Sparks / month",
      "Unlimited searches",
      "Priority support",
    ],
    gumroadLink: "https://gumroad.com/l/your-scholar-link",
    cta: "Get Started",
  },
  {
    id: "price_vip_unlimited",
    name: "VIP UNLIMITED",
    price: 18.99,
    annualPrice: 189.90,  // 10 months (2 months free)
    interval: "month",
    isPopular: false,
    aiCredits: "∞",
    searches: "∞",
    description: "No limits. The ultimate language immersion experience with founding member perks.",
    features: [
      "Everything in Scholar, plus:",
      "Unlimited AI Sparks / month",
      "Unlimited searches",
      "Dedicated support channel",
      "Founding member badge",
    ],
    gumroadLink: "https://gumroad.com/l/your-vip-link",
    cta: "Get Started",
  },
];

const COMPARE_FEATURES = [
  {
    category: "Core Usage",
    features: [
      { name: "AI Sparks per month", values: ["50K", "800K", "5M", "15M", "Unlimited"] },
      { name: "Searches per month", values: ["100", "500", "2,000", "Unlimited", "Unlimited"] },
    ]
  },
  {
    category: "Learning Tools",
    features: [
      { name: "Transcript highlighting", values: [true, true, true, true, true] },
      { name: "Word lookup & context", values: [true, true, true, true, true] },
      { name: "AI explanations", values: ["Basic", "Advanced", "Advanced", "Advanced", "Advanced"] },
    ]
  },
  {
    category: "Power Features",
    features: [
      { name: "Advanced usage analytics", values: [false, false, true, true, true] },
      { name: "Early access to new features", values: [false, false, true, true, true] },
    ]
  },
  {
    category: "Support & Perks",
    features: [
      { name: "Support level", values: ["Community", "Priority", "Priority", "Priority", "Dedicated"] },
      { name: "Founding member badge", values: [false, false, false, false, true] },
    ]
  }
];

// Helper: extract a leading number/symbol and wrap it with ShinyText
function renderFeatureText(text: string) {
  // Match a leading number (with commas/dots) OR the word "Unlimited" at the start
  const match = text.match(/^([\.\d,\u221e]+|Unlimited)(\s.+)?$/);
  if (match && match[1]) {
    const numPart = match[1];
    const rest = match[2] || '';
    return (
      <span className="inline">
        <ShinyText
          text={numPart}
          speed={3}
          delay={0}
          color="#585858ff"
          shineColor="#ffffffff"
          spread={80}
          direction="left"
          className={cn("inline font-extrabold")}
        />
        {rest}
      </span>
    );
  }
  return text;
}

function PricingCard({
  tier,
  index,
  authStatus,
  billing,
  onPaidCtaClick,
}: {
  tier: typeof TIERS[0];
  index: number;
  authStatus: string;
  billing: "monthly" | "annually";
  onPaidCtaClick: () => void;
}) {
  const isPopular = tier.isPopular;
  const isAnnual = billing === "annually" && tier.price > 0;
  const annualMonthly = tier.annualPrice ? +(tier.annualPrice / 12).toFixed(2) : null;
  const displayPrice = isAnnual && annualMonthly ? annualMonthly : tier.price;

  const handleCta = () => {
    if (tier.gumroadLink) {
      onPaidCtaClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700/60 shadow-md px-5 sm:px-7 py-8 transition-all duration-300",
        isPopular
          ? "shadow-2xl shadow-orange-200/40 dark:shadow-orange-900/20 border-orange-200 dark:border-orange-800/40 sm:-mt-6 pb-10 sm:pb-14 pt-8 sm:pt-10"
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

      {/* Header Box */}
      <div className="border border-slate-200 dark:border-zinc-700/60 rounded-2xl pt-5 pb-6 -mx-4 sm:-mx-5 mb-6 sm:mb-8 -mt-6">
        {/* Plan name */}
        <p className={cn(
          "text-black-500 font-medium text-3xl mb-4 text-center capitalize tracking-normal flex justify-center",
          caveat.className
        )}>
          {tier.name.toLowerCase()}
        </p>

        {/* Price */}
        <div className="flex items-start justify-center mb-1 overflow-hidden">
          <span className="text-3xl font-black text-foreground mt-2 mr-0.5">$</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={displayPrice}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="text-6xl sm:text-7xl font-black text-foreground leading-none tracking-tighter inline-block"
            >
              {displayPrice === 0 ? "0" : displayPrice}
            </motion.span>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={isAnnual ? "annual-label" : "monthly-label"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-sm text-muted-foreground text-center font-medium"
          >
            {tier.price === 0
              ? "free forever"
              : isAnnual
                ? `$${tier.annualPrice?.toFixed(2)} billed annually`
                : "per month"}
          </motion.p>
        </AnimatePresence>
      </div>

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
            {fi === 0 && f.includes("plus") ? f : renderFeatureText(f)}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function PricingPage() {
  const authStatus = useAuthStore((s) => s.status);
  const [betaDialogOpen, setBetaDialogOpen] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annually">("monthly");

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-24 sm:pb-32">

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-orange-500 font-black uppercase tracking-[0.25em] text-xs mb-4"
        >
          Membership
        </motion.p>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tighter"
        >
          <span className={caveatFont.className}>Fuel your language journey.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="text-base sm:text-lg text-muted-foreground leading-relaxed flex items-center justify-center gap-2 flex-wrap mb-8"
        >
          Simple pricing. No hidden fees. Payments via
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="-0.5 -0.5 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" height="20" width="20" className="text-foreground shrink-0">
              <path d="M7.5 14.337187499999999C3.7239375000000003 14.337187499999999 0.6628125 11.276062499999998 0.6628125 7.5 0.6628125 3.7239375000000003 3.7239375000000003 0.6628125 7.5 0.6628125c3.7760624999999997 0 6.837187500000001 3.061125 6.837187500000001 6.837187500000001 0 3.7760624999999997 -3.061125 6.837187500000001 -6.837187500000001 6.837187500000001Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
              <path d="M7.5 14.337187499999999c-1.5104375 0 -2.7348749999999997 -3.061125 -2.7348749999999997 -6.837187500000001C4.765125 3.7239375000000003 5.9895625 0.6628125 7.5 0.6628125c1.5103749999999998 0 2.7348749999999997 3.061125 2.7348749999999997 6.837187500000001 0 3.7760624999999997 -1.2245 6.837187500000001 -2.7348749999999997 6.837187500000001Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
              <path d="M5.4488125 13.653500000000001c-2.051125 -0.6837500000000001 -2.7348749999999997 -3.6845624999999997 -2.7348749999999997 -5.811625 0 -2.1270625 1.025625 -4.7860625 3.418625 -6.495375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
              <path d="M9.551187500000001 1.3464999999999998c2.051125 0.6837500000000001 2.7348749999999997 3.6846250000000005 2.7348749999999997 5.811625 0 2.1270625 -1.025625 4.7860625 -3.418625 6.495375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
            </svg>
            <span className={cn("text-foreground font-bold text-lg leading-none", comfortaaFont.className)}>
              polar
            </span>
          </span>
        </motion.p>

        {/* ── Billing Toggle ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          className="flex justify-center"
        >
          <Tabs
            selectedKey={billing}
            onSelectionChange={(key) => setBilling(key as "monthly" | "annually")}
            variant="bordered"
            radius="full"
            classNames={{
              base: "border border-border rounded-full p-1",
              tabList: "gap-1 bg-transparent p-0",
              tab: "px-5 py-2 text-sm font-semibold text-muted-foreground data-[selected=true]:text-foreground rounded-full",
              cursor: "bg-foreground rounded-full shadow-sm",
              tabContent: "group-data-[selected=true]:text-background font-semibold",
            }}
          >
            <Tab key="monthly" title="Monthly" />
            <Tab
              key="annually"
              title={
                <span className="flex items-center gap-2">
                  Annually
                  <span className="text-[10px] font-black uppercase tracking-wide bg-orange-500 text-white px-2 py-0.5 rounded-full leading-none">
                    2 months free
                  </span>
                </span>
              }
            />
          </Tabs>
        </motion.div>
      </div>

      {/* ── Pricing Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-5 max-w-[1400px] mx-auto">
        {TIERS.map((tier, i) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            index={i}
            authStatus={authStatus}
            billing={billing}
            onPaidCtaClick={() => setBetaDialogOpen(true)}
          />
        ))}
      </div>

      {/* ── Compare Table ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className="mt-20 sm:mt-36 max-w-7xl mx-auto"
      >
        <div className="text-center mb-10 sm:mb-16">
          <h2 className={cn("text-2xl sm:text-4xl md:text-5xl font-black text-foreground uppercase tracking-widest mb-6", caveatFont.className)}>
            COMPARE PLANS &amp; FEATURES
          </h2>
        </div>

        {/* ── MOBILE: Card layout (hidden on md+) ── */}
        <div className="block md:hidden space-y-8">
          {COMPARE_FEATURES.map((section) => (
            <div key={section.category}>
              {/* Category header */}
              <div className="bg-slate-100 dark:bg-zinc-800/80 rounded-xl px-4 py-3 font-black text-foreground text-sm uppercase tracking-wider mb-3">
                {section.category}
              </div>
              {section.features.map((feature) => (
                <div key={feature.name} className="border border-border/50 rounded-xl mb-3 overflow-hidden">
                  {/* Feature name */}
                  <div className="bg-muted/30 px-4 py-2.5 font-semibold text-foreground text-sm border-b border-border/50">
                    {feature.name}
                  </div>
                  {/* Tier values */}
                  <div className="divide-y divide-border/40">
                    {TIERS.map((tier, vIdx) => (
                      <div key={tier.id} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{tier.name}</span>
                        <span className="text-sm font-medium text-foreground">
                          {typeof feature.values[vIdx] === "boolean" ? (
                            feature.values[vIdx] ? (
                              <span className="flex w-5 h-5 bg-orange-500 rounded-full items-center justify-center">
                                <Check className="w-3 h-3 text-black stroke-[3]" />
                              </span>
                            ) : (
                              <span className="flex w-5 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full items-center justify-center">
                                <X className="w-3 h-3 text-slate-400 dark:text-zinc-500 stroke-[3]" />
                              </span>
                            )
                          ) : (
                            feature.values[vIdx]
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── DESKTOP: Full table (hidden on mobile) ── */}
        <div className="hidden md:block w-full overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="w-[25%] p-5"></th>
                {TIERS.map((tier) => (
                  <th key={tier.id} className="p-5 text-center font-bold text-foreground text-lg tracking-tight w-[15%]">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_FEATURES.map((section) => (
                <React.Fragment key={section.category}>
                  <tr className="border-b-0">
                    <td colSpan={6} className="py-3 pt-12">
                      <div className="bg-slate-100 dark:bg-zinc-800/80 rounded-xl px-5 py-4 font-black text-foreground text-base uppercase tracking-wider">
                        {section.category}
                      </div>
                    </td>
                  </tr>
                  {section.features.map((feature) => (
                    <tr key={feature.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-5 px-5 text-base font-medium text-foreground">{feature.name}</td>
                      {feature.values.map((val, vIdx) => (
                        <td key={vIdx} className="py-5 px-3 text-center text-base text-foreground font-medium">
                          {typeof val === "boolean" ? (
                            val ? (
                              <span className="flex w-6 h-6 bg-orange-500 rounded-full items-center justify-center mx-auto">
                                <Check className="w-4 h-4 text-black stroke-[3]" />
                              </span>
                            ) : (
                              <span className="flex w-6 h-6 bg-slate-200 dark:bg-zinc-800 rounded-full items-center justify-center mx-auto">
                                <X className="w-4 h-4 text-slate-400 dark:text-zinc-500 stroke-[3]" />
                              </span>
                            )
                          ) : (
                            val
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Trust Footer ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center"
      >
        <div>
          <h4 className="text-foreground font-bold mb-2">Secure Payments</h4>
          <p className="text-muted-foreground text-sm">All transactions handled securely by Polar.</p>
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

      <BetaDialog open={betaDialogOpen} onOpenChange={setBetaDialogOpen} />
    </div>
  );
}
