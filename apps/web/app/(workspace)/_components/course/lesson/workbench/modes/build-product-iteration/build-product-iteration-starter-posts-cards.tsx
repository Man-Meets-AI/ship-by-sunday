"use client";

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
import { copyCoursePromptToClipboard } from "@/lib/course/lesson/lib/copy-course-prompt";
import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";

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
						<div className="space-y-2">
							<Label htmlFor={starterField.id}>{starterField.label}</Label>
							<Textarea
								id={starterField.id}
								rows={starterField.rows ?? 6}
								placeholder={starterField.placeholder}
								value={starterVal}
								onChange={(event) =>
									onFieldChange(starterField.id, event.target.value)
								}
								className={
									invalidFieldIds.has(starterField.id)
										? "border-destructive"
										: undefined
								}
							/>
							{fieldMessage(starterField.id) ? (
								<p className="text-sm text-destructive">
									{fieldMessage(starterField.id)}
								</p>
							) : null}
						</div>
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
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={copyExport}
					>
						Export all outputs
					</Button>
				</CardHeader>
				<CardContent>
					{postsField ? (
						<div className="space-y-2">
							<Label htmlFor={postsField.id}>{postsField.label}</Label>
							<Textarea
								id={postsField.id}
								rows={postsField.rows ?? 6}
								placeholder={postsField.placeholder}
								value={postsVal}
								onChange={(event) =>
									onFieldChange(postsField.id, event.target.value)
								}
								className={
									invalidFieldIds.has(postsField.id)
										? "border-destructive"
										: undefined
								}
							/>
							{fieldMessage(postsField.id) ? (
								<p className="text-sm text-destructive">
									{fieldMessage(postsField.id)}
								</p>
							) : null}
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
