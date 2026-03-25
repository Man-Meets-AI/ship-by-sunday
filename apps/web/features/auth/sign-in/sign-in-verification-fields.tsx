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

type SignInVerificationFieldsProps = {
	copy: {
		description: string;
		label: string;
		usesOtp: boolean;
	};
	isBusy: boolean;
	setVerificationCode: (value: string) => void;
	verificationCode: string;
	verificationError: { message?: string } | null;
};

export function SignInVerificationFields({
	copy,
	isBusy,
	setVerificationCode,
	verificationCode,
	verificationError,
}: SignInVerificationFieldsProps) {
	return (
		<FieldGroup>
			<Field data-invalid={Boolean(verificationError) || undefined}>
				<FieldLabel htmlFor="sign-in-verification-code">
					{copy.label}
				</FieldLabel>
				<FieldDescription>{copy.description}</FieldDescription>
				{copy.usesOtp ? (
					<InputOTP
						id="sign-in-verification-code"
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
				) : (
					<Input
						id="sign-in-verification-code"
						autoComplete="one-time-code"
						aria-invalid={Boolean(verificationError) || undefined}
						disabled={isBusy}
						value={verificationCode}
						onChange={(event) => setVerificationCode(event.target.value)}
					/>
				)}
				<FieldError errors={[verificationError ?? undefined]} />
			</Field>
		</FieldGroup>
	);
}
