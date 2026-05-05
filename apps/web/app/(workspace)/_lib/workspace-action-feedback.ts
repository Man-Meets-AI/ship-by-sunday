"use client";

import { toast } from "sonner";

import { reportClientError } from "@/lib/observability/client-error-report";

const WORKSPACE_SUCCESS_TOAST_DURATION_MS = 1800;
export const WORKSPACE_ERROR_TOAST_DURATION_MS = 6000;
export const WORKSPACE_TOAST_POSITION = "bottom-right";

type WorkspaceToastId = string;
type WorkspaceToastAction = {
	label: string;
	onClick: () => void;
};

export function showWorkspaceActionSuccessToast({
	action,
	description,
	id,
	title,
}: {
	action?: WorkspaceToastAction;
	description?: string;
	id: WorkspaceToastId;
	title: string;
}) {
	toast.success(title, {
		...(action ? { action } : {}),
		id,
		description,
		duration: action
			? WORKSPACE_ERROR_TOAST_DURATION_MS
			: WORKSPACE_SUCCESS_TOAST_DURATION_MS,
		position: WORKSPACE_TOAST_POSITION,
	});
}

export function showWorkspaceActionErrorToast({
	action,
	error,
	fallbackMessage,
	id,
	report,
}: {
	action?: WorkspaceToastAction;
	error: unknown;
	fallbackMessage: string;
	id: WorkspaceToastId;
	report: {
		code: string;
		details?: Record<string, unknown>;
		pathname: string;
		title: string;
	};
}) {
	const message =
		error instanceof Error && error.message.trim().length > 0
			? error.message
			: fallbackMessage;

	toast.error(message, {
		...(action ? { action } : {}),
		id,
		duration: WORKSPACE_ERROR_TOAST_DURATION_MS,
		position: WORKSPACE_TOAST_POSITION,
	});
	reportClientError({
		error,
		pathname: report.pathname,
		code: report.code,
		severity: "medium",
		details: {
			action: report.title,
			...(report.details ?? {}),
		},
	});
}
