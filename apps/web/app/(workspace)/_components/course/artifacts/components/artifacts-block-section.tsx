"use client";

import Link from "next/link";
import { Fragment } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BlockGroup } from "@/lib/course/artifacts/types";
import { getLessonHref } from "@/lib/course/lesson/routing/lesson-routes";
import { ArtifactPreviewContent } from "@/app/(workspace)/_components/course/artifacts/preview/artifact-preview-content";

export type { BlockGroup } from "@/lib/course/artifacts/types";

export function ArtifactsBlockSection({ group }: { group: BlockGroup }) {
	const count = group.artifacts.length;
	const countLabel = `${count} ${count === 1 ? "artifact" : "artifacts"}`;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{group.block.label}</CardTitle>
				<CardAction>
					<Badge variant="secondary">{countLabel}</Badge>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-6">
					{group.artifacts.map((artifact, index) => (
						<Fragment key={artifact.artifactKey}>
							{index > 0 ? <Separator /> : null}
							<div className="flex flex-col gap-3">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
									<div className="min-w-0 space-y-1">
										<p className="text-xs text-muted-foreground">
											{artifact.lessonId}
										</p>
										<p className="text-base font-medium leading-snug">
											{artifact.artifactLabel}
										</p>
										<p className="text-sm text-muted-foreground">
											{artifact.lessonTitle}
										</p>
									</div>
									<Button
										asChild
										variant="outline"
										size="sm"
										className="w-full shrink-0 sm:w-auto"
									>
										<Link href={getLessonHref(artifact.lessonKey)}>
											Open lesson
										</Link>
									</Button>
								</div>
								<Card className="bg-muted/30 p-0 shadow-none ring-1 ring-border">
									<CardContent className="px-3 py-3">
										<ArtifactPreviewContent
											artifact={artifact}
											maxTextFields={4}
										/>
									</CardContent>
								</Card>
							</div>
						</Fragment>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
