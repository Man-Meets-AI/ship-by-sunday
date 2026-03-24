"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { getBuildStarterTemplateRepoUrl } from "@/features/course/lesson/model/resources";
import {
	getStarterRepoTemplateLockReason,
	type StarterRepoAccessStatus,
} from "@/features/starter-repo/lib/starter-repo-access-copy";

export function CoreUxBuildTemplateCard() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const starterRepoAccess = useQuery(
		api.course.getStarterRepoAccess,
		isAuthenticated && !isLoading ? {} : "skip",
	) as
		| { status: Exclude<StarterRepoAccessStatus, "loading" | "none"> }
		| null
		| undefined;

	const starterRepoStatus: StarterRepoAccessStatus =
		starterRepoAccess === undefined
			? "loading"
			: starterRepoAccess === null
				? "none"
				: starterRepoAccess.status;
	const hasStarterRepoAccess = starterRepoStatus === "accepted";
	const templateRepoUrl = hasStarterRepoAccess
		? getBuildStarterTemplateRepoUrl()
		: null;
	const templateLockedReason = hasStarterRepoAccess
		? null
		: getStarterRepoTemplateLockReason(starterRepoStatus);

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">
					Ship by Sunday starter template
				</CardTitle>
				<CardDescription>
					This is the concrete repo you clone—not a vague “use a template”
					mention. Same starter as the Build track.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{templateRepoUrl ? (
					<Button size="sm" variant="secondary" asChild>
						<a href={templateRepoUrl} target="_blank" rel="noopener noreferrer">
							Open template on GitHub
						</a>
					</Button>
				) : (
					<Button size="sm" variant="outline" asChild>
						<Link href={routeConfig.mission}>
							Open Mission for starter access
						</Link>
					</Button>
				)}
				{templateLockedReason ? (
					<p className="text-xs text-muted-foreground">
						{templateLockedReason}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
