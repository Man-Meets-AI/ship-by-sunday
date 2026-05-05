"use client";

import { toast } from "sonner";

import { reportClientError } from "@/lib/observability/client-error-report";

const WORKSPACE_SUCCESS_TOAST_DURATION_MS = 1800;
const WORKSPACE_ERROR_TOAST_DURATION_MS = 6000;
const WORKSPACE_TOAST_POSITION = "bottom-right";

type WorkspaceToastId = string;

export function showWorkspaceActionSuccessToast({
	description,
	id,
	title,
}: {
	description?: string;
	id: WorkspaceToastId;
	title: string;
}) {
	toast.success(title, {
		id,
		description,
		duration: WORKSPACE_SUCCESS_TOAST_DURATION_MS,
		position: WORKSPACE_TOAST_POSITION,
	});
}

export function showWorkspaceActionErrorToast({
	error,
	fallbackMessage,
	id,
	report,
}: {
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
