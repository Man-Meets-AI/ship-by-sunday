import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

import { Spinner } from "@/components/ui/spinner";
import { authViewConfig } from "@/config/product";
import { AuthPageShell } from "@/features/auth/sign-in/auth-page-shell";
import {
	buildSignInHref,
	getBlockedGoogleSignInHref,
	getSafeRedirectPath,
} from "@/features/auth/sign-in/sign-in-route-utils";

type SsoCallbackPageProps = {
	redirectPath?: string | null;
};

export function SsoCallbackPage({ redirectPath }: SsoCallbackPageProps) {
	const safeRedirectPath = getSafeRedirectPath(redirectPath);
	const signInHref = buildSignInHref({ redirectPath: safeRedirectPath });
	const blockedGoogleHref = getBlockedGoogleSignInHref(safeRedirectPath);

	return (
		<AuthPageShell
			title="Completing Google sign-in"
			description="Hang tight while we finish the secure redirect."
		>
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Spinner />
				<span>Finalizing your sign-in…</span>
			</div>
			<AuthenticateWithRedirectCallback
				transferable={false}
				continueSignUpUrl={blockedGoogleHref}
				firstFactorUrl={signInHref}
				resetPasswordUrl={signInHref}
				secondFactorUrl={signInHref}
				signInFallbackRedirectUrl={
					safeRedirectPath ?? authViewConfig.fallbackRedirectUrl
				}
				signInUrl={blockedGoogleHref}
				signUpFallbackRedirectUrl={blockedGoogleHref}
				signUpUrl={blockedGoogleHref}
			/>
		</AuthPageShell>
	);
}
