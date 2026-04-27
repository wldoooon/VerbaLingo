import WatchClientPage from "@/components/watch/WatchClientPage"
import { Metadata } from "next"

type Props = {
    params: Promise<{ word: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { word } = await params
    const decodedWord = decodeURIComponent(word)

    return {
        title: `Watch "${decodedWord}" - Pokispokey`,
        description: `Learn how to pronounce and use "${decodedWord}" in real-world context with video examples.`,
    }
}

export default async function Page({ params }: Props) {
    const { word } = await params
    return <WatchClientPage word={word} />
}
