"use client";

import type { Preloaded } from "convex/react";
import { useConvexAuth, usePreloadedQuery, useQuery } from "convex/react";
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
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { ArtifactsBlockSection } from "@/features/course/artifacts/components/artifacts-block-section";
import {
	ArtifactsEmptyState,
	ArtifactsLoadingState,
} from "@/features/course/artifacts/components/artifacts-page-states";
import { groupArtifactsByBlock } from "@/features/course/artifacts/lib/group-artifacts-by-block";
import type { ArtifactPreview } from "@/features/course/lesson/model/registry";

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
								<Link href={routeConfig.mission}>Mission</Link>
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

function ArtifactsPageLive() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const artifacts = useQuery(
		api.course.listArtifacts,
		isAuthenticated && !isLoading ? {} : "skip",
	) as ArtifactPreview[] | undefined;

	return <ArtifactsPageContent artifacts={artifacts} />;
}

function ArtifactsPagePreloaded({
	preloadedArtifacts,
}: {
	preloadedArtifacts: Preloaded<typeof api.course.listArtifacts>;
}) {
	return (
		<ArtifactsPageContent
			artifacts={usePreloadedQuery(preloadedArtifacts) as ArtifactPreview[]}
		/>
	);
}

export function ArtifactsPage({
	preloadedArtifacts,
}: {
	preloadedArtifacts?: Preloaded<typeof api.course.listArtifacts> | null;
}) {
	return preloadedArtifacts ? (
		<ArtifactsPagePreloaded preloadedArtifacts={preloadedArtifacts} />
	) : (
		<ArtifactsPageLive />
	);
}
