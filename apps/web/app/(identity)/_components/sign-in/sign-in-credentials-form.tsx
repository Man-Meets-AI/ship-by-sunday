"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { SignInBanners } from "@/app/(identity)/_components/sign-in/sign-in-banners";
import { SignInCredentialFields } from "@/app/(identity)/_components/sign-in/sign-in-credential-fields";
import { SignInSecondaryActions } from "@/app/(identity)/_components/sign-in/sign-in-secondary-actions";

type SignInCredentialsFormProps = {
	emailAddress: string;
	emailError: { message?: string } | null;
	globalErrors: Array<{ message?: string }> | null;
	isBusy: boolean;
	isLoaded: boolean;
	password: string;
	passwordError: { message?: string } | null;
	setEmailAddress: (value: string) => void;
	setPassword: (value: string) => void;
	signUpHref?: string | null;
	startPasswordReset: () => Promise<void>;
	submitPassword: () => Promise<void>;
};

export function SignInCredentialsForm({
	emailAddress,
	emailError,
	globalErrors,
	isBusy,
	isLoaded,
	password,
	passwordError,
	setEmailAddress,
	setPassword,
	signUpHref,
	startPasswordReset,
	submitPassword,
}: SignInCredentialsFormProps) {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		await submitPassword();
	}

	return (
		<div className="flex flex-col gap-5">
			<SignInBanners globalErrors={globalErrors} />
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<SignInCredentialFields
					emailAddress={emailAddress}
					emailError={emailError}
					isBusy={isBusy}
					isLoaded={isLoaded}
					password={password}
					passwordError={passwordError}
					setEmailAddress={setEmailAddress}
					setPassword={setPassword}
				/>
				<Button className="w-full" disabled={!isLoaded || isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					Sign in
				</Button>
			</form>
			<SignInSecondaryActions
				isBusy={isBusy}
				isLoaded={isLoaded}
				signUpHref={signUpHref}
				startPasswordReset={startPasswordReset}
			/>
		</div>
	);
}
