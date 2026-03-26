"use client";

import { AuthPageShell } from "@/features/auth/sign-in/auth-page-shell";
import { SignInCredentialsForm } from "@/features/auth/sign-in/sign-in-credentials-form";
import { getSignInPageContent } from "@/features/auth/sign-in/sign-in-page-content";
import { SignInResetForm } from "@/features/auth/sign-in/sign-in-reset-form";
import { SignInVerificationForm } from "@/features/auth/sign-in/sign-in-verification-form";
import { useSignInFlow } from "@/features/auth/sign-in/use-sign-in-flow";

export function SignInPage() {
	const flow = useSignInFlow();
	const content = getSignInPageContent({
		authError: flow.authError,
		isColdDefaultVisit: flow.isColdDefaultVisit,
		step: flow.step,
	});

	return (
		<AuthPageShell
			title={content.title}
			description={content.description}
			supportPanel={content.supportPanel}
		>
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
