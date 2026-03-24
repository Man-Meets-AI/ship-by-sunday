"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { courseResourceConfig } from "@/config/product";

import {
	CEO_SKILL_EXAMPLES,
	CEO_SKILLS_STAGE_KEYS,
	CEO_SKILLS_STAGE_LABEL,
	CEO_SKILLS_WORKFLOW_STEPS,
	type CeoSkillsStageKey,
} from "./ceo-skills-lesson-constants";
import { CeoSkillsCodexSkillExamplesList } from "./ceo-skills-codex-skill-examples-list";

export function CeoSkillsCodexConceptTabs() {
	const [stage, setStage] = useState<CeoSkillsStageKey>("strategy");
	const filtered = CEO_SKILL_EXAMPLES.filter((s) => s.stage === stage);

	return (
		<Tabs defaultValue="app" className="w-full">
			<TabsList className="h-auto w-full flex-wrap justify-start gap-1">
				<TabsTrigger value="app" className="text-xs sm:text-sm">
					Codex app
				</TabsTrigger>
				<TabsTrigger value="skills" className="text-xs sm:text-sm">
					Skills
				</TabsTrigger>
				<TabsTrigger value="workflow" className="text-xs sm:text-sm">
					0 → 1 workflow
				</TabsTrigger>
			</TabsList>
			<TabsContent
				value="app"
				className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground"
			>
				<p>
					Codex is organized around{" "}
					<span className="font-medium text-foreground">threads</span> (the
					conversation),{" "}
					<span className="font-medium text-foreground">projects</span> (folders
					/ workspaces), and{" "}
					<span className="font-medium text-foreground">skills</span> (reusable
					job descriptions Codex can invoke).
				</p>
				<p>
					On desktop you can jump to skills via{" "}
					<Button variant="link" className="h-auto min-h-0 p-0" asChild>
						<a href={courseResourceConfig.codexLesson.codexSkillsDeeplink}>
							Open Skills (codex://skills)
						</a>
					</Button>
					—useful once the app is installed.
				</p>
			</TabsContent>
			<TabsContent value="skills" className="mt-3 space-y-4">
				<p className="text-sm leading-relaxed text-muted-foreground">
					Filter examples by stage—this is a{" "}
					<span className="font-medium text-foreground">guided subset</span>,
					not the full Codex catalog.
				</p>
				<ToggleGroup
					type="single"
					value={stage}
					onValueChange={(v) => {
						if (v) setStage(v as CeoSkillsStageKey);
					}}
					variant="outline"
					size="sm"
					className="flex flex-wrap justify-start gap-1"
				>
					{CEO_SKILLS_STAGE_KEYS.map((key) => (
						<ToggleGroupItem
							key={key}
							value={key}
							className="text-xs sm:text-sm"
						>
							{CEO_SKILLS_STAGE_LABEL[key]}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<CeoSkillsCodexSkillExamplesList examples={filtered} />
				<Separator />
				<p className="text-xs leading-relaxed text-muted-foreground">
					Browse the live catalog on{" "}
					<Button variant="link" className="h-auto min-h-0 p-0 text-xs" asChild>
						<a
							href={courseResourceConfig.codexLesson.openaiSkillsRepo}
							target="_blank"
							rel="noreferrer"
						>
							github.com/openai/skills
						</a>
					</Button>
					—including official examples such as Convex-related skills when you
					are ready.
				</p>
			</TabsContent>
			<TabsContent
				value="workflow"
				className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground"
			>
				<p>
					The course follows a simple{" "}
					<span className="font-medium text-foreground">0 → 1</span> spine:
					decide, clarify, ship a small version.
				</p>
				<ol className="list-decimal space-y-2 pl-4">
					{CEO_SKILLS_WORKFLOW_STEPS.map((step) => (
						<li key={step}>{step}</li>
					))}
				</ol>
			</TabsContent>
		</Tabs>
	);
}
