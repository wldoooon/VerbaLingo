import * as React from "react";
import { cn } from "@/lib/utils";

interface BlueprintGridProps extends React.HTMLAttributes<HTMLDivElement> {
	columns?: number;
	cellSize?: string;
}

/**
 * The master container for the Firecrawl-style architectural grid.
 * Uses native CSS Grid to organize child BlueprintBoxes.
 */
export function BlueprintGrid({
	columns = 12,
	cellSize = "64px",
	className,
	children,
	...props
}: BlueprintGridProps) {
	return (
		<div
			className={cn(
				"grid w-full h-full border-t border-l border-border/40 overflow-hidden bg-background",
				className
			)}
			style={{
				gridTemplateColumns: `repeat(${columns}, 1fr)`,
				gridAutoRows: cellSize,
				...props.style,
			}}
			{...props}
		>
			{children}
		</div>
	);
}

interface BlueprintBoxProps extends React.HTMLAttributes<HTMLDivElement> {
	colSpan?: number;
	rowSpan?: number;
	dotted?: boolean;
	shaded?: boolean;
}

/**
 * A singular (or spanning) grid box. 
 * Allows complete freedom to mix small boxes, massive spanning boxes, blanks, and shaded boxes.
 */
export function BlueprintBox({
	colSpan = 1,
	rowSpan = 1,
	dotted = true,
	shaded = false,
	className,
	children,
	...props
}: BlueprintBoxProps) {
	return (
		<div
			className={cn(
				"relative border-r border-b border-border/40 flex flex-col items-center justify-center transition-colors duration-500",
				shaded && "bg-muted/30 dark:bg-muted/10", // The firecrawl "data processing block" look
				className
			)}
			style={{
				gridColumn: `span ${colSpan}`,
				gridRow: `span ${rowSpan}`,
				...props.style,
			}}
			{...props}
		>
			{/* The faint center dot */}
			{dotted && (
				<div className="absolute size-1 bg-border/40 rounded-full" />
			)}

			{/* Allow pushing actual content (text, icons, forms) above the dot */}
			<div className="relative z-10 w-full h-full">{children}</div>
		</div>
	);
}
