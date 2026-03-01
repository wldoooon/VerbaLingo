"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Calendar } from 'lucide-react';

// Data structure for your releases
const releases = [
    {
        version: "v1.2.0",
        date: "Current",
        title: "Mobile Performance Optimization",
        description: "A major update focusing on bringing buttery smooth 60fps animations to all mobile devices and iPads.",
        changes: [
            { type: "update", description: "Replaced CPU-heavy CSS blur filters with GPU-accelerated opacity overlays in the 3D Carousel." },
            { type: "fix", description: "Resolved iPad grid squishing bugs by adjusting Tailwind breakpoints from lg to xl." },
            { type: "feat", description: "Made 'Everything you need to fluency' typography fully fluid using clamp()." },
            { type: "update", description: "Gracefully disabled the canvas TechnicalLattice background on small screens." }
        ]
    },
    {
        version: "v1.1.0",
        date: "Yesterday",
        title: "Domain & Vercel Deployment",
        description: "PokiSpokey is now officially live on the internet.",
        changes: [
            { type: "feat", description: "Successfully configured and deployed frontend to Vercel." },
            { type: "feat", description: "Attached custom domain pokispokey.com via Porkbun." },
            { type: "feat", description: "Updated sidebar branding from VerbaLingo to PokiSpokey." }
        ]
    },
    {
        version: "v1.0.5",
        date: "February 14, 2026",
        title: "Authentication & User Profiles",
        description: "Launched our full authentication suite allowing users to save their progress.",
        changes: [
            { type: "feat", description: "Implemented secure sign-up and login workflows using Supabase." },
            { type: "feat", description: "Added editable user profiles with custom avatar uploads." },
            { type: "fix", description: "Fixed a routing issue where guests could bypass the 'Saved' library wall." }
        ]
    },
    {
        version: "v0.9.2",
        date: "January 28, 2026",
        title: "The Context Engine Beta",
        description: "Introduced our core video indexing engine to help learners find real-world examples.",
        changes: [
            { type: "feat", description: "Launched the initial version of the Context Engine™ with 14.2M indexed frames." },
            { type: "feat", description: "Integrated the AI Tutor companion for contextual explanations and grammar help." },
            { type: "update", description: "Optimized video retrieval queries to ensure sub-100ms response times globally." }
        ]
    },
    {
        version: "v0.8.0",
        date: "December 10, 2025",
        title: "Dark Mode & Design System",
        description: "A modern language learning app needs a modern UI. We delivered a complete brand overhaul.",
        changes: [
            { type: "feat", description: "Added full system-aware Light and Dark mode toggling." },
            { type: "feat", description: "Implemented the new PokiSpokey design system with semantic Tailwind colors." },
            { type: "fix", description: "Resolved several color contrast accessibility issues in the sidebar navigation." }
        ]
    }
];

// Helper to determine badge colors based on the change type
const getTypeColor = (type: string) => {
    return 'border-foreground/20 bg-foreground text-background';
};

// Helper to determine what text to show on the badge
const getTypeLabel = (type: string) => {
    switch (type) {
        case 'feat': return 'Feature';
        case 'fix': return 'Fix';
        default: return 'Update';
    }
};

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
                        New updates and improvements to PokiSpokey. We release new features and fixes frequently to keep improving your language journey.
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
                                                    <div className="mt-1">
                                                        <span className={`inline-flex items-center justify-center w-24 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getTypeColor(change.type)}`}>
                                                            {getTypeLabel(change.type)}
                                                        </span>
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
