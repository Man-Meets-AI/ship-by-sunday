"use client";

import { AlertCircleIcon } from "lucide-react";
import type { FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { getVerificationCopy } from "@/app/(identity)/_components/sign-in/sign-in-verification-copy";
import { SignInVerificationActions } from "@/app/(identity)/_components/sign-in/sign-in-verification-actions";
import { SignInVerificationFields } from "@/app/(identity)/_components/sign-in/sign-in-verification-fields";
import type {
	VerificationMethod,
	VerificationStatus,
} from "@/app/(identity)/_components/sign-in/sign-in-flow-types";

type SignInVerificationFormProps = {
	activeVerificationMethod: VerificationMethod;
	availableVerificationMethods: VerificationMethod[];
	globalErrors: Array<{ message?: string }> | null;
	isBusy: boolean;
	verificationCode: string;
	verificationError: { message?: string } | null;
	selectVerificationMethod: (method: VerificationMethod) => void;
	resendVerificationCode: () => Promise<void>;
	setVerificationCode: (value: string) => void;
	startOver: () => Promise<void>;
	status: VerificationStatus;
	submitVerification: () => Promise<void>;
};

export function SignInVerificationForm({
	activeVerificationMethod,
	availableVerificationMethods,
	globalErrors,
	isBusy,
	verificationCode,
	verificationError,
	selectVerificationMethod,
	resendVerificationCode,
	setVerificationCode,
	startOver,
	status,
	submitVerification,
}: SignInVerificationFormProps) {
	const copy = getVerificationCopy(activeVerificationMethod, status);
	const alternateMethods = availableVerificationMethods.filter(
		(method) => method !== activeVerificationMethod,
	);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		await submitVerification();
	}

	return (
		<div className="flex flex-col gap-5">
			{globalErrors?.length ? (
				<Alert variant="destructive">
					<AlertCircleIcon aria-hidden />
					<AlertTitle>Verification failed.</AlertTitle>
					<AlertDescription>
						{globalErrors[0]?.message ?? "Double-check the code and try again."}
					</AlertDescription>
				</Alert>
			) : null}
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<SignInVerificationFields
					copy={copy}
					isBusy={isBusy}
					setVerificationCode={setVerificationCode}
					verificationCode={verificationCode}
					verificationError={verificationError}
				/>
				<Button className="w-full" disabled={isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					{copy.submitLabel}
				</Button>
			</form>
			<SignInVerificationActions
				activeVerificationMethod={activeVerificationMethod}
				alternateMethods={alternateMethods}
				isBusy={isBusy}
				resendVerificationCode={resendVerificationCode}
				selectVerificationMethod={selectVerificationMethod}
				startOver={startOver}
			/>
		</div>
	);
}
