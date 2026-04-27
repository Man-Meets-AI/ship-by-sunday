"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { getBuildStarterTemplateRepoUrl } from "@/features/course/lesson/model/resources";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import {
	getStarterRepoTemplateLockReason,
	type StarterRepoAccessStatus,
} from "@/config/starter-repo-access-copy";

import { BuildProductIterationSetupChecklist } from "./build-product-iteration-setup-checklist";
import { BuildProductIterationSetupGatingAlert } from "./build-product-iteration-setup-gating-alert";
import { BuildProductIterationSetupLinks } from "./build-product-iteration-setup-links";

type BuildProductIterationSetupTabProps = {
	checklistField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
};

export function BuildProductIterationSetupTab({
	checklistField,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
}: BuildProductIterationSetupTabProps) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const starterRepoAccess = useQuery(
		api.course.getStarterRepoAccess,
		isAuthenticated && !isLoading ? {} : "skip",
	) as
		| { status: Exclude<StarterRepoAccessStatus, "loading" | "none"> }
		| null
		| undefined;

	const starterRepoStatus: StarterRepoAccessStatus =
		starterRepoAccess === undefined
			? "loading"
			: starterRepoAccess === null
				? "none"
				: starterRepoAccess.status;
	const hasStarterRepoAccess = starterRepoStatus === "accepted";
	const templateRepoUrl = hasStarterRepoAccess
		? getBuildStarterTemplateRepoUrl()
		: null;
	const templateLockedReason = hasStarterRepoAccess
		? null
		: getStarterRepoTemplateLockReason(starterRepoStatus);

	const codexConnection = useQuery(
		api.codex.getViewerConnection,
		isAuthenticated && !isLoading ? {} : "skip",
	) as { status?: string } | null | undefined;
	const chatgptConnected = codexConnection?.status === "connected";

	const invalid = invalidFieldIds.has(checklistField.id);
	const message =
		invalidFieldMessages.get(checklistField.id) ??
		"Finish this before continuing.";

	return (
		<div className="space-y-5">
			<BuildProductIterationSetupGatingAlert />
			<BuildProductIterationSetupLinks
				templateRepoUrl={templateRepoUrl}
				templateLockedReason={templateLockedReason}
				starterRepoStatus={starterRepoStatus}
				chatgptConnected={chatgptConnected}
			/>

			<Card>
				<CardHeader className="space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle className="text-base">Setup checklist</CardTitle>
						<Badge>Required</Badge>
					</div>
					<CardDescription>
						Check each line when you have actually done it—signals above are a
						hint, not proof.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<BuildProductIterationSetupChecklist
						checklistField={checklistField}
						value={fieldValues[checklistField.id]}
						onFieldChange={onFieldChange}
						invalid={invalid}
						message={message}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
