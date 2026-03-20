"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PROGRAM_TABS = [
	{
		id: "lessons",
		label: "Lessons",
		body: "Guided reps through CEO, Design, Build, and Ship—each step produces something you keep.",
	},
	{
		id: "software",
		label: "Software",
		body: "You ship a small web app this weekend. AI speeds implementation; scope stays intentionally tight.",
	},
	{
		id: "tools",
		label: "Tools & Templates",
		body: "Downloads and references live in this panel so setup stays one click away, not a side quest.",
	},
] as const;

const TRINITY = [
	{
		title: "Product Strategy",
		body: 'Who it is for, what problem you solve, and what "done" looks like by Sunday.',
	},
	{
		title: "UX",
		body: "Just enough flow and UI clarity to build without redesigning mid-sprint.",
	},
	{
		title: "Coding",
		body: "Implementation with AI as a lever—reps over perfection, working software over theory.",
	},
] as const;

export function WelcomeOrientationProgram() {
	return (
		<div className="space-y-4">
			<Tabs defaultValue="lessons" className="w-full">
				<TabsList className="h-auto w-full flex-wrap justify-start gap-1">
					{PROGRAM_TABS.map((tab) => (
						<TabsTrigger
							key={tab.id}
							value={tab.id}
							className="text-xs sm:text-sm"
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
				{PROGRAM_TABS.map((tab) => (
					<TabsContent
						key={tab.id}
						value={tab.id}
						className="mt-3 text-sm leading-relaxed text-muted-foreground"
					>
						{tab.body}
					</TabsContent>
				))}
			</Tabs>
			<div>
				<p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Product Trinity
				</p>
				<div className="grid gap-2 sm:grid-cols-3">
					{TRINITY.map((item) => (
						<Card key={item.title} className="gap-0 py-0">
							<CardHeader className="border-b border-border pb-2 pt-3">
								<CardTitle className="text-xs font-medium text-foreground">
									{item.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-2 pb-3">
								<CardDescription className="text-xs leading-relaxed text-muted-foreground">
									{item.body}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
