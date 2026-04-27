"use client";

import { useId } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LessonPromptResourceContent } from "@/lib/course/lesson/model/contracts";

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

	return (
		<div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-muted/5 p-5">
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
					<Button
						type="button"
						onClick={copyPrompt}
						disabled={Boolean(disabledReason)}
						variant="secondary"
						size="sm"
						className="w-fit h-8 px-3 text-[12px]"
					>
						{copyState === "copied" ? "Copied" : "Copy prompt"}
					</Button>
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
