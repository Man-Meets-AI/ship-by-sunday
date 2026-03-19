"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timingConfig } from "@/config/product";
import type { LessonPromptResourceContent } from "@/features/course/lesson/model/contracts";
import { getPromptTemplateState } from "@/features/course/lesson/model/research-prompt";
import { workbenchChromeLabelClass } from "@/features/course/lesson/workbench/shared/workbench-readability";

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
		<div className="rounded-none border border-product-border/55 bg-product-surface-strong/80 px-4 py-4">
			<p className={workbenchChromeLabelClass}>custom prompt</p>
			<p className="mt-2 text-[14px] font-semibold leading-[1.45] text-product-text">
				{resource.label}
			</p>
			{resource.body ? (
				<p className="mt-2 text-[13px] leading-[1.7] text-product-muted">
					{resource.body}
				</p>
			) : null}
			{disabledReason ? (
				<p className="mt-2 text-[13px] leading-[1.7] text-product-muted">
					{disabledReason}
				</p>
			) : null}
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<Button
					type="button"
					onClick={copyPrompt}
					disabled={Boolean(disabledReason)}
					variant="secondary"
					size="xs"
				>
					{copyState === "copied" ? "Copied" : "Copy prompt"}
				</Button>
				{copyState === "error" && !disabledReason ? (
					<p className="text-[12px] leading-[1.6] text-product-muted">
						Clipboard unavailable. Copy from the prompt block below.
					</p>
				) : null}
			</div>
			<div className="mt-3 rounded-none border border-product-border/55 bg-product-surface px-3 py-3">
				{prompt ? (
					<Textarea
						readOnly
						value={prompt}
						rows={14}
						className="w-full resize-y border-0 bg-transparent p-0 font-mono text-[12px] leading-[1.68] text-product-text"
						aria-label={`${resource.label} prompt`}
					/>
				) : (
					<p className="text-[12px] leading-[1.6] text-product-muted">
						The prompt will appear here once your chosen user and outcome are
						saved.
					</p>
				)}
			</div>
		</div>
	);
}
