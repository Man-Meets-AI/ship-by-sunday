"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	LessonContent,
	LessonLinkResourceContent,
	LessonResourceContent,
} from "@/features/course/lesson/model/manifest";

import { RepoMapCommandsTab } from "./repo-map-commands-tab";
import { REPO_MAP_SETUP_GUIDE_LINK_ID } from "./repo-map-constants";
import { RepoMapProjectMapTab } from "./repo-map-project-map-tab";

function isLinkResource(
	resource: LessonResourceContent,
): resource is LessonLinkResourceContent {
	return resource.kind !== "copy_prompt";
}

export function RepoMapOrientationPanel({
	lessonContent,
	workbenchCompletionSlot,
}: {
	lessonContent: LessonContent;
	workbenchCompletionSlot?: ReactNode;
}) {
	const links = (lessonContent.coach.resources ?? []).filter(isLinkResource);
	const setupGuide = links.find((r) => r.id === REPO_MAP_SETUP_GUIDE_LINK_ID);

	return (
		<div className="space-y-4">
			<Alert>
				<AlertDescription className="text-sm leading-relaxed">
					You will not write code in this lesson—this panel is a cheat sheet you
					can revisit. You do not need to memorize paths; anchor on where to
					look in VS Code.
				</AlertDescription>
			</Alert>
			<div className="flex flex-wrap gap-2">
				{setupGuide ? (
					<Button variant="secondary" size="sm" asChild>
						<Link
							href={setupGuide.href}
							target={setupGuide.kind === "external" ? "_blank" : undefined}
							rel={
								setupGuide.kind === "external"
									? "noopener noreferrer"
									: undefined
							}
						>
							{setupGuide.label}
						</Link>
					</Button>
				) : null}
			</div>
			<Tabs defaultValue="map" className="w-full">
				<TabsList className="w-full flex-wrap justify-start">
					<TabsTrigger value="map">Project map</TabsTrigger>
					<TabsTrigger value="commands">Commands</TabsTrigger>
				</TabsList>
				<TabsContent value="map" className="mt-4">
					<RepoMapProjectMapTab />
				</TabsContent>
				<TabsContent value="commands" className="mt-4">
					<RepoMapCommandsTab />
				</TabsContent>
			</Tabs>
			<Separator />
			{workbenchCompletionSlot ? (
				<div className="flex flex-wrap gap-2">{workbenchCompletionSlot}</div>
			) : null}
		</div>
	);
}
