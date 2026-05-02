"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";

import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import {
	getStarterRepoCardBody,
	getStarterRepoCardTitle,
	type StarterRepoAccessStatus,
	type StarterRepoAccessSurface,
} from "@/config/starter-repo-access-copy";

import { StarterRepoAccessCardBody } from "./starter-repo-access-card-body";
import {
	formatStarterRepoUsernameLabel,
	type StarterRepoAccessRecord,
} from "./starter-repo-access-record";
import { StarterRepoAccessStatusBadge } from "./starter-repo-access-status-badge";

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

	const usernameLabel = formatStarterRepoUsernameLabel(record);
	const showForm =
		status === "none" ||
		status === "failed" ||
		(status === "requested" && isEditingRequested);

	return (
		<Card data-testid="starter-repo-access-card">
			<CardHeader>
				<div className="text-balance space-y-1 pr-2">
					<p className="text-sm font-normal text-muted-foreground">
						Starter repository
					</p>
					<h2
						data-slot="card-title"
						className="text-base leading-snug font-medium text-foreground"
					>
						{getStarterRepoCardTitle(surface, status)}
					</h2>
				</div>
				<CardDescription className="text-pretty">
					{getStarterRepoCardBody(surface, status)}
				</CardDescription>
				<CardAction>
					<StarterRepoAccessStatusBadge status={status} />
				</CardAction>
			</CardHeader>
			<Separator />
			<StarterRepoAccessCardBody
				surface={surface}
				status={status}
				record={record}
				usernameLabel={usernameLabel}
				showForm={showForm}
				onEditUsername={() => setIsEditingRequested(true)}
				onFormSubmitted={() => setIsEditingRequested(false)}
			/>
		</Card>
	);
}
