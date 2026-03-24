"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { routeConfig, starterRepoConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	getStarterRepoCardBody,
	getStarterRepoCardTitle,
	getStarterRepoStatusLabel,
	type StarterRepoAccessStatus,
	type StarterRepoAccessSurface,
} from "@/features/starter-repo/lib/starter-repo-access-copy";
import { StarterRepoAccessForm } from "./starter-repo-access-form";

type StarterRepoAccessRecord = {
	githubUsername: string;
	status: Exclude<StarterRepoAccessStatus, "loading" | "none">;
	requestedAt: number;
	updatedAt: number;
	invitedAt?: number;
	acceptedAt?: number;
	lastError?: string;
};

function StatusBadge({ status }: { status: StarterRepoAccessStatus }) {
	const variant =
		status === "accepted"
			? "secondary"
			: status === "failed"
				? "destructive"
				: status === "requested" || status === "invited" || status === "loading"
					? "outline"
					: "outline";

	return <Badge variant={variant}>{getStarterRepoStatusLabel(status)}</Badge>;
}

function formatUsername(record: StarterRepoAccessRecord | null | undefined) {
	return record ? `@${record.githubUsername}` : null;
}

export function StarterRepoAccessCard({
	surface,
}: {
	surface: StarterRepoAccessSurface;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const record = useQuery(
		api.course.getStarterRepoAccess,
		isAuthenticated && !isLoading ? {} : "skip",
	) as StarterRepoAccessRecord | null | undefined;
	const [isEditingRequested, setIsEditingRequested] = useState(
		() => !record || record.status === "failed",
	);

	useEffect(() => {
		if (!record || record.status === "failed") {
			setIsEditingRequested(true);
			return;
		}

		if (record.status === "requested") {
			setIsEditingRequested(false);
		}
	}, [record]);

	const status: StarterRepoAccessStatus =
		record === undefined ? "loading" : record === null ? "none" : record.status;
	if (surface === "mission" && status === "accepted") {
		return null;
	}

	const usernameLabel = formatUsername(record);
	const showForm =
		status === "none" ||
		status === "failed" ||
		(status === "requested" && isEditingRequested);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-balance">
					<span className="mb-1 block text-sm font-normal text-muted-foreground">
						Starter repository
					</span>
					<span className="block leading-snug">
						{getStarterRepoCardTitle(surface, status)}
					</span>
				</CardTitle>
				<CardDescription className="text-pretty">
					{getStarterRepoCardBody(surface, status)}
				</CardDescription>
				<CardAction>
					<StatusBadge status={status} />
				</CardAction>
			</CardHeader>
			<Separator />
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-1">
					<p className="text-sm font-medium text-foreground">
						{starterRepoConfig.owner}/{starterRepoConfig.repo}
					</p>
					{usernameLabel ? (
						<p className="text-sm text-muted-foreground">
							GitHub <span className="text-foreground">{usernameLabel}</span>
						</p>
					) : null}
				</div>
				<Separator />
				<div className="space-y-4">
					{status === "failed" && record?.lastError ? (
						<Alert variant="destructive">
							<AlertTitle>Provisioning failed</AlertTitle>
							<AlertDescription>
								Last error: {record.lastError}
							</AlertDescription>
						</Alert>
					) : null}
					{showForm ? (
						<StarterRepoAccessForm
							initialUsername={record?.githubUsername ?? ""}
							onSubmitted={() => setIsEditingRequested(false)}
							surface={surface}
						/>
					) : (
						<div className="flex flex-wrap gap-3">
							{status === "requested" ? (
								<Button
									type="button"
									onClick={() => setIsEditingRequested(true)}
									variant="outline"
									size="sm"
								>
									Edit username
								</Button>
							) : null}
							{status === "invited" || status === "accepted" ? (
								<Button asChild variant="secondary" size="sm">
									<a
										href={starterRepoConfig.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										Open starter repo
									</a>
								</Button>
							) : null}
							{surface === "mission" ? (
								<Button asChild variant="outline" size="sm">
									<Link href={routeConfig.settings}>Open settings</Link>
								</Button>
							) : null}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
