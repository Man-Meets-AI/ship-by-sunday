"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { routeConfig, timingConfig } from "@/config/product";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import type { LessonPromptResourceContent } from "@/features/course/lesson/model/contracts";
import { getPromptTemplateState } from "@/features/course/lesson/model/research-prompt";
import type { PinnedArtifact } from "@/features/course/lesson/shells/types";

function getCopySuccessMessage(resource: LessonPromptResourceContent) {
	return (
		resource.copySuccessToastMessage ??
		"Copied prompt. Go paste it in your favorite model."
	);
}

export function CompetitorResearchPromptSection({
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
	const { prompt, disabledReason } = getPromptTemplateState(
		resource.promptTemplateId,
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

		void copyCoursePromptToClipboard(
			prompt,
			getCopySuccessMessage(resource),
		).then((result) => {
			if (result === "copied") {
				if (resetTimeoutRef.current !== null) {
					window.clearTimeout(resetTimeoutRef.current);
				}
				setCopyState("copied");
				resetTimeoutRef.current = window.setTimeout(() => {
					resetTimeoutRef.current = null;
					setCopyState("idle");
				}, timingConfig.promptCopyResetMs);
			} else if (result === "unavailable") {
				setCopyState("error");
			}
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2">
				<Badge variant="secondary">Lightweight</Badge>
				<Badge variant="outline">Directional</Badge>
			</div>
			<Alert>
				<AlertDescription>
					Existing competitors are a positive signal—not a reason to quit.
					Keep this pass quick and usable, not exhaustive.
				</AlertDescription>
			</Alert>
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-base">{resource.label}</CardTitle>
					{resource.body ? (
						<CardDescription>{resource.body}</CardDescription>
					) : null}
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={copyPrompt}
							disabled={Boolean(disabledReason)}
						>
							{copyState === "copied" ? "Copied" : "Copy prompt"}
						</Button>
						<Button type="button" variant="outline" size="sm" asChild>
							<Link href={`${routeConfig.settings}#codex-connection`}>
								Connect ChatGPT in settings
							</Link>
						</Button>
					</div>
					{copyState === "error" && !disabledReason ? (
						<p className="text-sm text-muted-foreground">
							Clipboard unavailable. Select and copy from the prompt below.
						</p>
					) : null}
					{disabledReason ? (
						<p className="text-sm text-muted-foreground">{disabledReason}</p>
					) : null}
					{prompt ? (
						<Textarea
							readOnly
							value={prompt}
							rows={12}
							className="min-h-[200px] resize-y font-mono text-xs leading-relaxed"
							aria-label={`${resource.label} full text`}
						/>
					) : (
						<p className="text-sm text-muted-foreground">
							Save your user and outcome from earlier lessons to generate this
							prompt.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
