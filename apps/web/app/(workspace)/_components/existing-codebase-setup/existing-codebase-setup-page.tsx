"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import { WorkspaceOperatorSummaryCard } from "@/app/(workspace)/_components/workspace-operator-summary-card";
import {
	showWorkspaceActionErrorToast,
	showWorkspaceActionSuccessToast,
} from "@/app/(workspace)/_lib/workspace-action-feedback";
import {
	buildExistingCodebaseWorkspaceLocalNavModel,
	buildWorkspaceSetupReadinessModel,
	type WorkspaceDefaultOpenDestination,
} from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	getSupportModeBlockedMutationMessage,
	isSupportModeBlockedMutationResult,
} from "@/platform/admin-impersonation";
import { SetupDoctorPassAction } from "./setup-doctor-pass-action";
import { SetupOpenDestinationControl } from "./setup-open-destination-control";
import { SetupPairingPanel } from "./setup-pairing-panel";
import { SetupPrivacySummary } from "./setup-privacy-summary";
import { SetupReadinessSection } from "./setup-readiness-section";

type WorkspaceSetupState = FunctionReturnType<
	typeof api.workspace.getWorkspaceSetupState
>;

type PendingAction =
	| "regenerate"
	| "one_shot"
	| "cancel"
	| "open_destination"
	| "doctor_pass"
	| null;

const workspaceSetupToastIds = {
	pairingSuccess: "workspace-setup-pairing-success",
	pairingError: "workspace-setup-pairing-error",
	cancelPairingSuccess: "workspace-setup-cancel-pairing-success",
	cancelPairingError: "workspace-setup-cancel-pairing-error",
	openDestinationSuccess: "workspace-setup-open-destination-success",
	openDestinationError: "workspace-setup-open-destination-error",
	doctorPassSuccess: "workspace-setup-doctor-pass-success",
	doctorPassError: "workspace-setup-doctor-pass-error",
} as const;

