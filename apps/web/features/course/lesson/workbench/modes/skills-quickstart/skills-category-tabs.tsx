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
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Kbd } from "@/components/ui/kbd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { copySkillsText } from "./skills-quickstart-clipboard";
import {
	SKILL_ROLE_LABEL,
	SKILL_TABS,
	SKILLS_BY_TAB,
	type SkillEntry,
	type SkillRole,
} from "./skills-quickstart-skills-data";

function roleBadgeVariant(
	role: SkillRole,
): "default" | "secondary" | "outline" {
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
		<Item variant="outline" size="sm">
			<ItemContent className="min-w-0 flex-1">
				<ItemTitle className="flex w-full min-w-0 flex-wrap items-center gap-2">
					<span className="min-w-0">{entry.title}</span>
					<Badge
						variant={roleBadgeVariant(entry.role)}
						className="text-[10px] shrink-0"
					>
						{SKILL_ROLE_LABEL[entry.role]}
					</Badge>
				</ItemTitle>
				<ItemDescription className="line-clamp-none text-xs leading-relaxed">
					{entry.description}
				</ItemDescription>
				<ItemFooter className="min-w-0 justify-start">
					<Kbd className="max-w-full truncate font-mono text-[11px]">
						{tagged}
					</Kbd>
				</ItemFooter>
			</ItemContent>
			<ItemActions className="shrink-0">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => void copySkillsText("Copied tag", tagged)}
				>
					Copy $tag
				</Button>
			</ItemActions>
		</Item>
	);
}

export function SkillsCategoryTabs() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Skills to recognize</CardTitle>
				<CardDescription>
					Representative specialists from the lesson. Your installed list may
					differ — match names in Codex / Cursor to what you see here.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="clerk" className="gap-4">
					<TabsList className="h-auto w-full flex-wrap">
						{SKILL_TABS.map((tab) => (
							<TabsTrigger key={tab.id} value={tab.id}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					{SKILL_TABS.map((tab) => (
						<TabsContent key={tab.id} value={tab.id} className="mt-0">
							<ItemGroup className="gap-3">
								{SKILLS_BY_TAB[tab.id].map((entry) => (
									<SkillRow key={entry.slug} entry={entry} />
								))}
							</ItemGroup>
						</TabsContent>
					))}
				</Tabs>
			</CardContent>
		</Card>
	);
}
