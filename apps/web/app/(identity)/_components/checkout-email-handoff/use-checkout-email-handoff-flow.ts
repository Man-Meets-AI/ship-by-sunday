"use client";

import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { routeConfig } from "@/config/product";
import { reportClientError } from "@/lib/observability/client-error-report";
import {
	getEmailCodeFirstFactor,
	getSupportedFirstFactorStrategies,
	type ClerkSignInWithFirstFactors,
} from "@/app/(identity)/_lib/email-code-sign-in-factor";
import { getSafeRedirectPath } from "@/platform/auth/auth-route-utils";

type CheckoutEmailHandoffStep = "send" | "verify";

type RenderableError = {
	message?: string;
};

type ClerkCompletionCandidate = {
	createdSessionId?: string | null;
	error?: unknown;
	finalize?: (args: {
		navigate: (params: {
			decorateUrl: (url: string) => string;
			session?: { currentTask?: { key: string } | null } | null;
		}) => Promise<void>;
	}) => Promise<unknown>;
	status?: string | null;
	supportedFirstFactors?: ClerkSignInWithFirstFactors["supportedFirstFactors"];
};

type ClerkFutureMutationResult = {
	error?: unknown;
};

function getRenderableErrors(
	errors: Array<unknown> | null,
): RenderableError[] | null {
	if (!errors?.length) {
		return null;
	}

	return errors.filter(
		(error): error is RenderableError =>
			typeof error === "object" && error !== null,
	);
}

async function navigateWithRouter(
	router: ReturnType<typeof useRouter>,
	url: string,
) {
	if (url.startsWith("http")) {
		window.location.assign(url);
		return;
	}

	router.push(url);
}

