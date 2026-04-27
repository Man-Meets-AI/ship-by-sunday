"use client";

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

import type { SignInStep } from "@/app/(identity)/_components/sign-in/sign-in-flow-types";

type ResetStep = Extract<
	SignInStep,
	{ kind: "reset_request" | "reset_verify" | "reset_submit" }
>["kind"];

type SignInResetFieldsProps = {
	copy: {
		description: string;
		submitLabel: string;
	};
	emailAddress: string;
	emailError: { message?: string } | null;
	isBusy: boolean;
	newPassword: string;
	passwordError: { message?: string } | null;
	resetStep: ResetStep;
	setEmailAddress: (value: string) => void;
	setNewPassword: (value: string) => void;
	setVerificationCode: (value: string) => void;
	verificationCode: string;
	verificationError: { message?: string } | null;
};

export function SignInResetFields({
	copy,
	emailAddress,
	emailError,
	isBusy,
	newPassword,
	passwordError,
	resetStep,
	setEmailAddress,
	setNewPassword,
	setVerificationCode,
	verificationCode,
	verificationError,
}: SignInResetFieldsProps) {
	return (
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
	);
}
