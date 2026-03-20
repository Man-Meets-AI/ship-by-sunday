"use client";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

import { GoogleIcon } from "@/features/auth/sign-in/google-icon";

type SignInSecondaryActionsProps = {
	isBusy: boolean;
	isLoaded: boolean;
	startGoogleSignIn: () => Promise<void>;
	startPasswordReset: () => Promise<void>;
};

export function SignInSecondaryActions({
	isBusy,
	isLoaded,
	startGoogleSignIn,
	startPasswordReset,
}: SignInSecondaryActionsProps) {
	return (
		<>
			<div className="flex items-center gap-2">
				<Separator className="flex-1" />
				<span className="text-xs uppercase text-muted-foreground">or with</span>
				<Separator className="flex-1" />
			</div>
			<Button
				className="w-full"
				variant="outline"
				type="button"
				disabled={!isLoaded || isBusy}
				onClick={() => void startGoogleSignIn()}
			>
				{isBusy ? (
					<Spinner data-icon="inline-start" />
				) : (
					<GoogleIcon data-icon="inline-start" aria-hidden />
				)}
				Continue with Google
			</Button>
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
					New accounts are created only after checkout. Use Google only if it is
					already tied to your purchased access.
				</FieldDescription>
			</div>
		</>
	);
}
