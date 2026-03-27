"use client";

import { useId } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LessonPromptResourceContent } from "@/features/course/lesson/model/contracts";

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
		<Card>
			<CardHeader>
				<CardTitle>{resource.label}</CardTitle>
				<CardDescription>
					Copy this prompt and fill in the bracketed placeholders before pasting
					it into your model.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{disabledReason ? (
					<Alert>
						<AlertDescription>{disabledReason}</AlertDescription>
					</Alert>
				) : null}
				<div className="flex flex-col gap-2">
					<Button
						type="button"
						onClick={copyPrompt}
						disabled={Boolean(disabledReason)}
						variant="secondary"
						size="sm"
						className="w-fit"
					>
						{copyState === "copied" ? "Copied" : "Copy prompt"}
					</Button>
					{copyState === "error" && !disabledReason ? (
						<Alert>
							<AlertDescription>
								Clipboard unavailable. Copy from the prompt block below.
							</AlertDescription>
						</Alert>
					) : null}
				</div>
				{prompt ? (
					<div className="space-y-2">
						<Label htmlFor={promptFieldId}>{`${resource.label} prompt`}</Label>
						<Textarea
							id={promptFieldId}
							readOnly
							value={prompt}
							rows={14}
							className="min-h-[240px] resize-y font-mono text-sm leading-relaxed"
						/>
					</div>
				) : (
					<CardDescription>
						The prompt will appear here once this lesson includes copy text.
					</CardDescription>
				)}
			</CardContent>
		</Card>
	);
}
