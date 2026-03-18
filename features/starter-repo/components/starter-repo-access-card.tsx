"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
	return (
		<span className="inline-flex rounded-none border border-product-border bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
			{getStarterRepoStatusLabel(status)}
		</span>
	);
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
		<section className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="max-w-3xl">
					<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-product-muted">
						Starter repo access
					</p>
					<h2 className="mt-3 font-display text-2xl uppercase leading-none tracking-[0.08em] text-product-text">
						{getStarterRepoCardTitle(surface, status)}
					</h2>
					<p className="mt-3 text-sm leading-relaxed text-product-muted">
						{getStarterRepoCardBody(surface, status)}
					</p>
				</div>
				<StatusBadge status={status} />
			</div>
			<div className="mt-4 border border-product-border/60 bg-product-surface-strong/72 p-4">
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
					Private repo
				</p>
				<p className="mt-2 text-sm text-product-text">
					{starterRepoConfig.owner}/{starterRepoConfig.repo}
				</p>
				{usernameLabel ? (
					<p className="mt-2 text-xs leading-relaxed text-product-muted">
						Saved GitHub username:{" "}
						<span className="text-product-text">{usernameLabel}</span>
					</p>
				) : null}
				{status === "failed" && record?.lastError ? (
					<p className="mt-2 text-xs leading-relaxed text-danger">
						Last error: {record.lastError}
					</p>
				) : null}
				{showForm ? (
					<StarterRepoAccessForm
						initialUsername={record?.githubUsername ?? ""}
						onSubmitted={() => setIsEditingRequested(false)}
					/>
				) : (
					<div className="mt-4 flex flex-wrap gap-3">
						{status === "requested" ? (
							<button
								type="button"
								onClick={() => setIsEditingRequested(true)}
								className="inline-flex rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt"
							>
								Edit username
							</button>
						) : null}
						{status === "invited" || status === "accepted" ? (
							<a
								href={starterRepoConfig.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex rounded-none border border-product-accent bg-product-chip px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
							>
								Open starter repo
							</a>
						) : null}
						{surface === "mission" ? (
							<Link
								href={routeConfig.settings}
								className="inline-flex rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt"
							>
								Open settings
							</Link>
						) : null}
					</div>
				)}
			</div>
		</section>
	);
}
