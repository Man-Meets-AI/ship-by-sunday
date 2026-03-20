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
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemHeader,
	ItemSeparator,
	ItemTitle,
} from "@/components/ui/item";
import type { BlockGroup } from "@/features/course/artifacts/types";
import { getLessonHref } from "@/features/course/lesson/model/manifest";
import { ArtifactPreviewContent } from "@/features/course/lesson/workbench/shared/artifact-preview-content";

export type { BlockGroup } from "@/features/course/artifacts/types";

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
				<ItemGroup>
					{group.artifacts.map((artifact, index) => (
						<Fragment key={artifact.artifactKey}>
							{index > 0 ? <ItemSeparator className="my-4" /> : null}
							<Item variant="outline" className="flex-col items-stretch gap-3">
								<ItemHeader className="w-full">
									<ItemContent>
										<ItemDescription className="text-xs">
											{artifact.lessonId}
										</ItemDescription>
										<ItemTitle className="line-clamp-none">
											{artifact.artifactLabel}
										</ItemTitle>
										<ItemDescription>{artifact.lessonTitle}</ItemDescription>
									</ItemContent>
									<ItemActions>
										<Button asChild variant="outline" size="sm">
											<Link href={getLessonHref(artifact.lessonId)}>
												Open lesson
											</Link>
										</Button>
									</ItemActions>
								</ItemHeader>
								<Card className="bg-muted/30 p-0 shadow-none ring-1 ring-border">
									<CardContent className="px-3 py-3">
										<ArtifactPreviewContent
											artifact={artifact}
											maxTextFields={4}
										/>
									</CardContent>
								</Card>
							</Item>
						</Fragment>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
