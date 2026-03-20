"use client";

import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type SignInCredentialFieldsProps = {
	emailAddress: string;
	emailError: { message?: string } | null;
	isBusy: boolean;
	isLoaded: boolean;
	password: string;
	passwordError: { message?: string } | null;
	setEmailAddress: (value: string) => void;
	setPassword: (value: string) => void;
};

export function SignInCredentialFields({
	emailAddress,
	emailError,
	isBusy,
	isLoaded,
	password,
	passwordError,
	setEmailAddress,
	setPassword,
}: SignInCredentialFieldsProps) {
	return (
		<FieldGroup>
			<Field data-invalid={Boolean(emailError) || undefined}>
				<FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
				<Input
					id="sign-in-email"
					autoComplete="email"
					disabled={!isLoaded || isBusy}
					aria-invalid={Boolean(emailError) || undefined}
					placeholder="you@company.com"
					type="email"
					value={emailAddress}
					onChange={(event) => setEmailAddress(event.target.value)}
				/>
				<FieldError errors={[emailError ?? undefined]} />
			</Field>
			<Field data-invalid={Boolean(passwordError) || undefined}>
				<FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
				<Input
					id="sign-in-password"
					autoComplete="current-password"
					disabled={!isLoaded || isBusy}
					aria-invalid={Boolean(passwordError) || undefined}
					placeholder="Enter your password"
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
				<FieldError errors={[passwordError ?? undefined]} />
			</Field>
		</FieldGroup>
	);
}
