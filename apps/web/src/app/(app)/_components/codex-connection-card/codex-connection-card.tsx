"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCodexConnectionCard } from "@/app/(app)/_components/codex-connection-card/use-codex-connection-card";
import { cn } from "@/lib/utils";

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
		<div
			id="codex-connection"
			className="scroll-mt-8"
			data-testid="codex-connection-card"
		>
			<Card>
				<CardHeader>
					<h2
						data-slot="card-title"
						className="text-base leading-snug font-medium text-foreground"
					>
						Connect your subscription
					</h2>
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
							<div className="rounded-lg border border-border/60 bg-muted/30 p-3 ring-1 ring-foreground/5">
								<div className="flex gap-3">
									<Skeleton className="mt-1.5 size-2 shrink-0 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-28" />
										<Skeleton className="h-3 w-full max-w-md" />
									</div>
								</div>
							</div>
							<div className={cn("flex flex-col gap-2 min-[480px]:flex-row")}>
								<Skeleton className="h-7 w-full min-[480px]:w-40" />
								<Skeleton className="h-7 w-full min-[480px]:w-40" />
							</div>
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
		</div>
	);
}
