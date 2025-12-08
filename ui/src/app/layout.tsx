import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { SearchParamsProvider } from "@/context/SearchParamsContext";
import { AiAssistantProvider } from "@/context/AiAssistantContext";
import QueryProvider from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/Sidebar";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VerbaLingo - Learn Languages from Real Content",
  description: "Master languages with real-world video clips from movies, podcasts, and more.",
};

// Mock user data - in a real app this would come from auth
const userData = {
  name: "Guest",
  email: "guest@verbalingo.com",
  avatar: "/avatars/user.jpg",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ fontSize: '80%' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=0.80, maximum-scale=1.0, user-scalable=yes" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://s.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://s.ytimg.com" />
      </head>
      <body
        className={`${inter.className} white overflow-x-hidden min-h-screen bg-transparent`}
        style={{ fontSize: '85%' }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Grid */}
          <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
            {/* Dark Gradient Base */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-muted/40 via-background to-background"></div>

            {/* Grid Pattern with Radial Mask */}
            <div
              className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:24px_24px]"
              style={{
                maskImage: 'radial-gradient(ellipse at 60% 50%, black 20%, transparent 70%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 60% 50%, black 20%, transparent 70%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in'
              }}
            ></div>
          </div>

          <QueryProvider>
            <SearchParamsProvider>
              <PlayerProvider>
                <AiAssistantProvider>
                  {/* Main App Layout with Sidebar + Content */}
                  <div className="flex min-h-screen relative z-10">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navigation user={userData} />
                      <main className="flex-1 flex flex-col min-w-0">
                        {children}
                      </main>
                    </div>
                  </div>
                </AiAssistantProvider>
              </PlayerProvider>
            </SearchParamsProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
