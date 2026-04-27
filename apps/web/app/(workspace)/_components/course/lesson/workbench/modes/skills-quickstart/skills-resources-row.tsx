"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { copySkillsText } from "./skills-quickstart-clipboard";
import {
	SKILL_OPEN_HINT,
	SKILL_PATH_CODEX,
	SKILL_PATH_CURSOR,
} from "@/lib/course/lesson/workbench/modes/skills-quickstart/skills-quickstart-constants";

export function SkillsResourcesRow() {
	const pathsBlock = `Cursor / project:\n${SKILL_PATH_CURSOR}\n\nCodex:\n${SKILL_PATH_CODEX}\n\n${SKILL_OPEN_HINT}`;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Open skill files on your machine</CardTitle>
				<CardDescription>
					Each skill is backed by a markdown (or similar) file. Find that folder
					in your editor, then open a skill to see what instructions the tool
					loads.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() =>
						void copySkillsText("Copied Cursor path", SKILL_PATH_CURSOR)
					}
				>
					Copy Cursor path hint
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() =>
						void copySkillsText("Copied Codex path", SKILL_PATH_CODEX)
					}
				>
					Copy Codex path
				</Button>
				<Button
					type="button"
					size="sm"
					onClick={() =>
						void copySkillsText("Copied skill locations", pathsBlock)
					}
				>
					Copy all path notes
				</Button>
			</CardContent>
		</Card>
	);
}
