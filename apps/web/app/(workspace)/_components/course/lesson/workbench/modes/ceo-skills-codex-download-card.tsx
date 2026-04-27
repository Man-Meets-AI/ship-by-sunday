import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CEO_SKILLS_SKILLS_INSTALL_COPY } from "@/lib/course/lesson/workbench/modes/ceo-skills-lesson-constants";

export function CeoSkillsCodexDownloadCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>What’s in the download</CardTitle>
				<CardDescription className="text-pretty">
					The ZIP is the official OpenAI skills repository snapshot—text-first
					skill folders you can copy or cherry-pick.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="leading-relaxed text-muted-foreground">
					{CEO_SKILLS_SKILLS_INSTALL_COPY}
				</p>
			</CardContent>
		</Card>
	);
}
