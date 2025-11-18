"use client";

import { Navigation } from "@/components/Navigation";

import { SidebarCard } from "@/components/SidebarCard";

export default function HomePage() {
  // User data (you can move this to a context or fetch from API)

  const userData = {
    name: "wldooon",

    email: "user@verbalingo.com",

    avatar: "/avatars/user.jpg",
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}

      <Navigation user={userData} showNavMenu={false} />

      {/* Main Content Area - Sidebar + Content */}

      <main className="flex flex-1">
        {/* Left Sidebar */}

        <SidebarCard />

        {/* Main Content */}

        <div className="flex-1 bg-card text-card-foreground shadow-sm p-4 sm:p-6 pb-12 lg:pb-6">
          {/* Landing hero describing the app */}
          <section className="mt-6 rounded-xl border border-border bg-background/60 p-6 sm:p-8 shadow-sm space-y-4">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Learn English the smart way
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Discover real English through videos, podcasts, and everyday
              conversations.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              MiniYouGlish helps you learn English by searching real clips from
              movies, series, talks, and podcasts. See and hear how words and
              expressions are used in context, with transcripts and smart
              controls that keep you focused on understanding, not rewinding.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                <h2 className="font-medium mb-1">Context-first learning</h2>
                <p className="text-xs text-muted-foreground">
                  Search any word or phrase and instantly jump into real
                  examples, not isolated grammar drills.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                <h2 className="font-medium mb-1">Smart video controls</h2>
                <p className="text-xs text-muted-foreground">
                  Loop tricky parts, slow down playback, and follow along with
                  interactive transcripts.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                <h2 className="font-medium mb-1">Built for real progress</h2>
                <p className="text-xs text-muted-foreground">
                  Move from recognition to confident use with examples drawn
                  from authentic, modern English.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              <span>• Works great for self-learners and teachers</span>
              <span>• Supports video-based and audio-based practice</span>
              <span>• Designed to keep you motivated and curious</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
