"use client";

import { cn } from "@/lib/utils";

export function LessonVideoControls({
	reducedMotion,
	variant,
	className,
}: {
	reducedMotion: boolean;
	variant: "bunny-forward" | "embed-help";
	className?: string;
}) {
	const forwardingActive = variant === "bunny-forward";

	return (
		<p
			data-testid="lesson-video-controls"
			data-prefers-reduced-motion={reducedMotion ? "true" : "false"}
			data-variant={variant}
			className={cn(
				"text-[11px] leading-5 text-muted-foreground motion-reduce:transition-none",
				className,
			)}
		>
			<span className="font-medium text-foreground/90">Video controls</span>
			{". "}
			{forwardingActive ? (
				<>
					Focus the frame, then use{" "}
					<kbd
						data-testid="lesson-video-control-key-space"
						className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-foreground"
					>
						Space
					</kbd>{" "}
					play/pause,{" "}
					<kbd
						data-testid="lesson-video-control-key-seek"
						className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-foreground"
					>
						← →
					</kbd>{" "}
					seek,{" "}
					<kbd
						data-testid="lesson-video-control-key-fullscreen"
						className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-foreground"
					>
						F
					</kbd>{" "}
					fullscreen.{" "}
					<abbr
						title="Use the Bunny player’s CC menu while the iframe is focused."
						className="cursor-help no-underline"
					>
						<kbd
							data-testid="lesson-video-control-key-captions"
							className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-foreground"
						>
							C
						</kbd>
					</abbr>{" "}
					for captions in-player.
				</>
			) : (
				<>
					Focus the video, then use Space and arrow keys, or use the on-screen
					controls.
				</>
			)}
		</p>
	);
}
