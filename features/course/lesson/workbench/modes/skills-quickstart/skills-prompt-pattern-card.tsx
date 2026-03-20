"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { copySkillsText } from "./skills-quickstart-clipboard";
import {
	PROMPT_EXAMPLES_BLOCK,
	PROMPT_PATTERN_TEMPLATE,
	SKILLS_QUICKSTART_FULL_COPY,
} from "./skills-quickstart-constants";

export function SkillsPromptPatternCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Prompt template</CardTitle>
				<CardDescription>
					Type <code className="text-foreground">$</code> then the skill slug,
					then your concrete task on the next lines.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">Pattern</p>
					<Textarea
						readOnly
						className="min-h-[100px] resize-y font-mono text-xs"
						value={PROMPT_PATTERN_TEMPLATE}
						aria-label="Skill prompt pattern"
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
					<p className="text-xs font-medium text-muted-foreground">Examples</p>
					<Textarea
						readOnly
						className="min-h-[160px] resize-y font-mono text-xs"
						value={PROMPT_EXAMPLES_BLOCK}
						aria-label="Example tagged prompts"
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
