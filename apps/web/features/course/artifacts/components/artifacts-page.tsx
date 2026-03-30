"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { ArtifactsBlockSection } from "@/features/course/artifacts/components/artifacts-block-section";
import {
	ArtifactsEmptyState,
	ArtifactsLoadingState,
} from "@/features/course/artifacts/components/artifacts-page-states";
import { groupArtifactsByBlock } from "@/features/course/artifacts/lib/group-artifacts-by-block";
import type { ArtifactPreview } from "@/features/course/lesson/model/registry";
import { getLessonMapHref } from "@/features/workspace-navigation/lib/lesson-map-href";

function ArtifactsPageContent({
	artifacts,
}: {
	artifacts: ArtifactPreview[] | undefined;
}) {
	const groups = artifacts ? groupArtifactsByBlock(artifacts) : [];
	const isBusy = artifacts === undefined;
	const total = artifacts?.length ?? 0;

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href={getLessonMapHref()}>Lesson Map</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Saved work</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<Card>
					<CardHeader>
						<CardTitle>Saved work</CardTitle>
						<CardDescription>
							Your completed lesson outputs in one place.
						</CardDescription>
						<CardAction>
							<Badge variant={isBusy ? "outline" : "secondary"}>
								{isBusy ? "Loading…" : `${total} saved`}
							</Badge>
						</CardAction>
					</CardHeader>
				</Card>

				{isBusy ? (
					<ArtifactsLoadingState />
				) : total === 0 ? (
					<ArtifactsEmptyState />
				) : (
					<div className="flex flex-col gap-6">
						{groups.map((group) => (
							<ArtifactsBlockSection key={group.block.id} group={group} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export function ArtifactsPage({
	initialArtifacts,
}: {
	initialArtifacts?: ArtifactPreview[] | null;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveArtifacts = useQuery(
		api.course.listArtifacts,
		isAuthenticated && !isLoading ? {} : "skip",
	) as ArtifactPreview[] | undefined;
	const artifacts = liveArtifacts ?? initialArtifacts ?? undefined;

	return <ArtifactsPageContent artifacts={artifacts} />;
}
