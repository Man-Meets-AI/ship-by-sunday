"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { toast } from "sonner";
import type { FunctionReturnType } from "convex/server";

import {
	showWorkspaceActionSuccessToast,
	WORKSPACE_ERROR_TOAST_DURATION_MS,
	WORKSPACE_TOAST_POSITION,
} from "@/app/(app)/_lib/workspace-action-feedback";
import {
	doctorPassDetailsPanelId,
	doctorPassPreviewPanelId,
	focusDoctorPassPanel,
} from "@/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-panels";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";

type WorkspaceSyncPreviewState = FunctionReturnType<
	typeof api.workspace.getWorkspaceSyncPreviewState
>;
type DoctorPassRun = WorkspaceSyncPreviewState["doctorPassRun"];

const doctorPassToastIds = {
	runCompleted: "workspace-doctor-pass-run-completed",
	runFailed: "workspace-doctor-pass-run-failed",
	uploadCompleted: "workspace-doctor-pass-upload-completed",
} as const;
const notificationStoragePrefix = "sbs:doctor-pass-toast:";

export function WorkspaceDoctorPassToastWatcher() {
	const { push } = useRouter();
	const pathname = usePathname();
	const { isAuthenticated, isLoading } = useConvexAuth();
	const syncPreviewState = useQuery(
		api.workspace.getWorkspaceSyncPreviewState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as WorkspaceSyncPreviewState | undefined;
	const doctorPassRun = syncPreviewState?.doctorPassRun ?? null;

	useEffect(() => {
		if (!doctorPassRun) {
			return;
		}

		const notification = getDoctorPassNotification(doctorPassRun);
		if (!notification || wasDoctorPassNotificationShown(notification.key)) {
			return;
		}

		markDoctorPassNotificationShown(notification.key);
		if (notification.kind === "uploaded") {
			showWorkspaceActionSuccessToast({
				action: {
					label: "View findings",
					onClick: () => push(routeConfig.workspaceFindings),
				},
				id: `${doctorPassToastIds.uploadCompleted}-${doctorPassRun._id}`,
				title: "Findings uploaded.",
			});
			return;
		}

		if (notification.kind === "ready") {
			showWorkspaceActionSuccessToast({
				action: {
					label: "Review findings",
					onClick: () =>
						openDoctorPassDestination({
							panelId: doctorPassPreviewPanelId,
							pathname,
							push,
						}),
				},
				id: `${doctorPassToastIds.runCompleted}-${doctorPassRun._id}`,
				title: `Doctor Pass completed. Review ${formatCount(
					doctorPassRun.syncPreviewFindingsCount ?? 0,
					"finding",
				)} before upload.`,
			});
			return;
		}

		toast.error("Doctor Pass failed. View run details.", {
			action: {
				label: "View details",
				onClick: () =>
					openDoctorPassDestination({
						panelId: doctorPassDetailsPanelId,
						pathname,
						push,
					}),
			},
			id: `${doctorPassToastIds.runFailed}-${doctorPassRun._id}`,
			duration: WORKSPACE_ERROR_TOAST_DURATION_MS,
			position: WORKSPACE_TOAST_POSITION,
		});
	}, [doctorPassRun, pathname, push]);

	return null;
}

function getDoctorPassNotification(doctorPassRun: DoctorPassRun) {
	if (!doctorPassRun) {
		return null;
	}
	if (doctorPassRun.syncPreviewStatus === "uploaded") {
		return {
			kind: "uploaded" as const,
			key: `${doctorPassRun._id}:uploaded`,
		};
	}
	if (doctorPassRun.syncPreviewStatus === "ready") {
		return {
			kind: "ready" as const,
			key: `${doctorPassRun._id}:ready`,
		};
	}
	if (doctorPassRun.status === "failed" || doctorPassRun.status === "blocked") {
		return {
			kind: "failed" as const,
			key: `${doctorPassRun._id}:failed`,
		};
	}
	return null;
}

function openDoctorPassDestination({
	panelId,
	pathname,
	push,
}: {
	panelId: string;
	pathname: string;
	push: (href: string) => void;
}) {
	if (pathname === routeConfig.workspaceDoctorPass) {
		focusDoctorPassPanel(panelId);
		return;
	}

	push(routeConfig.workspaceDoctorPass);
}

function wasDoctorPassNotificationShown(key: string) {
	return (
		globalThis.sessionStorage?.getItem(`${notificationStoragePrefix}${key}`) ===
		"shown"
	);
}

function markDoctorPassNotificationShown(key: string) {
	globalThis.sessionStorage?.setItem(
		`${notificationStoragePrefix}${key}`,
		"shown",
	);
}

function formatCount(count: number, noun: string) {
	return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
