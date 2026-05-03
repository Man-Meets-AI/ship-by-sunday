"use client";

import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { routeConfig, starterRepoConfig } from "@/config/product";
import type {
	StarterRepoAccessStatus,
	StarterRepoAccessSurface,
} from "@/config/starter-repo-access-copy";

import type { StarterRepoAccessRecord } from "./starter-repo-access-record";
import { StarterRepoAccessForm } from "./starter-repo-access-form";

export function StarterRepoAccessCardBody({
	surface,
	status,
	record,
	usernameLabel,
	showForm,
	onEditUsername,
	onFormSubmitted,
}: {
	surface: StarterRepoAccessSurface;
	status: StarterRepoAccessStatus;
	record: StarterRepoAccessRecord | null | undefined;
	usernameLabel: string | null;
	showForm: boolean;
	onEditUsername: () => void;
	onFormSubmitted: () => void;
}) {
	return (
		<CardContent className="space-y-4 pt-6">
			<div
				className="rounded-lg border border-border/50 bg-muted/20 px-3 py-3 ring-1 ring-foreground/5"
				data-testid="starter-repo-access-summary"
			>
				<p className="text-sm font-medium text-foreground">
					{starterRepoConfig.owner}/{starterRepoConfig.repo}
				</p>
				{usernameLabel ? (
					<p className="mt-1 text-sm text-muted-foreground">
						GitHub <span className="text-foreground">{usernameLabel}</span>
					</p>
				) : (
					<p className="mt-1 text-xs text-muted-foreground">
						No GitHub username on file yet.
					</p>
				)}
			</div>
			<Separator />
			<div className="space-y-4">
				{status === "failed" && record?.lastError ? (
					<Alert variant="destructive">
						<AlertTitle>Provisioning failed</AlertTitle>
						<AlertDescription>Last error: {record.lastError}</AlertDescription>
					</Alert>
				) : null}
				{showForm ? (
					<StarterRepoAccessForm
						initialUsername={record?.githubUsername ?? ""}
						onSubmitted={onFormSubmitted}
						surface={surface}
					/>
				) : (
					<div className="flex flex-col gap-2 min-[480px]:flex-row min-[480px]:flex-wrap">
						{status === "requested" ? (
							<Button
								type="button"
								onClick={onEditUsername}
								variant="outline"
								size="sm"
								className="w-full min-[480px]:w-auto"
							>
								Edit username
							</Button>
						) : null}
						{status === "invited" || status === "accepted" ? (
							<Button
								asChild
								variant="secondary"
								size="sm"
								className="w-full min-[480px]:w-auto"
							>
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
							<Button
								asChild
								variant="outline"
								size="sm"
								className="w-full min-[480px]:w-auto"
							>
								<Link href={routeConfig.settings}>Open settings</Link>
							</Button>
						) : null}
					</div>
				)}
			</div>
		</CardContent>
	);
}
