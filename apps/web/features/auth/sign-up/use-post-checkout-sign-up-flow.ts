"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
	buildSignInHref,
	getSessionTaskHref,
	getSafeRedirectPath,
} from "@/features/auth/sign-in/sign-in-route-utils";
import { reportClientError } from "@/features/observability/lib/client-error-report";

type SignUpStep = "create" | "verify";

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

export function usePostCheckoutSignUpFlow({
	lockedEmailAddress,
	redirectPath,
}: {
	lockedEmailAddress: string;
	redirectPath: string;
}) {
	const clerk = useClerk();
	const { signIn } = useSignIn();
	const { errors, fetchStatus, signUp } = useSignUp();
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [verificationCode, setVerificationCode] = useState("");

	const safeRedirectPath = getSafeRedirectPath(redirectPath);
	const step: SignUpStep = useMemo(() => {
		if (
			signUp.status === "missing_requirements" &&
			signUp.unverifiedFields.includes("email_address") &&
			signUp.missingFields.length === 0
		) {
			return "verify";
		}

		return "create";
	}, [signUp]);

	async function navigateAfterAuth({
		decorateUrl,
		session,
	}: {
		decorateUrl: (url: string) => string;
		session?: { currentTask?: { key: string } | null } | null;
	}) {
		const sessionTaskHref = session?.currentTask
			? getSessionTaskHref(session.currentTask.key, safeRedirectPath)
			: null;
		if (session?.currentTask && !sessionTaskHref) {
			const signInTaskFallbackHref = decorateUrl(
				buildSignInHref({ redirectPath: safeRedirectPath }),
			);
			reportClientError({
				error: new Error("Unknown Clerk session task."),
				pathname: "/sign-up",
				code: "clerk_unknown_session_task",
				severity: "high",
				details: {
					redirectPath: safeRedirectPath,
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

		await navigateWithRouter(
			router,
			decorateUrl(sessionTaskHref ?? safeRedirectPath),
		);
	}

	async function transferToSignIn() {
		const response = await signIn.create({ transfer: true });
		if (response.error) {
			return;
		}

		if (signIn.status === "complete") {
			await signIn.finalize({
				navigate: navigateAfterAuth,
			});
			return;
		}

		await navigateWithRouter(
			router,
			buildSignInHref({ redirectPath: safeRedirectPath }),
		);
	}

	async function submitSignUp() {
		const createResponse = await signUp.create({
			emailAddress: lockedEmailAddress,
		});
		if (createResponse.error) {
			if (signUp.isTransferable) {
				await transferToSignIn();
			}
			return;
		}

		const passwordResponse = await signUp.password({
			emailAddress: lockedEmailAddress,
			password,
		});
		if (passwordResponse.error) {
			if (signUp.isTransferable) {
				await transferToSignIn();
			}
			return;
		}

		if (signUp.isTransferable) {
			await transferToSignIn();
			return;
		}

		if (signUp.status === "complete") {
			await signUp.finalize({
				navigate: navigateAfterAuth,
			});
			return;
		}

		if (
			signUp.status === "missing_requirements" &&
			signUp.unverifiedFields.includes("email_address")
		) {
			await signUp.verifications.sendEmailCode();
		}
	}

	async function submitVerification() {
		const response = await signUp.verifications.verifyEmailCode({
			code: verificationCode,
		});
		if (response.error) {
			return;
		}

		if (signUp.status === "complete") {
			await signUp.finalize({
				navigate: navigateAfterAuth,
			});
		}
	}

	async function resendVerificationCode() {
		await signUp.verifications.sendEmailCode();
	}

	return {
		emailError: errors.fields.emailAddress,
		globalErrors: getRenderableErrors(errors.global),
		isBusy: fetchStatus === "fetching",
		password,
		passwordError: errors.fields.password,
		resendVerificationCode,
		setPassword,
		setVerificationCode,
		step,
		submitSignUp,
		submitVerification,
		verificationCode,
		verificationError: errors.fields.code,
	};
}
