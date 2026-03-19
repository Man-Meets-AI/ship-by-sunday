"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCodexConnectionCard } from "@/features/codex/hooks/use-codex-connection-card";

import { CodexConnectionCardActions } from "./codex-connection-card-actions";
import { CodexConnectionCardFeedback } from "./codex-connection-card-feedback";
import { CodexConnectionRateLimitsCard } from "./codex-connection-card-rate-limits";
import { CodexConnectionStatusCard } from "./codex-connection-card-status";

export function CodexConnectionCard() {
	const {
		connection,
		feedback,
		rateLimitSnapshots,
		requestState,
		startManagedLogin,
		pollLoginStatus,
		refreshRateLimits,
		disconnectAccount,
	} = useCodexConnectionCard();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Connect your subscription</CardTitle>
				<CardDescription>
					Use your own ChatGPT/Codex subscription for in-lesson generation.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{requestState === "loading" ? (
					<div
						className="space-y-3"
						aria-busy="true"
						aria-label="Loading connection"
					>
						<Skeleton className="h-14 w-full rounded-lg" />
						<Skeleton className="h-9 w-full max-w-xs" />
					</div>
				) : (
					<div className="space-y-3">
						<CodexConnectionStatusCard connection={connection} />

						{rateLimitSnapshots.length > 0 ? (
							<CodexConnectionRateLimitsCard snapshots={rateLimitSnapshots} />
						) : null}

						<CodexConnectionCardActions
							connected={connection.connected}
							requestState={requestState}
							onStartManagedLogin={startManagedLogin}
							onPollLoginStatus={pollLoginStatus}
							onRefreshRateLimits={refreshRateLimits}
							onDisconnectAccount={disconnectAccount}
						/>

						<CodexConnectionCardFeedback feedback={feedback} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