export function useCheckoutEmailHandoffFlow({
	lockedEmailAddress,
	redirectPath,
}: {
	lockedEmailAddress: string;
	redirectPath: string;
}) {
	const clerk = useClerk();
	const { errors, fetchStatus, signIn } = useSignIn();
	const router = useRouter();
	const [step, setStep] = useState<CheckoutEmailHandoffStep>("send");
	const [verificationCode, setVerificationCode] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const safeRedirectPath = getSafeRedirectPath(redirectPath);
	const clerkGlobalErrors = getRenderableErrors(errors.global ?? errors.raw);
	const globalErrors = localError
		? [{ message: localError }]
		: clerkGlobalErrors;

	function getCompletionStatus(
		candidate: ClerkCompletionCandidate | null | undefined,
	) {
		return candidate?.status ?? signIn?.status ?? null;
	}

	function getFinalizeFunction(
		candidate: ClerkCompletionCandidate | null | undefined,
	) {
		return candidate?.finalize ?? signIn?.finalize ?? null;
	}

	function getCreatedSessionId(
		candidate: ClerkCompletionCandidate | null | undefined,
	) {
		return (
			candidate?.createdSessionId ??
			(signIn &&
			"createdSessionId" in signIn &&
			typeof signIn.createdSessionId === "string"
				? signIn.createdSessionId
				: null) ??
			signIn?.existingSession?.sessionId ??
			("client" in clerk &&
				clerk.client?.sessions?.find((session) => session.status === "active")
					?.id) ??
			null
		);
	}

	function handleUnsupportedState(status: string | null) {
		const message =
			"Clerk needs another account step before this checkout email can be verified. Use a fresh code, or contact support if it repeats.";
		setLocalError(message);
		reportClientError({
			error: new Error("Unsupported Clerk checkout email handoff state."),
			pathname: routeConfig.checkoutEmailHandoff,
			code: "clerk_checkout_email_handoff_unsupported_state",
			severity: "high",
			details: {
				redirectPath: safeRedirectPath,
				status,
			},
		});
	}

	function handleMissingEmailCodeFactor(
		candidate?: ClerkSignInWithFirstFactors | null,
	) {
		const supportedFirstFactors = getSupportedFirstFactorStrategies(
			candidate?.supportedFirstFactors?.length ? candidate : signIn,
		);
		const message =
			"Clerk did not return an email-code sign-in method for this paid checkout account. Contact support and mention checkout_email_code_factor_missing.";
		setLocalError(message);
		reportClientError({
			error: new Error("Missing Clerk email-code first factor."),
			pathname: routeConfig.checkoutEmailHandoff,
			code: "clerk_checkout_email_handoff_email_code_factor_missing",
			severity: "high",
			details: {
				redirectPath: safeRedirectPath,
				supportedFirstFactors,
			},
		});
	}

	async function navigateAfterAuth({
		decorateUrl,
		session,
	}: {
		decorateUrl: (url: string) => string;
		session?: { currentTask?: { key: string } | null } | null;
	}) {
		if (session?.currentTask) {
			reportClientError({
				error: new Error(
					"Clerk returned a session task during checkout email handoff.",
				),
				pathname: routeConfig.checkoutEmailHandoff,
				code: "clerk_checkout_email_handoff_session_task",
				severity: "high",
				details: {
					redirectPath: safeRedirectPath,
					taskKey: session.currentTask.key,
				},
			});
			try {
				await clerk.signOut({ redirectUrl: safeRedirectPath });
				return;
			} catch {}
		}

		await navigateWithRouter(router, decorateUrl(safeRedirectPath));
	}

	async function finalizeSignIn(
		candidate: ClerkCompletionCandidate | null | undefined = signIn,
	) {
		const createdSessionId = getCreatedSessionId(candidate);
		if (createdSessionId) {
			await clerk.setActive({
				session: createdSessionId,
				navigate: navigateAfterAuth,
			});
			return;
		}

		const finalize = getFinalizeFunction(candidate);
		const completionStatus = getCompletionStatus(candidate);
		if (!finalize) {
			handleUnsupportedState(completionStatus);
			return;
		}

		const finalizeResponse = (await finalize({
			navigate: navigateAfterAuth,
		})) as ClerkFutureMutationResult;
		if (finalizeResponse?.error) {
			handleUnsupportedState(completionStatus);
		}
	}

	async function startEmailCode() {
		if (!signIn) {
			return;
		}

		setLocalError(null);
		setIsSubmitting(true);

		try {
			const createResponse = await signIn.create({
				identifier: lockedEmailAddress,
			});
			if (createResponse.error) {
				return;
			}

			if (signIn.isTransferable) {
				handleUnsupportedState("transferable");
				return;
			}

			if (getCompletionStatus(signIn) === "complete") {
				await finalizeSignIn(signIn);
				return;
			}

			const emailCodeFactor = getEmailCodeFirstFactor(
				signIn,
				lockedEmailAddress,
			);
			if (!emailCodeFactor) {
				handleMissingEmailCodeFactor(signIn);
				return;
			}

			const sendCodeResponse = await signIn.emailCode.sendCode({
				emailAddressId: emailCodeFactor.emailAddressId,
			});
			if (sendCodeResponse.error) {
				return;
			}

			setVerificationCode("");
			setStep("verify");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function submitVerification() {
		if (!signIn) {
			return;
		}

		setLocalError(null);
		setIsSubmitting(true);

		try {
			const response = await signIn.emailCode.verifyCode({
				code: verificationCode,
			});
			if (response.error) {
				return;
			}

			await finalizeSignIn(signIn);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function resendVerificationCode() {
		if (!signIn) {
			return;
		}

		setLocalError(null);
		setIsSubmitting(true);

		try {
			const emailCodeFactor = getEmailCodeFirstFactor(
				signIn,
				lockedEmailAddress,
			);
			if (!emailCodeFactor) {
				handleMissingEmailCodeFactor();
				return;
			}

			const response = await signIn.emailCode.sendCode({
				emailAddressId: emailCodeFactor.emailAddressId,
			});
			if (!response.error) {
				setVerificationCode("");
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return {
		emailError: errors.fields.identifier,
		globalErrors,
		isBusy: fetchStatus === "fetching" || isSubmitting,
		isLoaded: Boolean(signIn),
		resendVerificationCode,
		setVerificationCode,
		startEmailCode,
		step,
		submitVerification,
		verificationCode,
		verificationError: errors.fields.code,
	};
}
