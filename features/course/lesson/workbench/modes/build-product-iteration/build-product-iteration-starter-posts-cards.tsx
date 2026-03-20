"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { BuildProductIterationTextareaField } from "./build-product-iteration-textarea-field";

type Props = {
	starterField: WorkbenchField | undefined;
	postsField: WorkbenchField | undefined;
	starterVal: string;
	postsVal: string;
	strategyVal: string;
	designVal: string;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	fieldMessage: (fieldId: string) => string | null;
};

export function BuildProductIterationStarterPostsCards({
	starterField,
	postsField,
	starterVal,
	postsVal,
	strategyVal,
	designVal,
	onFieldChange,
	invalidFieldIds,
	fieldMessage,
}: Props) {
	const exportMarkdown = [
		"## Brand strategy instructions",
		strategyVal.trim() || "_empty_",
		"",
		"## Brand design instructions",
		designVal.trim() || "_empty_",
		"",
		"## Starter idea",
		starterVal.trim() || "_empty_",
		"",
		"## Generated posts",
		postsVal.trim() || "_empty_",
	].join("\n");

	const copyPosts = () => {
		void copyCoursePromptToClipboard(postsVal, "Copied posts.");
	};

	const copyExport = () => {
		void copyCoursePromptToClipboard(
			exportMarkdown,
			"Copied all outputs as markdown.",
		);
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Starter ideas</CardTitle>
					<CardDescription>
						After brand instructions exist, pick one angle you will test first.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{starterField ? (
						<BuildProductIterationTextareaField
							field={starterField}
							value={starterVal}
							onChange={(next) => onFieldChange(starterField.id, next)}
							invalid={invalidFieldIds.has(starterField.id)}
							message={fieldMessage(starterField.id)}
						/>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
					<div className="space-y-1">
						<CardTitle className="text-base">Generated posts</CardTitle>
						<CardDescription>
							Capture your first batch of v1 posts—this lesson ends with real
							output, not only setup.
						</CardDescription>
					</div>
					<Button type="button" size="sm" variant="outline" onClick={copyExport}>
						Export all outputs
					</Button>
				</CardHeader>
				<CardContent>
					{postsField ? (
						<div className="space-y-2">
							<BuildProductIterationTextareaField
								field={postsField}
								value={postsVal}
								onChange={(next) => onFieldChange(postsField.id, next)}
								invalid={invalidFieldIds.has(postsField.id)}
								message={fieldMessage(postsField.id)}
							/>
							<Button
								type="button"
								size="sm"
								variant="ghost"
								onClick={copyPosts}
							>
								Copy posts
							</Button>
						</div>
					) : null}
				</CardContent>
			</Card>
		</>
	);
}
