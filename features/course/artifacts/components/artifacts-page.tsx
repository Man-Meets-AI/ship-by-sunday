"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	ArtifactsBlockSection,
	type BlockGroup,
} from "@/features/course/artifacts/components/artifacts-block-section";
import {
	getLessonById,
	getOrderedBlocks,
	type ArtifactPreview,
} from "@/features/course/lesson/model/registry";
import { AppShell } from "@/features/course/shared/components/app-shell";

function groupByBlock(artifacts: ArtifactPreview[]): BlockGroup[] {
	const orderedBlocks = getOrderedBlocks();
	const buckets = new Map<string, ArtifactPreview[]>();

	for (const artifact of artifacts) {
		const lesson = getLessonById(artifact.lessonId);
		const blockId = lesson?.block ?? "CEO";
		const list = buckets.get(blockId) ?? [];
		list.push(artifact);
		buckets.set(blockId, list);
	}

	return orderedBlocks
		.filter((block) => buckets.has(block.id))
		.map((block) => ({
			block,
			artifacts: buckets.get(block.id)!,
		}));
}

function LoadingState() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-36" />
				<Skeleton className="mt-2 h-4 w-full max-w-md" />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-28 w-full rounded-md" />
				<Skeleton className="h-28 w-full rounded-md" />
			</CardContent>
		</Card>
	);
}

function EmptyState() {
	return (
		<Card>
			<CardHeader className="text-center sm:text-left">
				<CardTitle>No saved work yet</CardTitle>
				<CardDescription>
					Finish a lesson and your outputs show up here, grouped by course
					block.
				</CardDescription>
			</CardHeader>
			<CardFooter className="justify-center sm:justify-start">
				<Button asChild>
					<Link href={routeConfig.mission}>Go to mission</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

export function ArtifactsPage() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const artifacts = useQuery(
		api.course.listArtifacts,
		isAuthenticated && !isLoading ? {} : "skip",
	) as ArtifactPreview[] | undefined;

	const groups = artifacts ? groupByBlock(artifacts) : [];
	const isBusy = artifacts === undefined;
	const total = artifacts?.length ?? 0;

	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<div className="flex flex-1 flex-col gap-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="min-w-0 space-y-1">
						<h1 className="text-2xl font-semibold">Saved work</h1>
						<p className="text-sm text-muted-foreground">
							Your completed lesson outputs in one place.
						</p>
					</div>
					<Badge variant={isBusy ? "outline" : "secondary"} className="w-fit">
						{isBusy ? "Loading…" : `${total} saved`}
					</Badge>
				</div>

				{isBusy ? (
					<LoadingState />
				) : total === 0 ? (
					<EmptyState />
				) : (
					<div className="flex flex-1 flex-col gap-6">
						{groups.map((group) => (
							<ArtifactsBlockSection key={group.block.id} group={group} />
						))}
					</div>
				)}
			</div>
		</AppShell>
	);
}
