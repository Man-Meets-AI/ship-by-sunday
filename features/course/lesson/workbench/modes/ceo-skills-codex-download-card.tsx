import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CEO_SKILLS_SKILLS_INSTALL_COPY } from "./ceo-skills-lesson-constants";

export function CeoSkillsCodexDownloadCard() {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="space-y-1 border-b border-border pb-3">
				<CardTitle className="text-base font-semibold">
					What’s in the download
				</CardTitle>
				<CardDescription className="text-pretty text-sm">
					The ZIP is the official OpenAI skills repository snapshot—text-first skill
					folders you can copy or cherry-pick.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-3 pb-4">
				<p className="text-sm leading-relaxed text-muted-foreground">
					{CEO_SKILLS_SKILLS_INSTALL_COPY}
				</p>
			</CardContent>
		</Card>
	);
}
