"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { AccessActionModel } from "../../_lib/access-required-view-model";

import { AccessRequiredCheckoutWithError } from "./access-required-checkout-with-error";
import { AccessRequiredReauthenticateButton } from "./access-required-reauthenticate-button";
import { AccessRequiredRefreshHint } from "./access-required-refresh-hint";

const ACTION_BUTTON_CLASS =
	"w-full justify-center transition-colors sm:w-auto sm:min-w-44";

function AccessRequiredActionButton({
	action,
	isRetryingAccess,
	onRetryAccessCheck,
}: {
	action: AccessActionModel;
	isRetryingAccess: boolean;
	onRetryAccessCheck: () => void;
}) {
	if (action.kind === "checkout") {
		return (
			<AccessRequiredCheckoutWithError
				label={action.label}
				className={ACTION_BUTTON_CLASS}
			/>
		);
	}

	if (action.kind === "retry") {
		return (
			<Button
				type="button"
				size="lg"
				onClick={onRetryAccessCheck}
				disabled={isRetryingAccess}
				aria-busy={isRetryingAccess ? "true" : "false"}
				variant={action.variant}
				className={ACTION_BUTTON_CLASS}
			>
				{isRetryingAccess ? (
					<>
						<Spinner data-icon="inline-start" />
						{action.busyLabel}
					</>
				) : (
					action.label
				)}
			</Button>
		);
	}

	if (action.kind === "reauthenticate") {
		return (
			<AccessRequiredReauthenticateButton
				label={action.label}
				signInHref={action.signInHref}
				variant={action.variant}
				className={ACTION_BUTTON_CLASS}
			/>
		);
	}

	return (
		<Button
			asChild
			size="lg"
			variant={action.variant}
			className={ACTION_BUTTON_CLASS}
		>
			<Link href={action.href}>{action.label}</Link>
		</Button>
	);
}

export function AccessRequiredActions({
	actions,
	refreshHint,
	isRetryingAccess,
	onRetryAccessCheck,
}: {
	actions: readonly AccessActionModel[];
	refreshHint: string;
	isRetryingAccess: boolean;
	onRetryAccessCheck: () => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			{actions.some((action) => action.kind === "retry") ? (
				<AccessRequiredRefreshHint refreshHint={refreshHint} />
			) : null}
			<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
				{actions.map((action, actionIndex) => (
					<AccessRequiredActionButton
						key={`${action.kind}-${actionIndex}`}
						action={action}
						isRetryingAccess={isRetryingAccess}
						onRetryAccessCheck={onRetryAccessCheck}
					/>
				))}
			</div>
		</div>
	);
}
