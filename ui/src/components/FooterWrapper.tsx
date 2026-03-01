"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export default function FooterWrapper() {
    const pathname = usePathname();

    // Hide the footer on the search/watch pages, assuming they start with /search
    if (pathname?.startsWith("/search")) {
        return null;
    }

    return <Footer />;
}
