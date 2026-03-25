"use client";

import { Button } from "@/components/ui/button";

import { getAlternateMethodLabel } from "@/features/auth/sign-in/sign-in-verification-copy";
import type { VerificationMethod } from "@/features/auth/sign-in/types";

type SignInVerificationActionsProps = {
	activeVerificationMethod: VerificationMethod;
	alternateMethods: VerificationMethod[];
	isBusy: boolean;
	resendVerificationCode: () => Promise<void>;
	selectVerificationMethod: (method: VerificationMethod) => void;
	startOver: () => Promise<void>;
};

export function SignInVerificationActions({
	activeVerificationMethod,
	alternateMethods,
	isBusy,
	resendVerificationCode,
	selectVerificationMethod,
	startOver,
}: SignInVerificationActionsProps) {
	return (
		<div className="flex flex-col gap-2">
			{activeVerificationMethod === "email_code" ||
			activeVerificationMethod === "phone_code" ? (
				<Button
					type="button"
					variant="link"
					size="sm"
					className="h-auto justify-start px-0"
					disabled={isBusy}
					onClick={() => void resendVerificationCode()}
				>
					Resend code
				</Button>
			) : null}
			{alternateMethods.map((method) => (
				<Button
					key={method}
					type="button"
					variant="link"
					size="sm"
					className="h-auto justify-start px-0"
					disabled={isBusy}
					onClick={() => selectVerificationMethod(method)}
				>
					{getAlternateMethodLabel(method)}
				</Button>
			))}
			<Button
				type="button"
				variant="link"
				size="sm"
				className="h-auto justify-start px-0"
				disabled={isBusy}
				onClick={() => void startOver()}
			>
				Start over
			</Button>
		</div>
	);
}
