import { cn } from "@/lib/utils";
import { DecorIcon } from "@/components/ui/decor-icon";
import { ThumbProgressCarousel } from "@/components/ui/thumb-progress-carousel";

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
];export function DashboardSkeleton() {
	return (
		<div
			className={cn(
				"grid grid-cols-2 gap-4 lg:grid-cols-4",
				"*:min-h-48 *:w-full *:bg-muted *:border *:border-border *:dark:bg-muted/50"
			)}
		>
			{/* --- Card 1: Top Hero Section (Split horizontally with NO gap) --- */}
			<div className="relative col-span-2 min-h-114! lg:col-span-4 flex flex-col lg:flex-row" >
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
				<div className="flex-1 p-6 z-10 w-full">
					{/* Put Left Content Here */}
				</div>
				<div className="relative flex-1 z-10 w-full border-t lg:border-t-0 border-border lg:border-l p-2 sm:p-2 flex flex-col">
					<div className="flex-1 w-full relative rounded-2xl overflow-hidden shadow-sm shadow-foreground/5 border border-border/70 dark:border-border/40">
						<div className="absolute inset-0">
							<ThumbProgressCarousel items={carouselItems} />
						</div>
					</div>
				</div>
			</div>

			{/* --- Card 2: Bottom Row - First Box --- */}
			<div className="relative">
				<DecorIcon className="size-5 text-muted-foreground" position="top-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="top-right" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-left" />
				<DecorIcon className="size-5 text-muted-foreground" position="bottom-right" />

				<div className="pointer-events-none absolute -top-[1px] -inset-x-[100px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[100px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[0px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>

			{/* --- Card 3: Bottom Row - Second Box --- */}
			<div className="relative" >
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[50px] -bottom-[100px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[400px] -bottom-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>

			{/* --- Card 4: Bottom Row - Third Box --- */}
			<div className="relative" >
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[400px] -bottom-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>

			{/* --- Card 5: Bottom Row - Fourth Box --- */}
			<div className="relative" >
				<div className="pointer-events-none absolute -top-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -bottom-[1px] -inset-x-[50px] h-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -left-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
				<div className="pointer-events-none absolute -right-[1px] -inset-y-[50px] w-[1px] bg-border" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }} />
			</div>
		</div>
	);
}


