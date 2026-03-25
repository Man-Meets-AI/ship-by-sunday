"use client";

import { assertNever } from "@/features/course/lesson/lib/assert";

import { AuthPageShell } from "@/features/auth/sign-in/auth-page-shell";
import { SignInCredentialsForm } from "@/features/auth/sign-in/sign-in-credentials-form";
import { SignInResetForm } from "@/features/auth/sign-in/sign-in-reset-form";
import { SignInVerificationForm } from "@/features/auth/sign-in/sign-in-verification-form";
import { useSignInFlow } from "@/features/auth/sign-in/use-sign-in-flow";
import type { SignInStep } from "@/features/auth/sign-in/types";

function getPageCopy(step: SignInStep) {
	switch (step.kind) {
		case "credentials":
			return {
				description: "Use the account attached to your purchase to continue.",
				title: "Sign in",
			};
		case "reset_request":
			return {
				description:
					"We’ll email a reset code so you can get back into your account.",
				title: "Reset password",
			};
		case "reset_submit":
			return {
				description: "Set a new password, then we’ll sign you back in.",
				title: "Choose a new password",
			};
		case "reset_verify":
			return {
				description: "Enter the reset code from your inbox to keep going.",
				title: "Verify reset code",
			};
		case "verification":
			return {
				description:
					step.status === "needs_client_trust"
						? "Verify this device before we complete your sign-in."
						: "Complete the additional verification step to sign in.",
				title: "Verify your sign-in",
			};
		default:
			return assertNever(step, "Unsupported sign-in step");
	}
}

export function SignInPage() {
	const flow = useSignInFlow();
	const copy = getPageCopy(flow.step);

	return (
		<AuthPageShell title={copy.title} description={copy.description}>
			{flow.step.kind === "credentials" ? (
				<SignInCredentialsForm
					authError={flow.authError}
					emailAddress={flow.emailAddress}
					emailError={flow.emailError}
					globalErrors={flow.globalErrors}
					isBusy={flow.isBusy}
					isLoaded={flow.isLoaded}
					password={flow.password}
					passwordError={flow.passwordError}
					pricingHref={flow.pricingHref}
					setEmailAddress={flow.setEmailAddress}
					setPassword={flow.setPassword}
					startGoogleSignIn={flow.startGoogleSignIn}
					startPasswordReset={flow.startPasswordReset}
					submitPassword={flow.submitPassword}
				/>
			) : null}
			{flow.step.kind === "verification" && flow.activeVerificationMethod ? (
				<SignInVerificationForm
					activeVerificationMethod={flow.activeVerificationMethod}
					availableVerificationMethods={flow.availableVerificationMethods}
					globalErrors={flow.globalErrors}
					isBusy={flow.isBusy}
					verificationCode={flow.verificationCode}
					verificationError={flow.verificationError}
					selectVerificationMethod={flow.selectVerificationMethod}
					resendVerificationCode={flow.resendVerificationCode}
					setVerificationCode={flow.setVerificationCode}
					startOver={flow.startOver}
					status={flow.step.status}
					submitVerification={flow.submitVerification}
				/>
			) : null}
			{flow.step.kind === "reset_request" ||
			flow.step.kind === "reset_verify" ||
			flow.step.kind === "reset_submit" ? (
				<SignInResetForm
					emailAddress={flow.emailAddress}
					emailError={flow.emailError}
					globalErrors={flow.globalErrors}
					isBusy={flow.isBusy}
					newPassword={flow.newPassword}
					passwordError={flow.passwordError}
					resetStep={flow.step.kind}
					setEmailAddress={flow.setEmailAddress}
					setNewPassword={flow.setNewPassword}
					setVerificationCode={flow.setVerificationCode}
					startOver={flow.startOver}
					submitNewPassword={flow.submitNewPassword}
					submitPasswordResetRequest={flow.submitPasswordResetRequest}
					submitResetCode={flow.submitResetCode}
					verificationCode={flow.verificationCode}
					verificationError={flow.verificationError}
				/>
			) : null}
		</AuthPageShell>
	);
}
