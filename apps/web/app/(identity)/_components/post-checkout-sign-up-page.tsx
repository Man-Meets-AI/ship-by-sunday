"use client";

import { PostCheckoutSignUpForm } from "@/app/(identity)/_components/sign-up/post-checkout-sign-up-form";
import { usePostCheckoutSignUpFlow } from "@/app/(identity)/_components/sign-up/use-post-checkout-sign-up-flow";

import { AuthPageShell } from "./auth-page-shell";

const postCheckoutSignUpSupportPanel = {
	bullets: [
		"This account is being created for the exact email used during checkout.",
		"After verification, we send you back to the paid access handoff automatically.",
		"This route exists only to attach the paid Stripe session to the right Clerk account.",
	],
	description:
		"Finish creating the account that will own this purchase. The email is locked to the completed checkout.",
	title: "Create the account for this paid checkout.",
} as const;

export function PostCheckoutSignUpPage({
	checkoutEmail,
	redirectPath,
}: {
	checkoutEmail: string;
	redirectPath: string;
}) {
	const flow = usePostCheckoutSignUpFlow({
		lockedEmailAddress: checkoutEmail,
		redirectPath,
	});

	return (
		<AuthPageShell
			title="Create your account"
			description="Finish account setup with the same email used during checkout so we can attach your purchase correctly."
			supportPanel={postCheckoutSignUpSupportPanel}
		>
			<PostCheckoutSignUpForm
				emailAddress={checkoutEmail}
				emailError={flow.emailError}
				globalErrors={flow.globalErrors}
				isBusy={flow.isBusy}
				password={flow.password}
				passwordError={flow.passwordError}
				resendVerificationCode={flow.resendVerificationCode}
				setPassword={flow.setPassword}
				setVerificationCode={flow.setVerificationCode}
				step={flow.step}
				submitSignUp={flow.submitSignUp}
				submitVerification={flow.submitVerification}
				verificationCode={flow.verificationCode}
				verificationError={flow.verificationError}
			/>
		</AuthPageShell>
	);
}
