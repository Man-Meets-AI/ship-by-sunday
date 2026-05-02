import { cn } from "@/lib/utils";

export function LessonVideoMetadata({
	title,
	durationLabel,
	footer,
	className,
}: {
	title?: string;
	durationLabel?: string;
	footer?: boolean;
	className?: string;
}) {
	if (!title && !durationLabel) return null;

	const content = (
		<div
			className={cn(
				"flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
				className,
			)}
		>
			{title ? <span>{title}</span> : null}
			{durationLabel ? (
				<>
					<span className="text-muted-foreground/40" aria-hidden>
						•
					</span>
					<span>{durationLabel}</span>
				</>
			) : null}
		</div>
	);

	if (footer) {
		return (
			<div className="border-t border-border/40 bg-muted/5 px-4 py-2.5">
				{content}
			</div>
		);
	}

	return content;
}
