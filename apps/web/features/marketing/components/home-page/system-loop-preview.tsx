import { cn } from "@/lib/utils";

const previewNodes = [
	{
		id: "design",
		label: "Design Pack",
		positionClassName: "left-1/2 top-[8%] w-[40%] -translate-x-1/2",
	},
	{
		id: "marketing",
		label: "Marketing Pack",
		positionClassName: "left-[4%] top-1/2 w-[32%] -translate-y-1/2",
	},
	{
		id: "build",
		label: "Build Pack",
		positionClassName: "right-[4%] top-1/2 w-[28%] -translate-y-1/2",
	},
	{
		id: "prompt",
		label: "Prompt Pack",
		positionClassName: "left-1/2 bottom-[8%] w-[34%] -translate-x-1/2",
	},
] as const;

function SystemPreviewNode({
	label,
	className,
}: {
	readonly label: string;
	readonly className: string;
}) {
	return (
		<div
			className={cn(
				"absolute flex min-h-[64px] items-center justify-center rounded-2xl border border-border/40 bg-background/95 px-5 py-3 text-center text-xs font-bold tracking-wider text-foreground/70 uppercase shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:text-foreground",
				className,
			)}
		>
			{label}
		</div>
	);
}

export function SystemLoopPreview({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"relative aspect-[11/10] overflow-hidden rounded-[32px] border border-border/40 bg-background/50 p-8 shadow-xl transition-all duration-700 sm:p-12",
				className,
			)}
		>
			<div className="absolute left-1/2 top-[15%] h-[70%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border/40 to-transparent" />
			<div className="absolute left-[15%] top-1/2 h-px w-[70%] -translate-y-1/2 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
			
			{previewNodes.map((node) => (
				<SystemPreviewNode
					key={node.id}
					label={node.label}
					className={node.positionClassName}
				/>
			))}
			
			<div className="absolute left-1/2 top-1/2 flex min-h-[90px] w-[40%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border border-primary/20 bg-primary/5 px-6 py-6 text-center text-sm font-black tracking-[0.2em] text-primary transition-all duration-500 hover:bg-primary/10">
				<span className="relative z-10 uppercase italic">Product Truth</span>
			</div>
		</div>
	);
}
