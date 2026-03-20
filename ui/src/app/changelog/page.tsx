"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Calendar } from 'lucide-react';

// Data structure for your releases
const releases = [
    {
        version: "v1.6.0",
        date: "March 20, 2026",
        title: "No More Double Counting",
        description: "We overhauled how search usage is tracked so you never get charged twice for the same lookup. This update also brings major stability improvements to the video player and transcript sync.",
        changes: [
            { type: "fix", description: "Searching the same word or phrase within one hour (refresh, back-navigation, re-typing) no longer deducts from your monthly quota a second time." },
            { type: "fix", description: "Transcript box no longer vibrates or jumps between sentences during playback. Sync logic was rewritten with a sticky 'last passed sentence' engine." },
        ]
    },
    {
        version: "v1.5.0",
        date: "March 10, 2026",
        title: "Instant Search",
        description: "Search results now feel instant.",
        changes: [
            { type: "feat", description: "Player component chunks are now pre-fetched on page load so video playback starts immediately when results arrive." },
            { type: "fix", description: "Search bar no longer triggers conflicting route prefetches on focus, which was causing App Router internal state corruption on fast tab switches." },
        ]
    },
    {
        version: "v1.4.0",
        date: "February 20, 2026",
        title: "Bonjour! French Language Support",
        description: "We officially added full support for the French language — a curated library of real-world clips spanning movies, podcasts, cartoons, and talks.",
        changes: [
            { type: "feat", description: "Added the French language catalog with hundreds of thousands of indexed video frames." },
            { type: "feat", description: "AI Assistant now understands and explains French grammar, idiomatic expressions, and cultural nuances." },
            { type: "feat", description: "Language selector in the search bar now includes French alongside English and German." },
        ]
    },
    {
        version: "v1.3.5",
        date: "February 10, 2026",
        title: "Sub-Category Deep Search",
        description: "Finding exactly the right context is now faster with specific sub-category filtering layered on top of the main category.",
        changes: [
            { type: "feat", description: "Added sub-category filters — drill down from 'Movies' to 'Drama', 'Comedy', 'Action', and more." },
            { type: "update", description: "Improved search indexing speeds for complex layered queries across all six content categories." },
        ]
    },
    {
        version: "v1.3.0",
        date: "January 28, 2026",
        title: "Ai Credits Economy & Subscription Tiers",
        description: "We launched the full subscription model with five tiers, a ai credits-based AI token economy, and real-time usage tracking synced to your account.",
        changes: [
            { type: "feat", description: "Introduced AI credits each AI Assistant response deducts credits based on response length. All plans start with a generous credits balance." },
            { type: "feat", description: "Launched five subscription tiers: Free, Basic ($4.99/mo), Pro ($8.99/mo), Premium ($14.99/mo), and Max ($18.99/mo)." },
        ]
    },
];



export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-14 lg:pt-0">
            <main className="max-w-6xl mx-auto px-6 lg:px-12 py-24">
                {/* Hero Section */}
                <div className="mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tighter text-foreground mb-6"
                    >
                        Changelog
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
                    >
                        New updates and improvements to VerbaLingo. We ship frequently — here's everything we've built so far.
                    </motion.p>

                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Continuous Timeline Line */}
                    <div className="absolute top-3 bottom-0 left-3 md:left-[240px] w-px bg-border"></div>

                    <div className="space-y-16">
                        {releases.map((release, index) => (
                            <motion.div
                                key={release.version}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative md:flex"
                            >
                                {/* Desktop Date Column */}
                                <div className="hidden md:block w-[240px] shrink-0 text-right pt-2 pr-12">
                                    <div className="sticky top-24">
                                        <time className="text-sm font-medium text-muted-foreground block mb-1">{release.date}</time>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs font-mono font-medium text-foreground">
                                            <Tag className="w-3 h-3" />
                                            {release.version}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Node */}
                                <div className="absolute left-3 md:left-[240px] top-3 w-4 h-4 bg-card border-4 border-primary rounded-full ring-4 ring-background -translate-x-1/2 z-10"></div>

                                {/* Content Column */}
                                <div className="pl-10 md:pl-12 flex-1">
                                    {/* Mobile Date (hidden on desktop) */}
                                    <div className="md:hidden mb-4 pt-1">
                                        <time className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {release.date}
                                        </time>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs font-mono font-medium text-foreground">
                                            <Tag className="w-3 h-3" />
                                            {release.version}
                                        </div>
                                    </div>

                                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">{release.title}</h2>

                                        {release.description && (
                                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl">
                                                {release.description}
                                            </p>
                                        )}

                                        <div className="space-y-4">
                                            {release.changes.map((change, changeIndex) => (
                                                <div key={changeIndex} className="flex items-start gap-4">
                                                    <div className="mt-2.5 flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/40"></div>
                                                    </div>
                                                    <p className="text-foreground/80 leading-relaxed flex-1">
                                                        {change.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
