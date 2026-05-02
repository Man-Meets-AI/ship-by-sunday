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
		<main className="relative min-h-screen overflow-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-muted/35 via-background/95 to-background sm:h-72" />
			<div className="relative">
				<AccessRequiredShell
					viewModel={viewModel}
					isRetryingAccess={isRetryingAccess}
					lastRefreshLabel={lastRefreshLabel}
					onRetryAccessCheck={onRetryAccessCheck}
				/>
			</div>
		</main>
	);
}
