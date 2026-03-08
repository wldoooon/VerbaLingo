import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a PokiSpokey plan that fits your language learning goals.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
