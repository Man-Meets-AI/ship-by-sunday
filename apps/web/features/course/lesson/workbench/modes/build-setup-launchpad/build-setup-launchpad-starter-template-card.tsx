"use client";

import { useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { copyLessonTextToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";

import { BUILD_SETUP_STARTER_DESCRIPTION } from "./build-setup-launchpad-constants";

type BuildSetupLaunchpadStarterTemplateCardProps = {
	templateRepoUrl: string | null;
	templateLockedReason: string | null;
	canonicalRepoUrl: string;
};

export function BuildSetupLaunchpadStarterTemplateCard({
	templateRepoUrl,
	templateLockedReason,
	canonicalRepoUrl,
}: BuildSetupLaunchpadStarterTemplateCardProps) {
	const [copied, setCopied] = useState(false);
	const href = templateRepoUrl ?? canonicalRepoUrl;

	const copyRepo = useCallback(async () => {
		const result = await copyLessonTextToClipboard(href, "Repo URL copied.");
		if (result === "copied") {
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} else {
			setCopied(false);
		}
	}, [href]);

	return (
		<Card>
			<CardHeader className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-base">Ship by Sunday Starter</CardTitle>
					<Badge>Required</Badge>
				</div>
				<CardDescription>{BUILD_SETUP_STARTER_DESCRIPTION}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
				{templateRepoUrl ? (
					<Button asChild className="w-full sm:w-auto">
						<a href={templateRepoUrl} target="_blank" rel="noopener noreferrer">
							Open template on GitHub
						</a>
					</Button>
				) : (
					<p className="text-sm text-muted-foreground">
						{templateLockedReason}
					</p>
				)}
				<Button
					type="button"
					variant="outline"
					className="w-full sm:w-auto"
					onClick={copyRepo}
				>
					{copied ? "Copied" : "Copy repo URL"}
				</Button>
			</CardContent>
		</Card>
	);
}
