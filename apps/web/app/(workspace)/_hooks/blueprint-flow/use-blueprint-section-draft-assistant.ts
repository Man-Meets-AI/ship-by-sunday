"use client";

import { useCallback, useEffect, useState } from "react";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import {
	buildBlueprintSectionDraftRequest,
	parseBlueprintSectionDraftOutput,
	type BlueprintDraftableSectionId,
	type BlueprintSectionDraftValues,
} from "@/lib/blueprint-flow/blueprint-section-draft-assistant";
import { getBlueprintStageFieldInputId } from "@/lib/blueprint-flow/blueprint-step-save-feedback";

type SectionDraftAssistantStatus =
	| "idle"
	| "drafting"
	| "needs_login"
	| "starting_login"
	| "polling_login"
	| "error";

type GenerateResponse = {
	output?: string;
	error?: string;
	code?: string;
};

type LoginStartResponse = {
	loginId?: string;
	authUrl?: string;
	error?: string;
};

type LoginPollResponse = {
	connected?: boolean;
	error?: string;
};

type BlueprintSectionDraftSource = Partial<
	Record<CanonicalProjectFactKey, string>
>;

async function readJsonResponse<T>(response: Response) {
	return (await response.json().catch(() => null)) as T | null;
}

function focusFirstSectionField(
	sectionId: BlueprintDraftableSectionId,
	draftValues: BlueprintSectionDraftValues,
) {
	const firstFieldKey = Object.keys(draftValues)[0] as
		| CanonicalProjectFactKey
		| undefined;
	if (!firstFieldKey) {
		return;
	}

	window.setTimeout(() => {
		const input = document.getElementById(
			getBlueprintStageFieldInputId(sectionId, firstFieldKey),
		) as HTMLElement | null;
		input?.scrollIntoView?.({ behavior: "smooth", block: "center" });
		input?.focus?.();
	}, 0);
}

export function useBlueprintSectionDraftAssistant({
	draftValues,
	facts,
	onApplyDraftValues,
	sectionId,
}: {
	draftValues: BlueprintSectionDraftSource;
	facts: CanonicalProjectFactsDraft;
	onApplyDraftValues: (draftValues: BlueprintSectionDraftValues) => void;
	sectionId: BlueprintDraftableSectionId;
}) {
	const [status, setStatus] = useState<SectionDraftAssistantStatus>("idle");
	const [message, setMessage] = useState<string | null>(null);
	const [pendingLoginId, setPendingLoginId] = useState<string | null>(null);
	const isDialogOpen =
		status === "needs_login" ||
		status === "starting_login" ||
		status === "polling_login" ||
		status === "error";

	const closeDialog = useCallback(() => {
		setStatus("idle");
		setMessage(null);
		setPendingLoginId(null);
	}, []);
	const showError = useCallback((nextMessage: string) => {
		setStatus("error");
		setPendingLoginId(null);
		setMessage(nextMessage);
	}, []);

	const applySectionDraftValues = useCallback(
		(nextDraftValues: BlueprintSectionDraftValues) => {
			onApplyDraftValues(nextDraftValues);
			focusFirstSectionField(sectionId, nextDraftValues);
		},
		[onApplyDraftValues, sectionId],
	);

	const runSectionDraft = useCallback(async () => {
		setStatus("drafting");
		setMessage(null);

		try {
			const response = await fetch(apiRouteConfig.codexGenerate, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify(
					buildBlueprintSectionDraftRequest(sectionId, {
						...facts,
						...draftValues,
					}),
				),
			});
			const data = await readJsonResponse<GenerateResponse>(response);

			if (response.ok && data?.output) {
				const nextDraftValues = parseBlueprintSectionDraftOutput(
					sectionId,
					data.output,
				);
				if (Object.keys(nextDraftValues).length === 0) {
					showError("Codex did not return any usable draft fields.");
					return false;
				}

				applySectionDraftValues(nextDraftValues);
				closeDialog();
				return true;
			}

			if (data?.code === "account_not_connected") {
				setStatus("needs_login");
				setMessage(
					"Connect your Codex account here, then we will retry this section.",
				);
				return false;
			}

			showError(data?.error ?? "Unable to draft this section right now.");
			return false;
		} catch {
			showError("Unable to draft this section right now.");
			return false;
		}
	}, [
		applySectionDraftValues,
		closeDialog,
		draftValues,
		facts,
		sectionId,
		showError,
	]);

	const startManagedLogin = useCallback(async () => {
		setStatus("starting_login");
		setMessage(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountLoginStart, {
				method: "POST",
			});
			const data = await readJsonResponse<LoginStartResponse>(response);

			if (!response.ok || !data?.loginId || !data.authUrl) {
				showError(data?.error ?? "Unable to start Codex login.");
				return;
			}

			setPendingLoginId(data.loginId);
			setStatus("polling_login");
			setMessage("Finish login in the opened tab. We will keep checking here.");
			window.open(data.authUrl, "_blank", "noopener,noreferrer");
		} catch {
			showError("Unable to start Codex login.");
		}
	}, [showError]);

	const pollManagedLogin = useCallback(async () => {
		if (!pendingLoginId) {
			return;
		}

		setStatus("polling_login");

		try {
			const params = new URLSearchParams({
				loginId: pendingLoginId,
				refresh: "true",
			});
			const response = await fetch(
				`${apiRouteConfig.codexAccountLoginPoll}?${params.toString()}`,
				{
					method: "GET",
				},
			);
			const data = await readJsonResponse<LoginPollResponse>(response);

			if (!response.ok) {
				showError(data?.error ?? "Unable to check Codex login status.");
				return;
			}

			if (data?.connected) {
				await runSectionDraft();
				return;
			}

			setMessage("Login is still pending.");
		} catch {
			showError("Unable to check Codex login status.");
		}
	}, [pendingLoginId, runSectionDraft, showError]);

	useEffect(() => {
		if (status !== "polling_login" || !pendingLoginId) {
			return;
		}

		void pollManagedLogin();
		const interval = window.setInterval(() => {
			void pollManagedLogin();
		}, 3000);

		return () => {
			window.clearInterval(interval);
		};
	}, [pendingLoginId, pollManagedLogin, status]);

	return {
		closeDialog,
		isBusy:
			status === "drafting" ||
			status === "starting_login" ||
			status === "polling_login",
		isDialogOpen,
		message,
		requestSectionDraft: runSectionDraft,
		startManagedLogin,
		status,
	};
}
