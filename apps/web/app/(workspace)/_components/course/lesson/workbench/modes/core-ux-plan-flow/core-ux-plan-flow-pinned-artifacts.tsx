"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells";

import { formatArtifactValue } from "../../shared/artifact-format";

export function CoreUxPlanFlowPinnedArtifacts({
	pinnedArtifacts,
}: {
	pinnedArtifacts: PinnedArtifact[];
}) {
	if (pinnedArtifacts.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			{pinnedArtifacts.map((artifact) => (
				<Card key={artifact.artifactKey}>
					<CardHeader className="space-y-1">
						<CardTitle className="text-base">
							{artifact.contextTitle ?? artifact.artifactLabel}
						</CardTitle>
						<CardDescription>{artifact.lessonTitle}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						{artifact.fields.map(([key, value]) => (
							<div key={key} className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground">
									{key}
								</p>
								<p className="leading-relaxed text-foreground">
									{formatArtifactValue(value)}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
