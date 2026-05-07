"use client";

import { SignInEmailCodeForm } from "@/app/(identity)/_components/sign-in/sign-in-email-code-form";
import { getSignInPageContent } from "@/app/(identity)/_components/sign-in/sign-in-page-content";
import { useSignInFlow } from "@/app/(identity)/_components/sign-in/use-sign-in-flow";

import { AuthPageShell } from "./auth-page-shell";

export function SignInPage() {
	const flow = useSignInFlow();
	const content = getSignInPageContent({
		step: flow.step,
	});

	return (
		<AuthPageShell title={content.title} description={content.description}>
			<SignInEmailCodeForm
				emailAddress={flow.emailAddress}
				emailError={flow.emailError}
				globalErrors={flow.globalErrors}
				isBusy={flow.isBusy}
				isLoaded={flow.isLoaded}
				resendEmailCode={flow.resendEmailCode}
				setEmailAddress={flow.setEmailAddress}
				setVerificationCode={flow.setVerificationCode}
				startEmailCode={flow.startEmailCode}
				startOver={flow.startOver}
				step={flow.step.kind}
				submitEmailCode={flow.submitEmailCode}
				verificationCode={flow.verificationCode}
				verificationError={flow.verificationError}
			/>
		</AuthPageShell>
	);
}
