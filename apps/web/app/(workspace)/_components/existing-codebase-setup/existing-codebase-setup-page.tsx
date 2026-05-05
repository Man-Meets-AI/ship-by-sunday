"use client";

import { useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { WorkspaceLocalNavRail } from "@/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail";
import {
	buildExistingCodebaseWorkspaceLocalNavModel,
	buildWorkspaceSetupReadinessModel,
	type WorkspaceDefaultOpenDestination,
} from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { api } from "@/convex/_generated/api";
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

export function ExistingCodebaseSetupPage({
	initialSetupState,
	initialRenderedAt,
}: {
	initialSetupState: WorkspaceSetupState;
	initialRenderedAt: number;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const [lastMutationState, setLastMutationState] =
		useState<WorkspaceSetupState | null>(null);
	const [pendingAction, setPendingAction] = useState<PendingAction>(null);
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
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
		setFeedbackMessage(null);
		try {
			const nextState = await preparePairing({
				projectId: setupState.project._id,
				runnerMode,
				regenerate: true,
			});
			setLastMutationState(nextState as WorkspaceSetupState);
			setFeedbackMessage(
				runnerMode === "one_shot"
					? "One-shot pairing token ready."
					: "Pairing token regenerated.",
			);
		} catch (error) {
			setFeedbackMessage(
				error instanceof Error
					? error.message
					: "Unable to prepare pairing token.",
			);
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
		setFeedbackMessage(null);
		try {
			const nextState = await cancelPairing({
				projectId: setupState.project._id,
				runnerId: cancelRunnerId,
			});
			setLastMutationState(nextState as WorkspaceSetupState);
			setFeedbackMessage("Pairing canceled.");
		} catch (error) {
			setFeedbackMessage(
				error instanceof Error ? error.message : "Unable to cancel pairing.",
			);
		} finally {
			setPendingAction(null);
		}
	}

	async function updateOpenDestination(
		defaultOpenDestination: WorkspaceDefaultOpenDestination,
	) {
		setPendingAction("open_destination");
		setFeedbackMessage(null);
		try {
			await saveWorkspaceProject({ defaultOpenDestination });
			setFeedbackMessage("Default open destination saved.");
		} catch (error) {
			setFeedbackMessage(
				error instanceof Error
					? error.message
					: "Unable to save open destination.",
			);
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
		setFeedbackMessage(null);
		try {
			const runnerId = setupState.activeRunner?._id;
			const repositoryBindingId = setupState.repositoryBinding?._id;
			await startDoctorPassRun({
				projectId: setupState.project._id,
				runnerMode: setupState.activeRunner?.runnerMode ?? "daemon",
				...(runnerId ? { runnerId } : {}),
				...(repositoryBindingId ? { repositoryBindingId } : {}),
			});
			setFeedbackMessage("Doctor pass started.");
		} catch (error) {
			setFeedbackMessage(
				error instanceof Error ? error.message : "Unable to start doctor pass.",
			);
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
					<div className="grid gap-2 rounded-xl border border-border/60 bg-background p-4 text-sm">
						<div className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">Project</span>
							<span className="truncate font-medium text-foreground">
								{model.projectLabel}
							</span>
						</div>
						<div className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">Repository</span>
							<span className="truncate font-medium text-foreground">
								{model.repositoryLabel}
							</span>
						</div>
						<div className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">Runner</span>
							<span className="truncate font-medium text-foreground">
								{model.pairing.activeRunnerLabel}
							</span>
						</div>
					</div>
				</header>

				{feedbackMessage ? (
					<div
						className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-foreground"
						role="status"
					>
						{feedbackMessage}
					</div>
				) : null}

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
