import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Placeholder = {
	title: <div className="bg-secondary h-8 max-w-40 w-full rounded-md" />,
	content: <div className="bg-secondary h-20 w-full rounded-md" />,
};

const Ellipses = () => {
	const sharedClasses =
		"rounded-full outline outline-8 sm:my-6 md:my-8 size-1 my-4 outline-background bg-foreground";
	return (
		<div className="absolute z-0 grid h-full w-full items-center gap-8 lg:grid-cols-2">
			<div className="absolute z-0 grid h-full w-full grid-cols-2 place-content-between">
				<div className={`${sharedClasses} -mx-[2.5px]`}></div>
				<div className={`${sharedClasses} -mx-[2px] place-self-end`}></div>
				<div className={`${sharedClasses} -mx-[2.5px]`}></div>
				<div className={`${sharedClasses} -mx-[2px] place-self-end`}></div>
			</div>
		</div>
	);
};

const Container = ({ children }: { children: React.ReactNode }) => (
	<div className="relative w-full h-full rounded-2xl border bg-background/50 px-4">
		<div className="absolute left-0 top-3 z-0 h-px w-full bg-border/20"></div>
		<div className="absolute bottom-3 left-0 z-0 h-px w-full bg-border/20"></div>
		<div className="relative h-full border-x border-border/10">
			<Ellipses />
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