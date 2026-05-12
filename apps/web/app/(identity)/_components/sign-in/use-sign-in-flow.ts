"use client";

import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useState } from "react";

import {
	getEmailCodeFirstFactor,
	getSupportedFirstFactorStrategies,
	type ClerkSignInWithFirstFactors,
} from "@/app/(identity)/_lib/email-code-sign-in-factor";
import {
	getPasswordlessCodeError,
	getPasswordlessEmailError,
	getPasswordlessGlobalErrors,
} from "@/app/(identity)/_lib/passwordless-auth-errors";
import { authViewConfig, routeConfig } from "@/config/product";
import { reportClientError } from "@/lib/observability/client-error-report";
import {
	buildSignInHref,
	getSessionTaskHref,
	getSafeRedirectPath,
} from "@/platform/auth/auth-route-utils";

type RenderableError = {
	message?: string;
};

type ClerkMutationError = RenderableError | null | undefined;

type ClerkFutureMutationResult =
	| {
			error?: ClerkMutationError;
	  }
	| null
	| undefined
	| void;

type ClerkSignInErrors = ReturnType<typeof useSignIn>["errors"];

type SignInCompletionCandidate = {
	createdSessionId?: string | null;
	error?: ClerkMutationError;
	finalize?: (args: {
		navigate: (params: {
			decorateUrl: (url: string) => string;
			session?: { currentTask?: { key: string } | null } | null;
		}) => Promise<void>;
	}) => Promise<ClerkFutureMutationResult>;
	status?: string | null;
	supportedFirstFactors?: ClerkSignInWithFirstFactors["supportedFirstFactors"];
};

