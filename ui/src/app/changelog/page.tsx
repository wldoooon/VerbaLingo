"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Calendar } from 'lucide-react';

// Data structure for your releases
const releases = [
    {
        version: "v1.4.0",
        date: "Today",
        title: "Bonjour! French Language Support",
        description: "Mais oui! We have officially added full support for the French language.",
        changes: [
            { type: "feat", description: "Added entirely new French language catalog with hundreds of thousands of indexed videos." },
            { type: "feat", description: "Configured the AI Tutor companion to understand and explain French grammar and nuance." }
        ]
    },
    {
        version: "v1.3.5",
        date: "Yesterday",
        title: "Sub-Category Deep Search",
        description: "Finding exactly what you need is now faster and more intuitive with specific sub-category filtering.",
        changes: [
            { type: "feat", description: "Added the ability to filter search results by highly specific sub-categories." },
            { type: "update", description: "Improved search indexing speeds for complex layered queries." }
        ]
    },
    {
        version: "v1.3.1",
        date: "February 28, 2026",
        title: "AI Companion Mobile Fixes",
        description: "We've tightened up our mobile layouts, taking special care of how the AI Companion renders on small screens.",
        changes: [
            { type: "fix", description: "Resolved an issue where the AI Companion feature card layout broke or overflowed text on iPads." },
            { type: "fix", description: "Removed CPU-heavy robot icon animations in the AI Companion card to ensure buttery smooth performance on older phones." }
        ]
    }
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
