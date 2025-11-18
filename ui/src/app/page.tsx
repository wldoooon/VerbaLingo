"use client";

import { Navigation } from "@/components/Navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DiscoverySection } from "@/components/DiscoverySection";
import { motion } from "framer-motion";
import { ArrowRight, Play, Search, BookOpen, Globe, Zap, Headphones, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  // Mock user data - in a real app this would come from auth
  const userData = {
    name: "Guest",
    email: "guest@verbalingo.com",
    avatar: "/avatars/user.jpg",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
      },
    },
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <Navigation user={userData} showNavMenu={false} />

        <main className="flex-1 flex flex-col min-w-0">
          {/* Hero Section */}
          <section className="relative pt-6 pb-20 lg:pt-10 lg:pb-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse-orb" />
              <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse-orb" style={{ animationDelay: "1s" }} />
            </div>

            <div className="w-full relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                {/* Description on the Left */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="lg:w-1/4 space-y-8 pl-6 pr-2"
                >
                  <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-border bg-background/50 backdrop-blur-sm px-3 py-1 text-sm text-muted-foreground shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    New: AI-Powered Pronunciation Feedback
                  </motion.div>

                  <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    Master English with <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
                      Real-World Context
                    </span>
                  </motion.h1>

                  <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                    Stop memorizing lists. Start understanding. VerbaLingo immerses you in authentic videos, podcasts, and conversations to help you speak like a native.
                  </motion.p>

                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                    <Link
                      href="/search"
                      className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto"
                    >
                      Start Learning Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="h-12 px-8 rounded-full border border-border bg-background hover:bg-muted/50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Play className="w-4 h-4" /> Watch Demo
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Discover Carousel on the Right */}
                <div className="lg:w-3/4 w-full pr-4">
                  <DiscoverySection />
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-24 bg-muted/30 border-y border-border/50">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Why Context Matters</h2>
                <p className="text-muted-foreground text-lg">
                  Traditional learning isolates words. We connect them to reality.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Search className="w-6 h-6 text-primary" />,
                    title: "Instant Context Search",
                    description: "Type any word and instantly see thousands of real-life examples from movies, TED talks, and news.",
                  },
                  {
                    icon: <Headphones className="w-6 h-6 text-accent" />,
                    title: "Immersive Listening",
                    description: "Train your ear with diverse accents, speeds, and speaking styles. From formal presentations to street slang.",
                  },
                  {
                    icon: <Zap className="w-6 h-6 text-yellow-500" />,
                    title: "Smart Playback Controls",
                    description: "Loop difficult phrases, slow down audio, and click any word in the transcript for an instant definition.",
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Discover Section with Carousel */}
          <section id="how-it-works" className="py-24 overflow-hidden">
            <div className="w-full">
              <div className="flex flex-col lg:flex-row items-center gap-9">
                {/* Description on the Left */}
                <div className="lg:w-1/4 space-y-8 pl-6 pr-2">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    Discover Content <br />
                    <span className="text-primary">tailored for you</span>.
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        title: "Curated Collections",
                        desc: "Explore handpicked movies, podcasts, and shows for every learning level.",
                        icon: <Search className="w-5 h-5" />,
                      },
                      {
                        title: "Real-world contexts",
                        desc: "See how phrases are used in authentic situations across different media.",
                        icon: <Play className="w-5 h-5" />,
                      },
                      {
                        title: "Track your progress",
                        desc: "Monitor your learning journey with detailed stats and achievements.",
                        icon: <MessageCircle className="w-5 h-5" />,
                      },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{step.title}</h4>
                          <p className="text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discover Carousel on the Right */}
                <div className="lg:w-3/4 w-full pr-4">
                  <DiscoverySection />
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="relative rounded-3xl bg-primary px-6 py-16 sm:px-16 sm:py-24 text-center overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight">
                    Ready to speak naturally?
                  </h2>
                  <p className="text-primary-foreground/80 text-lg">
                    Join thousands of learners who are mastering English through the power of context. No credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="h-12 px-8 rounded-full bg-background text-foreground font-semibold hover:bg-background/90 transition-colors shadow-lg">
                      Get Started for Free
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 border-t border-border bg-muted/5 mt-auto">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    VerbaLingo
                  </span>
                  <p className="mt-4 text-sm text-muted-foreground">
                    The context-first English learning platform powered by real-world video content.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Product</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary">Features</Link></li>
                    <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                    <li><Link href="#" className="hover:text-primary">For Teachers</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                    <li><Link href="#" className="hover:text-primary">Community</Link></li>
                    <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                    <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} VerbaLingo. All rights reserved.
              </div>
            </div>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

