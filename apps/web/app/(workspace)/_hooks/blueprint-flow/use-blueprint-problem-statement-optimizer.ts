"use client";

import { useCallback, useEffect, useState } from "react";
import type { CanonicalProjectFactsDraft } from "@shipbysunday/blueprint-compiler";
import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { getBlueprintStageFieldInputId } from "@/lib/blueprint-flow/blueprint-step-save-feedback";
import type { BlueprintStepDraftValues } from "@/lib/blueprint-flow/blueprint-step-save-feedback";
import { buildBlueprintFieldOptimizationRequest } from "@/lib/blueprint-flow/blueprint-field-optimizer";

type OptimizerStatus =
	| "idle"
	| "optimizing"
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

function focusProblemStatementField(stepId: string) {
	window.setTimeout(() => {
		const input = document.getElementById(
			getBlueprintStageFieldInputId(stepId, "problem_statement"),
		) as HTMLElement | null;
		input?.scrollIntoView?.({ behavior: "smooth", block: "center" });
		input?.focus?.();
	}, 0);
}

export function useBlueprintProblemStatementOptimizer({
	draftValues,
	facts,
	onApplyOptimizedValue,
	stepId,
}: {
	draftValues: BlueprintStepDraftValues;
	facts: CanonicalProjectFactsDraft;
	onApplyOptimizedValue: (nextValue: string) => void;
	stepId: string;
}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [status, setStatus] = useState<OptimizerStatus>("idle");
	const [message, setMessage] = useState<string | null>(null);
	const [pendingLoginId, setPendingLoginId] = useState<string | null>(null);

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false);
		setStatus("idle");
		setMessage(null);
		setPendingLoginId(null);
	}, []);

	const applyOptimizedValue = useCallback(
		(nextValue: string) => {
			onApplyOptimizedValue(nextValue);
			focusProblemStatementField(stepId);
		},
		[onApplyOptimizedValue, stepId],
	);

	const runOptimization = useCallback(async () => {
		setStatus("optimizing");
		setMessage(null);

		try {
			const response = await fetch(apiRouteConfig.codexGenerate, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify(
					buildBlueprintFieldOptimizationRequest("problem_statement", {
						...facts,
						...draftValues,
					} as CanonicalProjectFactsDraft),
				),
			});
			const data = (await response
				.json()
				.catch(() => null)) as GenerateResponse | null;

			if (response.ok && data?.output) {
				applyOptimizedValue(data.output.trim());
				closeDialog();
				return true;
			}

			if (data?.code === "account_not_connected") {
				setIsDialogOpen(true);
				setStatus("needs_login");
				setMessage(
					"Connect your Codex account here, then we will retry this field.",
				);
				return false;
			}

			setIsDialogOpen(true);
			setStatus("error");
			setPendingLoginId(null);
			setMessage(data?.error ?? "Unable to optimize this field right now.");
			return false;
		} catch {
			setIsDialogOpen(true);
			setStatus("error");
			setPendingLoginId(null);
			setMessage("Unable to optimize this field right now.");
			return false;
		}
	}, [applyOptimizedValue, closeDialog, draftValues, facts]);

	const startManagedLogin = useCallback(async () => {
		setStatus("starting_login");
		setMessage(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountLoginStart, {
				method: "POST",
			});
			const data = (await response
				.json()
				.catch(() => null)) as LoginStartResponse | null;

			if (!response.ok || !data?.loginId || !data.authUrl) {
				setIsDialogOpen(true);
				setStatus("error");
				setPendingLoginId(null);
				setMessage(data?.error ?? "Unable to start Codex login.");
				return;
			}

			setIsDialogOpen(true);
			setPendingLoginId(data.loginId);
			setStatus("polling_login");
			setMessage("Finish login in the opened tab. We will keep checking here.");
			window.open(data.authUrl, "_blank", "noopener,noreferrer");
		} catch {
			setIsDialogOpen(true);
			setStatus("error");
			setPendingLoginId(null);
			setMessage("Unable to start Codex login.");
		}
	}, []);

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
			const data = (await response
				.json()
				.catch(() => null)) as LoginPollResponse | null;

			if (!response.ok) {
				setStatus("error");
				setMessage(data?.error ?? "Unable to check Codex login status.");
				return;
			}

			if (data?.connected) {
				await runOptimization();
				return;
			}

			setMessage("Login is still pending.");
		} catch {
			setStatus("error");
			setMessage("Unable to check Codex login status.");
		}
	}, [pendingLoginId, runOptimization]);

	useEffect(() => {
		if (status !== "polling_login" || !pendingLoginId || !isDialogOpen) {
			return;
		}

		void pollManagedLogin();
		const interval = window.setInterval(() => {
			void pollManagedLogin();
		}, 3000);

		return () => {
			window.clearInterval(interval);
		};
	}, [isDialogOpen, pendingLoginId, pollManagedLogin, status]);

	return {
		closeDialog,
		isBusy:
			status === "optimizing" ||
			status === "starting_login" ||
			status === "polling_login",
		isDialogOpen,
		message,
		pendingLoginId,
		requestOptimization: runOptimization,
		startManagedLogin,
		status,
	};
}
