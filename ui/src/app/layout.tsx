import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import Sidebar from "@/components/Sidebar";
import NavigationWrapper from "@/components/NavigationWrapper";
import { MobileNavWrapper } from "@/components/MobileNavWrapper";
import TechnicalLattice from "@/components/TechnicalLattice";
import AuthSync from "@/components/AuthSync"
import { YouTubeErrorSuppressor } from "@/components/YouTubeErrorSuppressor";
import { BetaBanner } from "@/components/BetaBanner";
import { CookieBanner } from "@/components/CookieBanner";
import FooterWrapper from "@/components/FooterWrapper";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PokiSpokey - Learn Languages from Real Content",
    template: "%s | PokiSpokey",
  },
  description:
    "Master languages with real-world video clips from movies, podcasts, and more.",
  metadataBase: new URL("https://pokispokey.com"),
  openGraph: {
    title: "PokiSpokey - Learn Languages from Real Content",
    description:
      "Master languages with real-world video clips from movies, podcasts, and more.",
    url: "https://pokispokey.com",
    siteName: "PokiSpokey",
    images: [{ url: "/main_logo.png", width: 512, height: 512, alt: "PokiSpokey" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PokiSpokey - Learn Languages from Real Content",
    description:
      "Master languages with real-world video clips from movies, podcasts, and more.",
    images: ["/main_logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden w-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://s.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://s.ytimg.com" />
      </head>
      <body
        className={`${inter.className} w-full min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthSync />
            <YouTubeErrorSuppressor />
            <CookieBanner />
            <ToastProvider position="bottom-right">
              <BetaBanner />
              {/* Main App Layout with Sidebar + Content */}
              <div className="flex min-h-screen relative z-10">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-x-hidden">
                  <NavigationWrapper />
                  <main className="flex-1 flex flex-col min-w-0">
                    {children}
                  </main>
                  <FooterWrapper />
                </div>
              </div>
              <MobileNavWrapper />
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
