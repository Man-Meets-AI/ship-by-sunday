"use client";

import { AlertCircleIcon } from "lucide-react";
import type { FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { assertNever } from "@/lib/assert";

import { SignInResetFields } from "@/features/auth/sign-in/sign-in-reset-fields";
import type { SignInStep } from "@/features/auth/sign-in/types";

type SignInResetFormProps = {
	emailAddress: string;
	emailError: { message?: string } | null;
	globalErrors: Array<{ message?: string }> | null;
	isBusy: boolean;
	newPassword: string;
	passwordError: { message?: string } | null;
	resetStep: Extract<
		SignInStep,
		{ kind: "reset_request" | "reset_verify" | "reset_submit" }
	>["kind"];
	setEmailAddress: (value: string) => void;
	setNewPassword: (value: string) => void;
	setVerificationCode: (value: string) => void;
	startOver: () => Promise<void>;
	submitNewPassword: () => Promise<void>;
	submitPasswordResetRequest: () => Promise<void>;
	submitResetCode: () => Promise<void>;
	verificationCode: string;
	verificationError: { message?: string } | null;
};

function getResetCopy(
	step: Extract<
		SignInStep,
		{ kind: "reset_request" | "reset_verify" | "reset_submit" }
	>["kind"],
) {
	switch (step) {
		case "reset_request":
			return {
				description:
					"Enter the email address attached to your purchased account.",
				submitLabel: "Send reset code",
			};
		case "reset_submit":
			return {
				description: "Choose a new password for this account.",
				submitLabel: "Save new password",
			};
		case "reset_verify":
			return {
				description: "Enter the reset code from your email to keep going.",
				submitLabel: "Verify reset code",
			};
		default:
			return assertNever(step, "Unsupported reset step");
	}
}

export function SignInResetForm({
	emailAddress,
	emailError,
	globalErrors,
	isBusy,
	newPassword,
	passwordError,
	resetStep,
	setEmailAddress,
	setNewPassword,
	setVerificationCode,
	startOver,
	submitNewPassword,
	submitPasswordResetRequest,
	submitResetCode,
	verificationCode,
	verificationError,
}: SignInResetFormProps) {
	const copy = getResetCopy(resetStep);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		switch (resetStep) {
			case "reset_request":
				await submitPasswordResetRequest();
				return;
			case "reset_submit":
				await submitNewPassword();
				return;
			case "reset_verify":
				await submitResetCode();
				return;
			default:
				return;
		}
	}

	return (
		<div className="flex flex-col gap-5">
			{globalErrors?.length ? (
				<Alert variant="destructive">
					<AlertCircleIcon aria-hidden />
					<AlertTitle>We couldn&apos;t continue the reset.</AlertTitle>
					<AlertDescription>
						{globalErrors[0]?.message ??
							"Try again with the purchased account email."}
					</AlertDescription>
				</Alert>
			) : null}
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<SignInResetFields
					copy={copy}
					emailAddress={emailAddress}
					emailError={emailError}
					isBusy={isBusy}
					newPassword={newPassword}
					passwordError={passwordError}
					resetStep={resetStep}
					setEmailAddress={setEmailAddress}
					setNewPassword={setNewPassword}
					setVerificationCode={setVerificationCode}
					verificationCode={verificationCode}
					verificationError={verificationError}
				/>
				<Button className="w-full" disabled={isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					{copy.submitLabel}
				</Button>
			</form>
			<Button
				type="button"
				variant="link"
				size="sm"
				className="h-auto justify-start px-0"
				disabled={isBusy}
				onClick={() => void startOver()}
			>
				Back to sign in
			</Button>
		</div>
	);
}
