"use client";

import { useEffect, useRef, useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
	CHATGPT_ORIGIN_URL,
	CORE_UX_BUILD_STRATEGY_FALLBACK_PROMPT,
} from "./core-ux-build-constants";

type Props = {
	strategyField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
};

export function CoreUxBuildStrategyPanel({
	strategyField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: Props) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetRef = useRef<number | null>(null);
	const promptText = String(fieldValues[strategyField.id] ?? "");

	useEffect(() => {
		return () => {
			if (resetRef.current !== null) {
				window.clearTimeout(resetRef.current);
			}
		};
	}, []);

	const copyPrompt = () => {
		void copyCoursePromptToClipboard(
			promptText,
			"Copied strategy prompt.",
		).then((result) => {
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
		});
	};

	const applyFallback = () => {
		onFieldChange(strategyField.id, CORE_UX_BUILD_STRATEGY_FALLBACK_PROMPT);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
				<div className="space-y-1">
					<CardTitle className="text-base">Strategy prompt</CardTitle>
					<CardDescription>
						Edit if needed, then copy into ChatGPT and save the result in your
						notes—check “Set strategy” in onboarding when done.
					</CardDescription>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						size="sm"
						variant="secondary"
						onClick={copyPrompt}
					>
						{copyState === "copied"
							? "Copied"
							: copyState === "error"
								? "Retry copy"
								: "Copy"}
					</Button>
					<Button type="button" size="sm" variant="outline" asChild>
						<a href={CHATGPT_ORIGIN_URL} target="_blank" rel="noreferrer">
							Open in ChatGPT
						</a>
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<FieldControl
					field={strategyField}
					value={fieldValues[strategyField.id]}
					onChange={(value) => onFieldChange(strategyField.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(strategyField.id)}
				/>
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="no-strategy">
						<AccordionTrigger className="text-sm">
							I don’t have a strategy yet
						</AccordionTrigger>
						<AccordionContent className="space-y-3 text-sm text-muted-foreground">
							<p>
								Use a placeholder so you are not blocked—replace it after your
								next scope pass.
							</p>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={applyFallback}
							>
								Paste minimal strategy skeleton
							</Button>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}
