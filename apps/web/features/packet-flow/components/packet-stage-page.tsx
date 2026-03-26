"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { api } from "@/convex/_generated/api";
import {
	buildStageDraftValues,
	buildSavePayload,
} from "@/features/packet-flow/lib/packet-field-helpers";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import {
	getPacketStageDefinition,
	type CanonicalProjectFactKey,
	type PacketStageId,
} from "@packet-compiler";
import { PacketStageProgressPanel } from "./progression/packet-stage-progress-panel";
import { PacketStageNav } from "./packet-stage-nav";
import { PacketStageSidebar } from "./packet-stage-sidebar";
import { PacketStageStepCard } from "./packet-stage-step-card";

const packetDownloadStageMap = {
	design: "design",
	marketing: "marketing",
	"build-plan": "build",
} as const;

const nextStageMap = {
	product: "design",
	design: "marketing",
	marketing: "build-plan",
	"build-plan": "review",
} as const satisfies Partial<Record<PacketStageId, PacketStageId>>;

function getPacketDownloadHref(
	stageId: Exclude<PacketStageId, "start" | "review">,
	isComplete: boolean,
) {
	if (!isComplete) {
		return undefined;
	}

	const stage =
		packetDownloadStageMap[stageId as keyof typeof packetDownloadStageMap];
	return stage ? `/api/download/packet/${stage}` : undefined;
}

export function PacketStagePage({
	stageId,
	initialWorkspaceState,
}: {
	stageId: Exclude<PacketStageId, "start" | "review">;
	initialWorkspaceState: PacketWorkspaceState;
}) {
	const stage = getPacketStageDefinition(stageId);
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.packet.getPacketWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as PacketWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const stageStatus = workspaceState.stageStatuses.find(
		(item) => item.stageId === stageId,
	);
	if (!stageStatus) {
		throw new Error(`Missing packet stage status for ${stageId}`);
	}
	if (!stageStatus.isUnlocked) {
		redirect(
			getPacketStageDefinition(workspaceState.firstIncompleteStageId).route,
		);
	}

	const [activeStepIndex, setActiveStepIndex] = useState(
		stageStatus.currentStepIndex,
	);
	const currentStep = stage.steps[activeStepIndex];
	const [draftValuesByStepId, setDraftValuesByStepId] = useState(() =>
		buildStageDraftValues(workspaceState.projectDefinition?.facts ?? {}, stage),
	);
	const [isPending, startTransition] = useTransition();
	const saveProjectDefinitionFacts = useMutation(
		api.packet.saveProjectDefinitionFacts,
	);

	useEffect(() => {
		setDraftValuesByStepId(
			buildStageDraftValues(
				workspaceState.projectDefinition?.facts ?? {},
				stage,
			),
		);
	}, [stage, workspaceState.projectDefinition?.facts]);

	const downloadHref = getPacketDownloadHref(stageId, stageStatus.isComplete);
	const nextStageId = stageStatus.isComplete
		? nextStageMap[stageId]
		: undefined;
	const title = useMemo(() => stage.label, [stage.label]);
	const currentDraftValues = currentStep
		? (draftValuesByStepId[currentStep.id] ?? {})
		: {};

	function handleFieldChange(
		fieldKey: CanonicalProjectFactKey,
		nextValue: string,
	) {
		if (!currentStep) {
			return;
		}

		setDraftValuesByStepId((current) => ({
			...current,
			[currentStep.id]: {
				...(current[currentStep.id] ?? {}),
				[fieldKey]: nextValue,
			},
		}));
	}

	function handleSave() {
		if (!currentStep) {
			return;
		}

		const payload = buildSavePayload(currentStep, currentDraftValues);
		startTransition(async () => {
			await saveProjectDefinitionFacts({ stageId, ...payload });
			if (activeStepIndex < stage.steps.length - 1) {
				setActiveStepIndex((index) => index + 1);
			}
		});
	}

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showSkillRail={false}
			title={title}
			subtitle={stage.description}
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<PacketStageNav
					currentStageId={stageId}
					stageStatuses={workspaceState.stageStatuses}
				/>
				<div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
					<div className="space-y-6">
						<PacketStageProgressPanel
							stage={stage}
							stageStatus={stageStatus}
							activeStepIndex={activeStepIndex}
							onSelectStep={setActiveStepIndex}
						/>
						{currentStep ? (
							<PacketStageStepCard
								currentStep={currentStep}
								currentStepIndex={activeStepIndex}
								totalSteps={stage.steps.length}
								draftValues={currentDraftValues}
								isSaving={isPending}
								onBack={() =>
									setActiveStepIndex((index) => Math.max(0, index - 1))
								}
								onChange={handleFieldChange}
								onSave={handleSave}
							/>
						) : null}
					</div>
					<PacketStageSidebar
						stageStatus={stageStatus}
						downloadHref={downloadHref}
						nextStageId={nextStageId}
					/>
				</div>
			</div>
		</AppShell>
	);
}
