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
				"absolute flex min-h-[68px] items-center justify-center rounded-[18px] border border-border/70 bg-background/90 px-4 py-3 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-foreground/82 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset]",
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
				"relative aspect-[11/10] overflow-hidden rounded-[28px] border border-border/70 bg-background p-5 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset] sm:p-6",
				className,
			)}
		>
			<div className="absolute left-1/2 top-[18%] h-[49%] w-px -translate-x-1/2 bg-border/70" />
			<div className="absolute left-[18%] top-1/2 h-px w-[64%] -translate-y-1/2 bg-border/70" />
			<div className="absolute left-1/2 top-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border/60" />
			{previewNodes.map((node) => (
				<SystemPreviewNode
					key={node.id}
					label={node.label}
					className={node.positionClassName}
				/>
			))}
			<div className="absolute left-1/2 top-1/2 flex min-h-[84px] w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22px] border border-sky-300/70 bg-sky-100 px-4 py-4 text-center font-mono text-[0.72rem] uppercase tracking-[0.2em] text-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.55)_inset] dark:border-sky-200/40 dark:bg-sky-200 dark:text-slate-950">
				Product Truth
			</div>
			<div className="absolute left-5 top-5 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
				One source of truth
			</div>
			<div className="absolute bottom-5 right-5 text-right font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
				Starter snapshot
				<br />
				before handoff
			</div>
		</div>
	);
}
