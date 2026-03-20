import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CODEX_COMMAND_MENU_COPY } from "./ceo-skills-lesson-constants";

export function CeoSkillsCodexCommandCard() {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="space-y-1 border-b border-border pb-3">
				<CardTitle className="text-base font-semibold">
					Add or open a project
				</CardTitle>
				<CardDescription className="text-pretty text-sm">
					Use the shortcuts Codex documents—then search for the action by name.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2 pt-3 pb-4">
				<p className="text-sm leading-relaxed text-muted-foreground">
					{CODEX_COMMAND_MENU_COPY}
				</p>
			</CardContent>
		</Card>
	);
}
