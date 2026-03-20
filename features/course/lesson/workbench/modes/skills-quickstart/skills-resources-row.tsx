"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { copySkillsText } from "./skills-quickstart-clipboard";
import {
	SKILL_OPEN_HINT,
	SKILL_PATH_CODEX,
	SKILL_PATH_CURSOR,
} from "./skills-quickstart-constants";

export function SkillsResourcesRow() {
	const pathsBlock = `Cursor / project:\n${SKILL_PATH_CURSOR}\n\nCodex:\n${SKILL_PATH_CODEX}\n\n${SKILL_OPEN_HINT}`;

	return (
		<div className="space-y-3">
			<Separator className="bg-border" />
			<div className="space-y-2">
				<h3 className="text-sm font-medium text-foreground">
					Open skill files on your machine
				</h3>
				<p className="text-xs leading-relaxed text-muted-foreground">
					Each skill is backed by a markdown (or similar) file. Find that folder
					in your editor, then open a skill to see what instructions the tool
					loads.
				</p>
				<div className="flex flex-wrap gap-2">
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
				</div>
			</div>
		</div>
	);
}
