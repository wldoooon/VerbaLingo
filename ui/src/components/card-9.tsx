import { BlueprintGrid, BlueprintBox } from "@/components/ui/blueprint-grid";
import { Card, CardContent } from "@/components/ui/card";

const Placeholder = {
	title: <div className="bg-secondary h-8 max-w-40 w-full rounded-md" />,
	content: <div className="bg-secondary h-20 w-full rounded-md" />,
};

// Ellipses removed to clear corner dots as requested

const Container = ({ children }: { children: React.ReactNode }) => (
	<div className="relative w-full h-full rounded-none border-b border-border/40 bg-transparent px-4 overflow-hidden">
		{/* Architectural Grid Background aligned with master grid */}
		<div 
			className="absolute inset-0 z-0 pointer-events-none opacity-100"
			style={{
				WebkitMaskImage: "linear-gradient(to bottom right, black 0%, transparent 80%)",
				maskImage: "linear-gradient(to bottom right, black 0%, transparent 80%)"
			}}
		>
			<BlueprintGrid columns={12} cellSize="64px" className="border-none bg-transparent">
				{Array.from({ length: 48 }).map((_, i) => (
					<BlueprintBox 
						key={i} 
						dotted={false} 
						className="border-border/40" 
						shaded={i % 7 === 0} 
					/>
				))}
			</BlueprintGrid>
		</div>

		<div className="absolute left-0 top-3 z-0 h-px w-full bg-border/20"></div>
		<div className="absolute bottom-3 left-0 z-0 h-px w-full bg-border/20"></div>
		<div className="relative h-full border-x border-border/10">
			<div className="relative z-20 mx-auto py-2 h-full flex flex-col justify-center">{children}</div>
		</div>
	</div>
);
//======================================
export const Card_9 = ({ 
    children = Placeholder.content 
}: { 
    children?: React.ReactNode 
}) => {
	return (
		<Container>
			<div className="w-full h-full p-2 overflow-visible">
				<Card className="border-none shadow-none bg-transparent h-full flex flex-col justify-center">
					<CardContent className="p-0 leading-tight h-full flex items-center justify-center text-center">
                        <div className="w-full">
                            {children}
                        </div>
                    </CardContent>
				</Card>
			</div>
		</Container>
	);
};