export function ExistingCodebaseSetupPage({
	initialSetupState,
	initialRenderedAt,
}: {
	initialSetupState: WorkspaceSetupState;
	initialRenderedAt: number;
}) {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useConvexAuth();
	const [lastMutationState, setLastMutationState] =
		useState<WorkspaceSetupState | null>(null);
	const [pendingAction, setPendingAction] = useState<PendingAction>(null);
	const projectId =
		lastMutationState?.project?._id ?? initialSetupState.project?._id;
	const liveSetupState = useQuery(
		api.workspace.getWorkspaceSetupState,
		isAuthenticated && !isLoading && projectId ? { projectId } : "skip",
	) as WorkspaceSetupState | undefined;
	const preparePairing = useMutation(
		api.workspace.prepareWorkspaceSetupPairing,
	);
	const cancelPairing = useMutation(api.workspace.cancelWorkspaceSetupPairing);
	const saveWorkspaceProject = useMutation(
		api.workspace.createOrLoadWorkspaceProject,
	);
	const startDoctorPassRun = useMutation(
		api.workspace.startWorkspaceDoctorPassRun,
	);
	const setupState = liveSetupState ?? lastMutationState ?? initialSetupState;
	const model = useMemo(
		() => buildWorkspaceSetupReadinessModel(setupState, initialRenderedAt),
		[setupState, initialRenderedAt],
	);
	const localNavModel = useMemo(
		() => buildExistingCodebaseWorkspaceLocalNavModel("setup"),
		[],
	);

	async function runPairingMutation(
		action: "regenerate" | "one_shot",
		runnerMode: "daemon" | "one_shot",
	) {
		if (!setupState.project) {
			return;
		}

		setPendingAction(action);
		try {
			const nextState = await preparePairing({
				projectId: setupState.project._id,
				runnerMode,
				regenerate: true,
			});
			if (isSupportModeBlockedMutationResult(nextState)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			setLastMutationState(nextState as WorkspaceSetupState);
			showWorkspaceActionSuccessToast({
				id: workspaceSetupToastIds.pairingSuccess,
				title:
					runnerMode === "one_shot"
						? "One-shot pairing token ready"
						: "Pairing token regenerated",
			});
		} catch (error) {
			showWorkspaceActionErrorToast({
				id: workspaceSetupToastIds.pairingError,
				error: error instanceof Error ? error : String(error),
				fallbackMessage: "Unable to prepare pairing token.",
				report: {
					title: "Worker setup pairing preparation failed",
					code: "workspace_setup_pairing_prepare_failed",
					pathname: routeConfig.workspaceSetup,
					details: {
						runnerMode,
					},
				},
			});
		} finally {
			setPendingAction(null);
		}
	}

	async function cancelCurrentPairing() {
		const cancelRunnerId = setupState.pairingCommand?.runnerId;
		if (!setupState.project || !cancelRunnerId) {
			return;
		}

		setPendingAction("cancel");
		try {
			const nextState = await cancelPairing({
				projectId: setupState.project._id,
				runnerId: cancelRunnerId,
			});
			if (isSupportModeBlockedMutationResult(nextState)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			setLastMutationState(nextState as WorkspaceSetupState);
			showWorkspaceActionSuccessToast({
				id: workspaceSetupToastIds.cancelPairingSuccess,
				title: "Pairing canceled",
			});
		} catch (error) {
			showWorkspaceActionErrorToast({
				id: workspaceSetupToastIds.cancelPairingError,
				error: error instanceof Error ? error : String(error),
				fallbackMessage: "Unable to cancel pairing.",
				report: {
					title: "Worker setup pairing cancel failed",
					code: "workspace_setup_pairing_cancel_failed",
					pathname: routeConfig.workspaceSetup,
				},
			});
		} finally {
			setPendingAction(null);
		}
	}

	async function updateOpenDestination(
		defaultOpenDestination: WorkspaceDefaultOpenDestination,
	) {
		setPendingAction("open_destination");
		try {
			const saveResult = await saveWorkspaceProject({
				defaultOpenDestination,
			});
			if (isSupportModeBlockedMutationResult(saveResult)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			showWorkspaceActionSuccessToast({
				id: workspaceSetupToastIds.openDestinationSuccess,
				title: "Open destination saved",
				description:
					model.openDestination.options.find(
						(option) => option.value === defaultOpenDestination,
					)?.label ?? defaultOpenDestination,
			});
		} catch (error) {
			showWorkspaceActionErrorToast({
				id: workspaceSetupToastIds.openDestinationError,
				error: error instanceof Error ? error : String(error),
				fallbackMessage: "Unable to save open destination.",
				report: {
					title: "Worker setup open destination save failed",
					code: "workspace_setup_open_destination_save_failed",
					pathname: routeConfig.workspaceSetup,
					details: {
						defaultOpenDestination,
					},
				},
			});
		} finally {
			setPendingAction(null);
		}
	}

	async function runDoctorPass() {
		if (
			!setupState.project ||
			model.doctorPassAction.disabled ||
			pendingAction
		) {
			return;
		}

		setPendingAction("doctor_pass");
		try {
			const runnerId = setupState.activeRunner?._id;
			const repositoryBindingId = setupState.repositoryBinding?._id;
			const doctorPassRun = await startDoctorPassRun({
				projectId: setupState.project._id,
				runnerMode: setupState.activeRunner?.runnerMode ?? "daemon",
				...(runnerId ? { runnerId } : {}),
				...(repositoryBindingId ? { repositoryBindingId } : {}),
			});
			if (isSupportModeBlockedMutationResult(doctorPassRun)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
			showWorkspaceActionSuccessToast({
				action: {
					label: "Open Doctor Pass",
					onClick: () => router.push(routeConfig.workspaceDoctorPass),
				},
				id: workspaceSetupToastIds.doctorPassSuccess,
				title: "Doctor pass started",
			});
		} catch (error) {
			showWorkspaceActionErrorToast({
				id: workspaceSetupToastIds.doctorPassError,
				error: error instanceof Error ? error : String(error),
				fallbackMessage: "Unable to start doctor pass.",
				report: {
					title: "Worker setup doctor pass start failed",
					code: "workspace_setup_doctor_pass_start_failed",
					pathname: routeConfig.workspaceSetup,
					details: {
						runnerMode: setupState.activeRunner?.runnerMode ?? "daemon",
					},
				},
			});
		} finally {
			setPendingAction(null);
		}
	}

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			title="Setup"
			localNav={{
				kind: "workspace",
				desktop: <WorkspaceLocalNavRail model={localNavModel} />,
			}}
		>
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 pb-12 pt-2 sm:px-4 lg:px-6">
				<header className="grid gap-4 border-b border-border/60 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.36fr)]">
					<div className="min-w-0">
						<p className="text-sm font-medium text-muted-foreground">Setup</p>
						<h1 className="mt-2 font-heading-serif text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
							Existing codebase setup
						</h1>
						<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
							{model.subtitle}
						</p>
					</div>
					<WorkspaceOperatorSummaryCard
						title="Setup summary"
						rows={[
							{ label: "Project", value: model.projectLabel },
							{ label: "Repository", value: model.repositoryLabel },
							{ label: "Runner", value: model.pairing.activeRunnerLabel },
							{ label: "State", value: model.pairing.statusLabel },
							{ label: "Owner", value: "Human" },
							{
								label: "Next",
								value: model.doctorPassAction.disabled
									? "Resolve setup blockers"
									: "Run Doctor Pass",
							},
						]}
					/>
				</header>

				<SetupPairingPanel
					pairing={model.pairing}
					onRegenerateToken={() =>
						void runPairingMutation("regenerate", "daemon")
					}
					onUseOneShotMode={() =>
						void runPairingMutation("one_shot", "one_shot")
					}
					onCancelPairing={() => void cancelCurrentPairing()}
					pendingAction={
						pendingAction === "open_destination" ||
						pendingAction === "doctor_pass"
							? null
							: pendingAction
					}
				/>

				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.36fr)] lg:items-start">
					<div className="grid min-w-0 gap-5">
						{model.sections.map((section) => (
							<SetupReadinessSection key={section.id} section={section} />
						))}
					</div>
					<aside className="grid gap-5 lg:sticky lg:top-20">
						<SetupDoctorPassAction
							action={model.doctorPassAction}
							pending={pendingAction === "doctor_pass"}
							onRunDoctorPass={() => void runDoctorPass()}
						/>
						<SetupOpenDestinationControl
							value={model.openDestination.value}
							options={model.openDestination.options}
							pending={pendingAction === "open_destination"}
							onChange={(value) => void updateOpenDestination(value)}
						/>
						<SetupPrivacySummary defaults={model.privacyDefaults} />
					</aside>
				</div>
			</div>
		</AppShell>
	);
}
