"use client";

import type { ProductAccess } from "@/lib/product-access";
import { useAccessRequiredController } from "../../_hooks/use-access-required-controller";
import { AccessRequiredShell } from "./access-required-shell";

export function AccessRequiredPage({
	initialAccess,
}: {
	initialAccess?: ProductAccess;
}) {
	const { isRetryingAccess, lastRefreshLabel, onRetryAccessCheck, viewModel } =
		useAccessRequiredController(initialAccess);

	return (
		<main className="min-h-screen bg-background text-foreground tracking-normal">
			<AccessRequiredShell
				viewModel={viewModel}
				isRetryingAccess={isRetryingAccess}
				lastRefreshLabel={lastRefreshLabel}
				onRetryAccessCheck={onRetryAccessCheck}
			/>
		</main>
	);
}
