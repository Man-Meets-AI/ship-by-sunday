"use client";

import { AlertCircleIcon } from "lucide-react";
import type { FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { assertNever } from "@/features/course/lesson/lib/assert";

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
				description: "Enter the email address attached to your purchased account.",
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
						{globalErrors[0]?.message ?? "Try again with the purchased account email."}
					</AlertDescription>
				</Alert>
			) : null}
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<FieldGroup>
					<FieldDescription>{copy.description}</FieldDescription>
					{resetStep === "reset_request" ? (
						<Field data-invalid={Boolean(emailError) || undefined}>
							<FieldLabel htmlFor="sign-in-reset-email">Email</FieldLabel>
							<Input
								id="sign-in-reset-email"
								autoComplete="email"
								aria-invalid={Boolean(emailError) || undefined}
								disabled={isBusy}
								placeholder="you@company.com"
								type="email"
								value={emailAddress}
								onChange={(event) => setEmailAddress(event.target.value)}
							/>
							<FieldError errors={[emailError ?? undefined]} />
						</Field>
					) : null}
					{resetStep === "reset_submit" ? (
						<Field data-invalid={Boolean(passwordError) || undefined}>
							<FieldLabel htmlFor="sign-in-new-password">New password</FieldLabel>
							<Input
								id="sign-in-new-password"
								autoComplete="new-password"
								aria-invalid={Boolean(passwordError) || undefined}
								disabled={isBusy}
								type="password"
								value={newPassword}
								onChange={(event) => setNewPassword(event.target.value)}
							/>
							<FieldError errors={[passwordError ?? undefined]} />
						</Field>
					) : null}
					{resetStep === "reset_verify" ? (
						<Field data-invalid={Boolean(verificationError) || undefined}>
							<FieldLabel htmlFor="sign-in-reset-code">Reset code</FieldLabel>
							<InputOTP
								id="sign-in-reset-code"
								inputMode="numeric"
								maxLength={6}
								value={verificationCode}
								onChange={setVerificationCode}
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
							<FieldError errors={[verificationError ?? undefined]} />
						</Field>
					) : null}
				</FieldGroup>
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
