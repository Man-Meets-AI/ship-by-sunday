import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CODEX_COMMAND_MENU_COPY } from "@/lib/course/lesson/workbench/modes/ceo-skills-lesson-constants";

export function CeoSkillsCodexCommandCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Add or open a project</CardTitle>
				<CardDescription className="text-pretty">
					Use the shortcuts Codex documents—then search for the action by name.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="leading-relaxed text-muted-foreground">
					{CODEX_COMMAND_MENU_COPY}
				</p>
			</CardContent>
		</Card>
	);
}
