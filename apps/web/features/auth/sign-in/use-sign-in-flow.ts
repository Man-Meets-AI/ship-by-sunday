"use client";

import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { authViewConfig, routeConfig } from "@/config/product";
import { assertNever } from "@/lib/assert";
import { reportClientError } from "@/features/observability/lib/client-error-report";

import {
	buildSignInHref,
	buildSsoCallbackHref,
	getSessionTaskHref,
	getSafeRedirectPath,
	getSignInAuthError,
} from "@/features/auth/sign-in/sign-in-route-utils";
import type {
	SignInStep,
	VerificationMethod,
	VerificationStatus,
} from "@/features/auth/sign-in/types";

function isVerificationStatus(
	value: string | null | undefined,
): value is VerificationStatus {
	return value === "needs_client_trust" || value === "needs_second_factor";
}

function isCodeVerificationMethod(
	value: VerificationMethod | null,
): value is "email_code" | "phone_code" {
	return value === "email_code" || value === "phone_code";
}

function getAvailableVerificationMethods(
	methods: Array<{ strategy: string }> | undefined,
): VerificationMethod[] {
	if (!methods?.length) {
		return [];
	}

	return methods
		.map((method) => method.strategy)
		.filter(
			(strategy): strategy is VerificationMethod =>
				strategy === "email_code" ||
				strategy === "phone_code" ||
				strategy === "totp" ||
				strategy === "backup_code",
		);
}

function getDefaultVerificationMethod(
	methods: VerificationMethod[],
): VerificationMethod | null {
	if (!methods.length) {
		return null;
	}

	if (methods.includes("email_code")) {
		return "email_code";
	}

	if (methods.includes("phone_code")) {
		return "phone_code";
	}

	if (methods.includes("totp")) {
		return "totp";
	}

	if (methods.includes("backup_code")) {
		return "backup_code";
	}

	return null;
}

