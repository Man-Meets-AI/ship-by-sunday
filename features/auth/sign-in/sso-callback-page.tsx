"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/spinner";
import { AuthPageShell } from "@/features/auth/sign-in/auth-page-shell";
import {
	buildSessionTaskHref,
	buildSignInHref,
	getBlockedGoogleSignInHref,
	getSafeRedirectPath,
} from "@/features/auth/sign-in/sign-in-route-utils";

type SsoCallbackPageProps = {
	redirectPath?: string | null;
};

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

export function SsoCallbackPage({ redirectPath }: SsoCallbackPageProps) {
	const clerk = useClerk();
	const { signIn } = useSignIn();
	const { signUp } = useSignUp();
	const router = useRouter();
	const hasRun = useRef(false);

	const safeRedirectPath = getSafeRedirectPath(redirectPath);
	const signInHref = buildSignInHref({ redirectPath: safeRedirectPath });
	const blockedGoogleHref = getBlockedGoogleSignInHref(safeRedirectPath);

	useEffect(() => {
		if (!clerk.loaded || !signIn || !signUp || hasRun.current) {
			return;
		}

		hasRun.current = true;

		const navigateAfterAuth = async ({
			decorateUrl,
			session,
		}: {
			decorateUrl: (url: string) => string;
			session?: { currentTask?: { key: string } | null } | null;
		}) => {
			const destination = session?.currentTask
				? buildSessionTaskHref(session.currentTask.key, safeRedirectPath)
				: safeRedirectPath;

			await navigateWithRouter(router, decorateUrl(destination));
		};

		void (async () => {
			if (signIn.status === "complete") {
				await signIn.finalize({ navigate: navigateAfterAuth });
				return;
			}

			if (signUp.isTransferable) {
				await signIn.create({ transfer: true });
				const nextSignInStatus = signIn.status as typeof signIn.status | "complete";

				if (nextSignInStatus === "complete") {
					await signIn.finalize({ navigate: navigateAfterAuth });
					return;
				}

				await navigateWithRouter(router, signInHref);
				return;
			}

			if (signIn.isTransferable || signUp.status === "complete") {
				await navigateWithRouter(router, blockedGoogleHref);
				return;
			}

			if (
				signIn.status === "needs_client_trust" ||
				signIn.status === "needs_first_factor" ||
				signIn.status === "needs_new_password" ||
				signIn.status === "needs_second_factor"
			) {
				await navigateWithRouter(router, signInHref);
				return;
			}

			const sessionId =
				signIn.existingSession?.sessionId ?? signUp.existingSession?.sessionId;

			if (sessionId) {
				await clerk.setActive({
					session: sessionId,
					navigate: navigateAfterAuth,
				});
				return;
			}

			await navigateWithRouter(router, blockedGoogleHref);
		})();
	}, [blockedGoogleHref, clerk, router, safeRedirectPath, signIn, signInHref, signUp]);

	return (
		<AuthPageShell
			title="Completing Google sign-in"
			description="Hang tight while we finish the secure redirect."
		>
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Spinner />
				<span>Finalizing your sign-in…</span>
			</div>
		</AuthPageShell>
	);
}
