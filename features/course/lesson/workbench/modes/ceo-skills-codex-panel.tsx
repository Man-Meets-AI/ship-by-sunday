"use client";

import type { ReactNode } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { LessonContent } from "@/features/course/lesson/model/manifest";

import { CeoSkillsCodexAlerts } from "./ceo-skills-codex-alerts";
import { CeoSkillsCodexAnatomyCard } from "./ceo-skills-codex-anatomy-card";
import { CeoSkillsCodexCommandCard } from "./ceo-skills-codex-command-card";
import { CeoSkillsCodexConceptTabs } from "./ceo-skills-codex-concept-tabs";
import { CeoSkillsCodexDownloadCard } from "./ceo-skills-codex-download-card";
import { CeoSkillsCodexResourceButtons } from "./ceo-skills-codex-resource-buttons";
import { CeoSkillsCodexStarterCard } from "./ceo-skills-codex-starter-card";

export function CeoSkillsCodexPanel({
	lessonContent,
	workbenchCompletionSlot,
}: {
	lessonContent: LessonContent;
	workbenchCompletionSlot?: ReactNode;
}) {
	const purpose =
		lessonContent.lessonMeta.purpose ??
		"Orient to Codex layout, skills, and the 0 → 1 spine—then save a short project note.";

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-balance text-xl tracking-tight sm:text-2xl">
					Codex & skills
				</CardTitle>
				<CardDescription className="text-pretty leading-relaxed">
					{purpose}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<CeoSkillsCodexAlerts />
				<CeoSkillsCodexAnatomyCard />
				<CeoSkillsCodexCommandCard />
				<div className="space-y-2">
					<Label className="text-muted-foreground">Resources</Label>
					<CeoSkillsCodexResourceButtons />
				</div>
				<Separator />
				<CeoSkillsCodexConceptTabs />
				<Separator />
				<div className="grid gap-4 sm:grid-cols-2">
					<CeoSkillsCodexStarterCard />
					<CeoSkillsCodexDownloadCard />
				</div>
				{workbenchCompletionSlot ? (
					<>
						<Separator />
						<div className="flex flex-wrap gap-2">
							{workbenchCompletionSlot}
						</div>
					</>
				) : null}
			</CardContent>
		</Card>
	);
}
