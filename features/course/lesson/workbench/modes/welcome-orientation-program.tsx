"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
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
				<TabsList variant="line" className="w-full">
					{PROGRAM_TABS.map((tab) => (
						<TabsTrigger key={tab.id} value={tab.id}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
				{PROGRAM_TABS.map((tab) => (
					<TabsContent
						key={tab.id}
						value={tab.id}
						className="text-muted-foreground"
					>
						{tab.body}
					</TabsContent>
				))}
			</Tabs>
			<div className="space-y-2">
				<Label className="text-muted-foreground">Product Trinity</Label>
				<ItemGroup className="gap-2">
					{TRINITY.map((item) => (
						<Item key={item.title} variant="outline">
							<ItemContent>
								<ItemTitle>{item.title}</ItemTitle>
								<ItemDescription className="line-clamp-none">
									{item.body}
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</div>
		</div>
	);
}
