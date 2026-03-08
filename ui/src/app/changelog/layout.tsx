import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "See what's new in PokiSpokey — latest features, improvements, and fixes.",
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
