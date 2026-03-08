import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Props = {
  params: Promise<{ q: string; language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { q, language } = await params;
  const query = decodeURIComponent(q);
  return {
    title: `"${query}" in ${language}`,
    description: `Learn how "${query}" is used in real ${language} video clips on PokiSpokey.`,
  };
}

export default function SearchSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
