"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timingConfig } from "@/config/product";
import type { LessonPromptResourceContent } from "@/features/course/lesson/model/contracts";
import { getPromptTemplateState } from "@/features/course/lesson/model/research-prompt";

import type { PinnedArtifact } from "./types";

function getPromptResourceState(
	resource: LessonPromptResourceContent,
	pinnedArtifacts: PinnedArtifact[],
) {
	return getPromptTemplateState(resource.promptTemplateId, pinnedArtifacts);
}

export function CopyPromptResourceCard({
	resource,
	pinnedArtifacts,
}: {
	resource: LessonPromptResourceContent;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetTimeoutRef = useRef<number | null>(null);
	const { prompt, disabledReason } = getPromptResourceState(
		resource,
		pinnedArtifacts,
	);

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setCopyState("idle");
	}, [disabledReason, prompt]);

	const copyPrompt = () => {
		if (!prompt || disabledReason) {
			return;
		}

		if (!navigator.clipboard?.writeText) {
			setCopyState("error");
			return;
		}

		void navigator.clipboard.writeText(prompt).then(
			() => {
				if (resetTimeoutRef.current !== null) {
					window.clearTimeout(resetTimeoutRef.current);
				}

				setCopyState("copied");
				resetTimeoutRef.current = window.setTimeout(() => {
					resetTimeoutRef.current = null;
					setCopyState("idle");
				}, timingConfig.promptCopyResetMs);
			},
			() => {
				setCopyState("error");
			},
		);
	};

	return (
		<div className="space-y-3">
			<div className="space-y-1">
				<h3 className="text-base font-semibold leading-snug text-foreground">
					{resource.label}
				</h3>
				{resource.body ? (
					<p className="text-sm leading-relaxed text-muted-foreground">
						{resource.body}
					</p>
				) : null}
			</div>
			{disabledReason ? (
				<p className="text-sm leading-relaxed text-muted-foreground">
					{disabledReason}
				</p>
			) : null}
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					onClick={copyPrompt}
					disabled={Boolean(disabledReason)}
					variant="secondary"
					size="sm"
				>
					{copyState === "copied" ? "Copied" : "Copy prompt"}
				</Button>
				{copyState === "error" && !disabledReason ? (
					<p className="text-sm text-muted-foreground">
						Clipboard unavailable. Copy from the prompt block below.
					</p>
				) : null}
			</div>
			{prompt ? (
				<Textarea
					readOnly
					value={prompt}
					rows={14}
					className="min-h-[240px] resize-y font-mono text-sm leading-relaxed"
					aria-label={`${resource.label} prompt`}
				/>
			) : (
				<p className="text-sm leading-relaxed text-muted-foreground">
					The prompt will appear here once your chosen user and outcome are
					saved.
				</p>
			)}
		</div>
	);
}
