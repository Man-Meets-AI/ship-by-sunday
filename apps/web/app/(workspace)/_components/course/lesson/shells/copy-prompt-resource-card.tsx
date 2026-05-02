"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LessonPromptResourceContent } from "@/lib/course/lesson/model/contracts";

import { CopyPromptIconSwap } from "./copy-prompt-icon-swap";
import type { PinnedArtifact } from "./types";
import { useCopyPromptResourceCard } from "./use-copy-prompt-resource-card";

export function CopyPromptResourceCard({
	resource,
	pinnedArtifacts,
}: {
	resource: LessonPromptResourceContent;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const promptFieldId = useId();
	const { copyState, copyPrompt, prompt, disabledReason } =
		useCopyPromptResourceCard(resource, pinnedArtifacts);
	const reducedMotion = useReducedMotion() ?? false;
	const isCopied = copyState === "copied";

	const pillMotionProps = reducedMotion
		? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: {
				initial: { opacity: 0, y: 4 },
				animate: { opacity: 1, y: 0 },
				exit: { opacity: 0, y: -2 },
				transition: { duration: 0.18, ease: "easeOut" as const },
			};

	return (
		<div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-muted/5 p-5 transition-shadow duration-200 motion-reduce:transition-none hover:shadow-sm">
			<div className="space-y-1.5">
				<h3 className="text-sm font-bold tracking-tight text-foreground">
					{resource.label}
				</h3>
				<p className="text-[13px] leading-relaxed text-muted-foreground/90">
					Copy this prompt and fill in the bracketed placeholders before pasting
					it into your model.
				</p>
			</div>
			<div className="space-y-4">
				{disabledReason ? (
					<Alert className="border-border/40 bg-muted/20">
						<AlertDescription className="text-[12px]">
							{disabledReason}
						</AlertDescription>
					</Alert>
				) : null}
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Button
							type="button"
							onClick={copyPrompt}
							disabled={Boolean(disabledReason)}
							variant="secondary"
							size="sm"
							data-testid="lesson-copy-prompt-button"
							className="inline-flex h-8 w-fit items-center gap-1.5 px-3 text-[12px]"
						>
							<CopyPromptIconSwap isCopied={isCopied} />
							<span>Copy prompt</span>
						</Button>
						<div
							aria-live="polite"
							className="pointer-events-none flex h-4 items-center"
						>
							<AnimatePresence>
								{isCopied ? (
									<motion.span
										key="copied-pill"
										{...pillMotionProps}
										data-testid="lesson-copy-prompt-copied-pill"
										className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
									>
										Copied
									</motion.span>
								) : null}
							</AnimatePresence>
						</div>
					</div>
					{copyState === "error" && !disabledReason ? (
						<Alert variant="destructive">
							<AlertDescription className="text-[12px]">
								Clipboard unavailable. Copy from the prompt block below.
							</AlertDescription>
						</Alert>
					) : null}
				</div>
				{prompt ? (
					<div className="space-y-2">
						<Label
							htmlFor={promptFieldId}
							className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70"
						>{`${resource.label} prompt`}</Label>
						<Textarea
							id={promptFieldId}
							readOnly
							value={prompt}
							rows={14}
							className="min-h-[200px] resize-y border-border/40 bg-background/50 font-mono text-[13px] leading-relaxed shadow-none focus-visible:ring-1"
						/>
					</div>
				) : (
					<p className="text-[13px] italic text-muted-foreground/60">
						The prompt will appear here once this lesson includes copy text.
					</p>
				)}
			</div>
		</div>
	);
}
