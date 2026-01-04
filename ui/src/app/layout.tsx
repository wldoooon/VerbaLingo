import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { AiAssistantProvider } from "@/context/AiAssistantContext";
import QueryProvider from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/Sidebar";
import { Navigation } from "@/components/Navigation";
import TechnicalLattice from "@/components/TechnicalLattice";

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
        className={`${inter.className} white overflow-x-hidden min-h-screen bg-background`}
        style={{ fontSize: '85%' }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Technical Dynamic Background */}
          <TechnicalLattice gridSize={80} opacity={0.6} />

          <QueryProvider>
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
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
