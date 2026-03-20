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

import { copySkillsText } from "./skills-quickstart-clipboard";
import {
	PROMPT_EXAMPLES_BLOCK,
	PROMPT_PATTERN_TEMPLATE,
	SKILLS_QUICKSTART_FULL_COPY,
} from "./skills-quickstart-constants";

const patternTextareaId = "skills-quickstart-prompt-pattern";
const examplesTextareaId = "skills-quickstart-prompt-examples";

export function SkillsPromptPatternCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Prompt template</CardTitle>
				<CardDescription>
					Type <code className="text-foreground">$</code> then the skill slug,
					then your concrete task on the next lines.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor={patternTextareaId}>Pattern</Label>
					<Textarea
						id={patternTextareaId}
						readOnly
						className="min-h-[100px] resize-y font-mono text-xs"
						value={PROMPT_PATTERN_TEMPLATE}
					/>
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() =>
							void copySkillsText("Copied pattern", PROMPT_PATTERN_TEMPLATE)
						}
					>
						Copy pattern
					</Button>
				</div>
				<div className="space-y-2">
					<Label htmlFor={examplesTextareaId}>Examples</Label>
					<Textarea
						id={examplesTextareaId}
						readOnly
						className="min-h-[160px] resize-y font-mono text-xs"
						value={PROMPT_EXAMPLES_BLOCK}
					/>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() =>
								void copySkillsText("Copied examples", PROMPT_EXAMPLES_BLOCK)
							}
						>
							Copy examples
						</Button>
						<Button
							type="button"
							size="sm"
							onClick={() =>
								void copySkillsText(
									"Copied Skills Quickstart",
									SKILLS_QUICKSTART_FULL_COPY,
								)
							}
						>
							Copy full quickstart
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
