import { cn } from "@/lib/utils";
import { DecorIcon } from "@/components/ui/decor-icon";
import { ThumbProgressCarousel } from "@/components/ui/thumb-progress-carousel";
import { CarouselCard } from "@/components/carousel-card";
import { BlueprintGrid, BlueprintBox } from "@/components/ui/blueprint-grid";
import { Globe, AudioLines, Sparkles, Mic } from "lucide-react";

const carouselItems = [
	{
		id: "1",
		image: "/moviesPosters.png",
		title: "Movies Collection",
	},
	{
		id: "2",
		image: "/PodcastCollection.png",
		title: "Podcast Series",
	},
	{
		id: "3",
		image: "/Cartoon_Picture.jpg",
		title: "Animation Studio",
	},
]; export function DashboardSkeleton() {
	return (
		<div
			className={cn(
				"grid grid-cols-2 lg:grid-cols-4 gap-0",
				"*:min-h-48 *:w-full *:bg-transparent *:border-b *:border-r *:border-border *:dark:bg-transparent border-t border-l"
			)}
		>
			{/* --- Card 1: Top Hero Section (Split horizontally with NO gap) --- */}
			<div className="relative col-span-2 min-h-114! lg:col-span-4 grid grid-cols-1 lg:grid-cols-2 gap-0" >
				{/* The Outer Corners */}
				<DecorIcon className="size-5 text-muted-foreground" position="top-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="top-right" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-right" />

				{/* --- Bleeding Grid Lines (Outer Edges) --- */}
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[100px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[100px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />

				{/* Content Wrappers (So you can put stuff in left/right independently) */}
				<div className="relative z-10 w-full min-h-[450px] overflow-hidden flex flex-col items-center justify-center p-6 border-transparent border-r border-border border-b sm:border-b-0">
					{/* Background Blueprint Grid completely filling the left side */}
					<div className="absolute w-full h-full inset-0 z-0 pointer-events-none">
						{/* 10 columns on desktop, 64px boxes. */}
						<BlueprintGrid columns={10} cellSize="64px" className="border-none w-full h-full min-h-[500px]">
							{/* ====== ROW 1 ====== */}
							<BlueprintBox shaded>
							</BlueprintBox>
							<BlueprintBox>
							</BlueprintBox>
							<BlueprintBox>
							</BlueprintBox>
							<BlueprintBox colSpan={4} dotted={false} className="bg-primary/5">
								<div className="flex items-center justify-center gap-2 sm:gap-3 w-full h-full text-[10px] sm:text-xs font-mono text-muted-foreground">
									<Globe className="w-3 h-3 text-primary" />
									<span className="truncate px-2">English • Spanish • French • +50</span>
								</div>
							</BlueprintBox>
							<BlueprintBox>
							</BlueprintBox>
							<BlueprintBox shaded>
							</BlueprintBox>
							<BlueprintBox>
							</BlueprintBox>

							{/* ====== ROW 2, 3, 4 (Hero Title: spans 3 rows height) ====== */}
							<BlueprintBox rowSpan={3} shaded>
							</BlueprintBox>
							<BlueprintBox colSpan={7} rowSpan={3} dotted={false} className="px-8 border-b-primary/10">
								<div className="flex flex-col items-start justify-center h-full w-full">
									<div className="inline-flex items-center gap-1.5 rounded-none border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-medium mb-4 text-primary uppercase tracking-widest">
										<Sparkles className="w-3 h-3" />
										<span>Pronunciation</span>
									</div>
									<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-sm leading-tight text-left">
										Hear exactly how they<br />speak <span className="text-primary italic font-serif opacity-90">English</span>
									</h1>
								</div>
							</BlueprintBox>
							<BlueprintBox rowSpan={3}>
							</BlueprintBox>
							<BlueprintBox rowSpan={3} shaded>
							</BlueprintBox>

							{/* ====== ROW 5, 6 (Subtitle & Audio graphic: spans 2 rows) ====== */}
							<BlueprintBox colSpan={2} rowSpan={2} dotted={false}>
								<div className="flex items-center justify-center w-full h-full opacity-40 relative">
									<AudioLines className="w-8 h-8 text-primary absolute animate-pulse" />
								</div>
							</BlueprintBox>
							<BlueprintBox colSpan={6} rowSpan={2} dotted={false} className="px-6 bg-muted/5">
								<p className="text-muted-foreground font-medium leading-relaxed text-center h-full flex items-center justify-center text-xs sm:text-sm md:text-base">
									Search over 100,000+ authentic YouTube videos to hear exactly how native speakers pronounce any word or phrase in real life.
								</p>
							</BlueprintBox>
							<BlueprintBox colSpan={2} rowSpan={2} shaded>
							</BlueprintBox>

							{/* ====== ROW 7 (Empty spacer + decorative) ====== */}
							<BlueprintBox colSpan={2} rowSpan={2} dotted={false} className="relative">
								<div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
									<p className="text-xs sm:text-sm font-medium text-foreground tracking-tight leading-relaxed">
										Supporting <span className="text-primary">50+ languages</span> in real contexts
									</p>
								</div>
							</BlueprintBox>

							{/* --- FIRECRAWL ANIMATED MARQUEE LANE (Spans Cols 3-10, Rows 7-8) --- */}
							<BlueprintBox colSpan={8} rowSpan={2} dotted={false} className="p-0 overflow-hidden relative border-l-0">
								<style>{`
									@keyframes blueprint-marquee {
										0% { transform: translateX(0%); }
										100% { transform: translateX(-50%); }
									}
									.animate-blueprint {
										animation: blueprint-marquee 35s linear infinite;
									}
								`}</style>

								{/* Infinite scrolling wide container */}
								<div className="flex w-max h-full animate-blueprint">
									{/* The Belt (Repeated twice to loop seamlessly) */}
									{[0, 1].map((copy) => (
										<div key={copy} className="flex h-full shrink-0">
											{[
												{ name: "ENGLISH", icon: "/countries/English.png" },
												{ name: "ESPAÑOL", icon: "/countries/spain.png" },
												{ name: "DEUTSCH", icon: "/countries/germany.png" },
												{ name: "FRANÇAIS", icon: "/countries/france.png" }
											].map((lang, idx) => (
												<div key={`${copy}-${idx}`} className="w-[192px] h-full border-r border-border/40 shrink-0 relative flex items-center justify-center">
													{/* Floating Language Tags */}
													<div className="z-10 bg-background/90 text-foreground text-[10px] sm:text-xs font-mono px-4 py-3 rounded-none shadow-sm opacity-95 backdrop-blur-md flex items-center gap-4 transition-all">
														<img src={lang.icon} alt={lang.name} className="w-12 h-auto max-h-8 object-contain" />
														<span className={`font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r opacity-90 ${lang.name === "FRANÇAIS" ? "from-blue-800 via-slate-500 to-red-700" :
																lang.name === "ENGLISH" ? "from-blue-800 via-slate-500 to-red-700" :
																	lang.name === "ESPAÑOL" ? "from-red-700 via-amber-600 to-red-700" :
																		lang.name === "DEUTSCH" ? "from-zinc-950 via-red-800 to-amber-600" :
																			""
															}`}>
															{lang.name}
														</span>
													</div>
												</div>
											))}
										</div>
									))}
								</div>
							</BlueprintBox>

							{/* Overflow Safety Net: Just in case the screen is super tall, fill the rest */}
							{Array.from({ length: 26 }).map((_, i) => (
								<BlueprintBox key={`overflow-${i}`} className="border-border/40" shaded={i % 7 === 0} />
							))}
						</BlueprintGrid>
					</div>
				</div>
				<div className="relative flex-1 z-10 w-full border-t lg:border-t-0 border-border lg:border-l p-2 sm:p-2 flex flex-col">
					<CarouselCard>
						<ThumbProgressCarousel items={carouselItems} />
					</CarouselCard>
				</div>
			</div>

			{/* --- Card 2: Bottom Row - First Box --- */}
			<div className="relative overflow-hidden flex items-center justify-center">
				<div className="absolute inset-0 z-0 pointer-events-none">
					{/* 5 columns because 25% width == exactly half of the 10-column Left Hero! */}
					<BlueprintGrid columns={5} cellSize="64px" className="border-none">
						{Array.from({ length: 25 }).map((_, i) => (
							<BlueprintBox key={i} className="border-border/20" shaded={[2, 11].includes(i)} />
						))}
					</BlueprintGrid>
				</div>
				<div className="relative z-10 p-4 w-full h-full text-center text-muted-foreground flex items-center justify-center">
					Feature 1
				</div>
				<DecorIcon className="size-5 text-muted-foreground" position="top-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="top-right" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-right" />
				{/* Fading borders omitted for brevity, but architectural corners remain */}
			</div>

			{/* --- Card 3: Bottom Row - Second Box --- */}
			<div className="relative overflow-hidden flex items-center justify-center" >
				<div className="absolute inset-0 z-0 pointer-events-none">
					<BlueprintGrid columns={5} cellSize="64px" className="border-none">
						{Array.from({ length: 25 }).map((_, i) => (
							<BlueprintBox key={i} className="border-border/20" shaded={[7, 18].includes(i)} />
						))}
					</BlueprintGrid>
				</div>
				<div className="relative z-10 p-4 w-full h-full text-center text-muted-foreground flex items-center justify-center">
					Feature 2
				</div>
			</div>

			{/* --- Card 4: Bottom Row - Third Box --- */}
			<div className="relative overflow-hidden flex items-center justify-center" >
				<div className="absolute inset-0 z-0 pointer-events-none">
					<BlueprintGrid columns={5} cellSize="64px" className="border-none">
						{Array.from({ length: 25 }).map((_, i) => (
							<BlueprintBox key={i} className="border-border/20" shaded={[3, 14].includes(i)} />
						))}
					</BlueprintGrid>
				</div>
				<div className="relative z-10 p-4 w-full h-full text-center text-muted-foreground flex items-center justify-center">
					Feature 3
				</div>
			</div>

			{/* --- Card 5: Bottom Row - Fourth Box --- */}
			<div className="relative overflow-hidden flex items-center justify-center" >
				<div className="absolute inset-0 z-0 pointer-events-none">
					<BlueprintGrid columns={5} cellSize="64px" className="border-none">
						{Array.from({ length: 25 }).map((_, i) => (
							<BlueprintBox key={i} className="border-border/20" shaded={[9, 12].includes(i)} />
						))}
					</BlueprintGrid>
				</div>
				<div className="relative z-10 p-4 w-full h-full text-center text-muted-foreground flex items-center justify-center">
					Feature 4
				</div>
			</div>
		</div>
	);
}


