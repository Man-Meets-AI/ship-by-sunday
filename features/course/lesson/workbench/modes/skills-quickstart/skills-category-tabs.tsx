"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { copySkillsText } from "./skills-quickstart-clipboard";
import {
	SKILL_ROLE_LABEL,
	SKILL_TABS,
	SKILLS_BY_TAB,
	type SkillEntry,
	type SkillRole,
} from "./skills-quickstart-skills-data";

function roleBadgeVariant(role: SkillRole): "default" | "secondary" | "outline" {
	if (role === "auth") {
		return "default";
	}
	if (role === "data") {
		return "secondary";
	}
	return "outline";
}

function SkillRow({ entry }: { entry: SkillEntry }) {
	const tagged = `$${entry.slug}`;
	return (
		<div className="flex flex-col gap-2 rounded-md border border-border/80 bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0 space-y-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-medium text-foreground">{entry.title}</span>
					<Badge variant={roleBadgeVariant(entry.role)} className="text-[10px]">
						{SKILL_ROLE_LABEL[entry.role]}
					</Badge>
				</div>
				<p className="text-xs leading-relaxed text-muted-foreground">
					{entry.description}
				</p>
				<code className="block truncate text-[11px] text-foreground/80">
					{tagged}
				</code>
			</div>
			<Button
				type="button"
				variant="secondary"
				size="sm"
				className="shrink-0"
				onClick={() => void copySkillsText("Copied tag", tagged)}
			>
				Copy $tag
			</Button>
		</div>
	);
}

export function SkillsCategoryTabs() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Skills to recognize</CardTitle>
				<CardDescription>
					Representative specialists from the lesson. Your installed list may
					differ — match names in Codex / Cursor to what you see here.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="clerk" className="gap-4">
					<TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1">
						{SKILL_TABS.map((tab) => (
							<TabsTrigger key={tab.id} value={tab.id} className="flex-none">
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					{SKILL_TABS.map((tab) => (
						<TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-3">
							{SKILLS_BY_TAB[tab.id].map((entry) => (
								<SkillRow key={entry.slug} entry={entry} />
							))}
						</TabsContent>
					))}
				</Tabs>
			</CardContent>
		</Card>
	);
}
