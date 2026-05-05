"use client";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";

type SignInSecondaryActionsProps = {
	isBusy: boolean;
	isLoaded: boolean;
	signUpHref?: string | null;
	startPasswordReset: () => Promise<void>;
};

export function SignInSecondaryActions({
	isBusy,
	isLoaded,
	signUpHref,
	startPasswordReset,
}: SignInSecondaryActionsProps) {
	return (
		<div className="flex flex-col gap-2">
			<Button
				type="button"
				variant="link"
				size="sm"
				className="h-auto justify-start px-0"
				disabled={!isLoaded || isBusy}
				onClick={() => void startPasswordReset()}
			>
				Forgot your password?
			</Button>
			<FieldDescription>
				New accounts are created only after checkout. Sign in with the email
				tied to your purchased access.
			</FieldDescription>
			{signUpHref ? (
				<Button
					asChild
					type="button"
					variant="link"
					size="sm"
					className="h-auto justify-start px-0"
				>
					<a href={signUpHref}>Create the account for this checkout</a>
				</Button>
			) : null}
		</div>
	);
}