function getRenderableErrors(
	errors: ClerkSignInErrors["global"] | ClerkSignInErrors["raw"] | null,
): RenderableError[] | null {
	if (!errors?.length) {
		return null;
	}

	const renderableErrors: RenderableError[] = [];
	for (const error of errors) {
		if (typeof error === "object" && error !== null) {
			renderableErrors.push(error);
		}
	}

	return renderableErrors;
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

export function useSignInFlow({
	initialEmail = "",
	isInitialEmailLocked = false,
}: {
	initialEmail?: string;
	isInitialEmailLocked?: boolean;
} = {}) {
	const clerk = useClerk();
	const { errors, fetchStatus, signIn } = useSignIn();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [emailAddress, setEmailAddress] = useState(initialEmail);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [localEmailErrorMessage, setLocalEmailErrorMessage] = useState<
		string | null
	>(null);
	const [localError, setLocalError] = useState<string | null>(null);
	const [step, setStep] = useState<"email" | "email_code">("email");
	const [verificationCode, setVerificationCode] = useState("");

	const redirectPath = getSafeRedirectPath(searchParams.get("redirect_url"));
	const clerkGlobalErrors = getRenderableErrors(errors.global ?? errors.raw);
	const localEmailError = localEmailErrorMessage
		? { message: localEmailErrorMessage }
		: null;
	const emailError =
		localEmailError ?? getPasswordlessEmailError(errors.fields.identifier);
	const verificationError = getPasswordlessCodeError(errors.fields.code);
	const globalErrors = localError
		? [{ message: localError }]
		: getPasswordlessGlobalErrors({
				fieldErrors: [errors.fields.identifier, errors.fields.code],
				rootErrors: clerkGlobalErrors,
			});
	const isBusy = fetchStatus === "fetching" || isSubmitting;

	function getCompletionStatus(
		candidate: SignInCompletionCandidate | null | undefined,
	) {
		return candidate?.status ?? signIn?.status ?? null;
	}

	function getFinalizeFunction(
		candidate: SignInCompletionCandidate | null | undefined,
	) {
		return candidate?.finalize ?? signIn?.finalize ?? null;
	}

	function getCreatedSessionId(
		candidate: SignInCompletionCandidate | null | undefined,
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

	function reportUnsupportedState(status: string | null) {
		const message =
			"Clerk needs another account step before this email can sign in. Use a fresh code, or contact support if it repeats.";
		setLocalError(message);
		reportClientError({
			error: new Error("Unsupported Clerk passwordless sign-in state."),
			pathname: routeConfig.signIn,
			code: "clerk_passwordless_sign_in_unsupported_state",
			severity: "high",
			details: {
				redirectPath,
				status,
			},
		});
	}

	function reportMissingEmailCodeFactor(
		candidate?: ClerkSignInWithFirstFactors | null,
	) {
		const supportedFirstFactors = getSupportedFirstFactorStrategies(
			candidate?.supportedFirstFactors?.length ? candidate : signIn,
		);
		const message =
			"Clerk did not return an email-code sign-in method for this account. Contact support and mention passwordless_email_code_factor_missing.";
		setLocalError(message);
		reportClientError({
			error: new Error("Missing Clerk email-code first factor."),
			pathname: routeConfig.signIn,
			code: "clerk_passwordless_sign_in_email_code_factor_missing",
			severity: "high",
			details: {
				redirectPath,
				supportedFirstFactors,
			},
		});
	}

	function reportMissingAccount() {
		setLocalEmailErrorMessage(null);
		setVerificationCode("");
		setStep("email_code");
	}

	function updateEmailAddress(value: string) {
		if (isInitialEmailLocked) {
			return;
		}

		setEmailAddress(value);
		if (localEmailErrorMessage) {
			setLocalEmailErrorMessage(null);
		}
	}

	async function navigateAfterAuth({
		decorateUrl,
		session,
	}: {
		decorateUrl: (url: string) => string;
		session?: { currentTask?: { key: string } | null } | null;
	}) {
		const sessionTaskHref = session?.currentTask
			? getSessionTaskHref(session.currentTask.key, redirectPath)
			: null;
		if (session?.currentTask && !sessionTaskHref) {
			const signInTaskFallbackHref = decorateUrl(
				buildSignInHref({ redirectPath }),
			);
			reportClientError({
				error: new Error("Unknown Clerk session task."),
				pathname: routeConfig.signIn,
				code: "clerk_unknown_session_task",
				severity: "high",
				details: {
					redirectPath,
					taskKey: session.currentTask.key,
				},
			});
			try {
				await clerk.signOut({ redirectUrl: signInTaskFallbackHref });
				return;
			} catch {}
			await navigateWithRouter(router, signInTaskFallbackHref);
			return;
		}

		const destination =
			sessionTaskHref ?? redirectPath ?? authViewConfig.fallbackRedirectUrl;

		await navigateWithRouter(router, decorateUrl(destination));
	}

	async function finalizeSignIn(
		candidate: SignInCompletionCandidate | null | undefined = signIn,
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
			reportUnsupportedState(completionStatus);
			return;
		}

		const finalizeResponse = await finalize({
			navigate: navigateAfterAuth,
		});
		if (finalizeResponse?.error) {
			reportUnsupportedState(completionStatus);
		}
	}

	async function startOver() {
		if (signIn) {
			await signIn.reset();
		}

		setLocalError(null);
		setLocalEmailErrorMessage(null);
		setStep("email");
		setVerificationCode("");
		setEmailAddress(initialEmail);

		startTransition(() => {
			router.replace(buildSignInHref({ redirectPath }));
		});
	}

	async function startEmailCode() {
		if (!signIn) {
			return;
		}

		setLocalError(null);
		setLocalEmailErrorMessage(null);
		setIsSubmitting(true);

		try {
			const createResponse = await signIn.create({
				identifier: emailAddress,
			});
			if (createResponse.error) {
				return;
			}

			if (signIn.isTransferable) {
				reportMissingAccount();
				return;
			}

			if (getCompletionStatus(signIn) === "complete") {
				await finalizeSignIn(signIn);
				return;
			}

			const emailCodeFactor = getEmailCodeFirstFactor(signIn, emailAddress);
			if (!emailCodeFactor) {
				reportMissingEmailCodeFactor(signIn);
				return;
			}

			const sendCodeResponse = await signIn.emailCode.sendCode({
				emailAddressId: emailCodeFactor.emailAddressId,
			});
			if (sendCodeResponse.error) {
				return;
			}

			setVerificationCode("");
			setStep("email_code");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function submitEmailCode() {
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

	async function resendEmailCode() {
		if (!signIn) {
			return;
		}

		setLocalError(null);
		setIsSubmitting(true);

		try {
			const emailCodeFactor = getEmailCodeFirstFactor(signIn, emailAddress);
			if (!emailCodeFactor) {
				reportMissingEmailCodeFactor();
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
		emailAddress,
		emailError,
		globalErrors,
		isBusy,
		isEmailLocked: isInitialEmailLocked,
		isLoaded: Boolean(signIn),
		resendEmailCode,
		setEmailAddress: updateEmailAddress,
		setVerificationCode,
		startEmailCode,
		startOver,
		step: { kind: step },
		submitEmailCode,
		verificationCode,
		verificationError,
	};
}
