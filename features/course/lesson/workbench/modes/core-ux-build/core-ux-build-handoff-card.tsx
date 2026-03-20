"use client";

import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { timingConfig } from "@/config/product";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldControl } from "../../fields/field-control";

type Props = {
	briefField: WorkbenchField;
	handoffChecklistField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
};

export function CoreUxBuildHandoffCard({
	briefField,
	handoffChecklistField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: Props) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetRef = useRef<number | null>(null);
	const briefText = String(fieldValues[briefField.id] ?? "");

	useEffect(() => {
		return () => {
			if (resetRef.current !== null) {
				window.clearTimeout(resetRef.current);
			}
		};
	}, []);

	const copyBrief = () => {
		void copyCoursePromptToClipboard(briefText, "Copied Codex brief.").then(
			(result) => {
				if (resetRef.current !== null) {
					window.clearTimeout(resetRef.current);
				}
				if (result === "copied") {
					setCopyState("copied");
					resetRef.current = window.setTimeout(() => {
						resetRef.current = null;
						setCopyState("idle");
					}, timingConfig.promptCopyResetMs);
				} else {
					setCopyState("error");
				}
			},
		);
	};

	const briefInvalid = invalidFieldIds.has(briefField.id);
	const checklistInvalid = invalidFieldIds.has(handoffChecklistField.id);
	const briefMessage =
		invalidFieldMessages.get(briefField.id) ??
		"Write or dictate your implementation brief for Codex.";
	const checklistMessage =
		invalidFieldMessages.get(handoffChecklistField.id) ??
		"Check both lines when the photo and brief are captured.";

	return (
		<Card>
			<CardHeader className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-base">Codex handoff</CardTitle>
					<Badge variant="secondary">Deliverable</Badge>
				</div>
				<CardDescription>
					Exact next-step artifact for implementation—not a draft post.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert>
					<AlertTitle>What you ship from this lesson</AlertTitle>
					<AlertDescription className="space-y-2">
						<ol className="list-decimal space-y-1 pl-4 text-sm">
							<li>
								Take <strong>one photo</strong> that shows{" "}
								<strong>all five core UX screens</strong> for this flow in a
								single frame.
							</li>
							<li>
								<strong>Dictate or write</strong> the implementation brief for
								Codex (use the template below).
							</li>
						</ol>
					</AlertDescription>
				</Alert>
				<div className="flex flex-wrap justify-end gap-2">
					<Button
						type="button"
						size="sm"
						variant="secondary"
						onClick={copyBrief}
					>
						{copyState === "copied"
							? "Copied"
							: copyState === "error"
								? "Retry copy"
								: "Copy brief"}
					</Button>
				</div>
				<FieldControl
					field={briefField}
					value={fieldValues[briefField.id]}
					onChange={(value) => onFieldChange(briefField.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={briefInvalid}
				/>
				{briefInvalid ? (
					<p className="text-sm text-destructive">{briefMessage}</p>
				) : null}
				<FieldControl
					field={handoffChecklistField}
					value={fieldValues[handoffChecklistField.id]}
					onChange={(value) => onFieldChange(handoffChecklistField.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={checklistInvalid}
				/>
				{checklistInvalid ? (
					<p className="text-sm text-destructive">{checklistMessage}</p>
				) : null}
			</CardContent>
		</Card>
	);
}