function getRenderableErrors(
	errors: Array<unknown> | null,
): Array<{ message?: string }> | null {
	if (!errors?.length) {
		return null;
	}

	return errors.filter(
		(error): error is { message?: string } =>
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

type ResetStep =
	| Extract<
			SignInStep,
			{ kind: "reset_request" | "reset_verify" | "reset_submit" }
	  >["kind"]
	| null;

export function useSignInFlow() {
	const clerk = useClerk();
	const { errors, fetchStatus, signIn } = useSignIn();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [emailAddress, setEmailAddress] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [password, setPassword] = useState("");
	const [resetStep, setResetStep] = useState<ResetStep>(null);
	const [selectedVerificationMethod, setSelectedVerificationMethod] =
		useState<VerificationMethod | null>(null);
	const [verificationCode, setVerificationCode] = useState("");
	const [isStartingGoogle, setIsStartingGoogle] = useState(false);
	const sentVerificationMethodRef = useRef<VerificationMethod | null>(null);

	type SignInCompletionCandidate = {
		status?: string | null;
		finalize?: typeof signIn.finalize;
		createdSessionId?: string | null;
		error?: unknown;
	};

	const redirectPath = getSafeRedirectPath(searchParams.get("redirect_url"));
	const authError = getSignInAuthError(searchParams.get("auth_error"));
	const hasExplicitRedirect = searchParams.has("redirect_url");
	const availableVerificationMethods = useMemo(
		() => getAvailableVerificationMethods(signIn?.supportedSecondFactors),
		[signIn?.supportedSecondFactors],
	);
	const activeVerificationMethod =
		selectedVerificationMethod &&
		availableVerificationMethods.includes(selectedVerificationMethod)
			? selectedVerificationMethod
			: getDefaultVerificationMethod(availableVerificationMethods);
	const step: SignInStep = useMemo(() => {
		if (resetStep) {
			return { kind: resetStep };
		}

		if (signIn?.status === "needs_new_password") {
			return { kind: "reset_submit" };
		}

		if (
			signIn &&
			isVerificationStatus(signIn.status) &&
			activeVerificationMethod
		) {
			return {
				kind: "verification",
				method: activeVerificationMethod,
				status: signIn.status,
			};
		}

		return { kind: "credentials" };
	}, [activeVerificationMethod, resetStep, signIn]);

	const isBusy = fetchStatus === "fetching" || isStartingGoogle;
	const isColdDefaultVisit =
		step.kind === "credentials" && !hasExplicitRedirect && !authError;

	useEffect(() => {
		if (
			!signIn ||
			!isVerificationStatus(signIn.status) ||
			!activeVerificationMethod
		) {
			sentVerificationMethodRef.current = null;
			return;
		}

		if (!isCodeVerificationMethod(activeVerificationMethod)) {
			return;
		}

		if (sentVerificationMethodRef.current === activeVerificationMethod) {
			return;
		}

		sentVerificationMethodRef.current = activeVerificationMethod;

		void (async () => {
			const response =
				activeVerificationMethod === "email_code"
					? await signIn.mfa.sendEmailCode()
					: await signIn.mfa.sendPhoneCode();

			if (response.error) {
				sentVerificationMethodRef.current = null;
			}
		})();
	}, [activeVerificationMethod, signIn]);

	useEffect(() => {
		setVerificationCode("");
	}, [activeVerificationMethod, step.kind]);

	function clearTransientBanner() {
		if (!authError) {
			return;
		}

		startTransition(() => {
			router.replace(buildSignInHref({ redirectPath }));
		});
	}

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
		const completionStatus = getCompletionStatus(candidate);
		const finalize = getFinalizeFunction(candidate);
		const createdSessionId = getCreatedSessionId(candidate);

		if (createdSessionId) {
			await clerk.setActive({
				session: createdSessionId,
				navigate: navigateAfterAuth,
			});
			return;
		}

		if (!finalize || completionStatus !== "complete") {
			return;
		}

		await finalize({
			navigate: navigateAfterAuth,
		});
	}

	async function startOver() {
		clearTransientBanner();

		if (signIn) {
			await signIn.reset();
		}

		setNewPassword("");
		setPassword("");
		setResetStep(null);
		setSelectedVerificationMethod(null);
		setVerificationCode("");
		sentVerificationMethodRef.current = null;

		startTransition(() => {
			router.replace(buildSignInHref({ redirectPath }));
		});
	}

	async function submitPassword() {
		if (!signIn) {
			return;
		}

		clearTransientBanner();
		setResetStep(null);

		const response = await signIn.password({
			identifier: emailAddress,
			password,
		});

		if (process.env.NODE_ENV === "development") {
			console.info("submitPassword response", {
				keys: Object.keys(response),
				createdSessionId:
					"createdSessionId" in response ? response.createdSessionId : null,
				error: response.error,
				responseStatus: "status" in response ? response.status : null,
				signInStatus: signIn.status,
			});
		}

		if (response.error) {
			return;
		}

		setPassword("");
		await finalizeSignIn(response);
	}

	async function startGoogleSignIn() {
		if (!signIn) {
			return;
		}

		clearTransientBanner();
		setIsStartingGoogle(true);

		try {
			const response = await signIn.sso({
				strategy: "oauth_google",
				redirectUrl: redirectPath,
				redirectCallbackUrl: buildSsoCallbackHref(redirectPath),
			});

			if (response.error) {
				setIsStartingGoogle(false);
			}
		} catch {
			setIsStartingGoogle(false);
		}
	}

	async function startPasswordReset() {
		clearTransientBanner();

		if (signIn) {
			await signIn.reset();
		}

		setPassword("");
		setResetStep("reset_request");
		setSelectedVerificationMethod(null);
		setVerificationCode("");
		sentVerificationMethodRef.current = null;
	}

	async function submitPasswordResetRequest() {
		if (!signIn) {
			return;
		}

		clearTransientBanner();
		await signIn.reset();

		const createResponse = await signIn.create({
			identifier: emailAddress,
		});

		if (createResponse.error) {
			return;
		}

		const sendCodeResponse = await signIn.resetPasswordEmailCode.sendCode();

		if (sendCodeResponse.error) {
			return;
		}

		setResetStep("reset_verify");
		setVerificationCode("");
	}

	async function submitResetCode() {
		if (!signIn) {
			return;
		}

		const response = await signIn.resetPasswordEmailCode.verifyCode({
			code: verificationCode,
		});

		if (response.error) {
			return;
		}

		if (signIn.status === "needs_new_password") {
			setResetStep("reset_submit");
			setVerificationCode("");
		}
	}

	async function submitNewPassword() {
		if (!signIn) {
			return;
		}

		const response = await signIn.resetPasswordEmailCode.submitPassword({
			password: newPassword,
		});

		if (response.error) {
			return;
		}

		setNewPassword("");
		await finalizeSignIn(response);
	}

	async function submitVerification() {
		if (!signIn || !activeVerificationMethod) {
			return;
		}

		let response: Awaited<ReturnType<typeof signIn.mfa.verifyBackupCode>>;

		switch (activeVerificationMethod) {
			case "backup_code":
				response = await signIn.mfa.verifyBackupCode({
					code: verificationCode,
				});
				break;
			case "email_code":
				response = await signIn.mfa.verifyEmailCode({ code: verificationCode });
				break;
			case "phone_code":
				response = await signIn.mfa.verifyPhoneCode({ code: verificationCode });
				break;
			case "totp":
				response = await signIn.mfa.verifyTOTP({ code: verificationCode });
				break;
			default:
				assertNever(
					activeVerificationMethod,
					"Unsupported verification method",
				);
		}

		if (response.error) {
			return;
		}

		await finalizeSignIn(response);
	}

	async function resendVerificationCode() {
		if (!signIn || !isCodeVerificationMethod(activeVerificationMethod)) {
			return;
		}

		sentVerificationMethodRef.current = activeVerificationMethod;

		if (activeVerificationMethod === "email_code") {
			await signIn.mfa.sendEmailCode();
			return;
		}

		await signIn.mfa.sendPhoneCode();
	}

	function selectVerificationMethod(method: VerificationMethod) {
		setSelectedVerificationMethod(method);
		setVerificationCode("");
		sentVerificationMethodRef.current = null;
	}

	return {
		authError,
		availableVerificationMethods,
		emailAddress,
		emailError: errors.fields.identifier,
		globalErrors: getRenderableErrors(errors.global ?? errors.raw),
		isBusy,
		isColdDefaultVisit,
		isLoaded: Boolean(signIn),
		newPassword,
		password,
		passwordError: errors.fields.password,
		step,
		verificationCode,
		verificationError: errors.fields.code,
		activeVerificationMethod,
		setEmailAddress,
		setNewPassword,
		setPassword,
		setVerificationCode,
		resendVerificationCode,
		selectVerificationMethod,
		startGoogleSignIn,
		startOver,
		startPasswordReset,
		submitNewPassword,
		submitPassword,
		submitPasswordResetRequest,
		submitResetCode,
		submitVerification,
	};
}
