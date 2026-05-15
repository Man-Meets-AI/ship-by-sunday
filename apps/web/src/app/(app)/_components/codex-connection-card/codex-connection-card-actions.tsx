"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { RequestState } from "@/app/(app)/_components/codex-connection-card/codex-connection-card-model";
import { cn } from "@/lib/utils";

import { CodexConnectionDisconnectDialog } from "./codex-connection-card-disconnect-dialog";

export function CodexConnectionCardActions({
	connected,
	requestState,
	onStartManagedLogin,
	onPollLoginStatus,
	onRefreshRateLimits,
	onDisconnectAccount,
}: {
	connected: boolean;
	requestState: RequestState;
	onStartManagedLogin: () => Promise<void>;
	onPollLoginStatus: () => Promise<void>;
	onRefreshRateLimits: () => Promise<void>;
	onDisconnectAccount: () => Promise<void>;
}) {
	const [disconnectOpen, setDisconnectOpen] = useState(false);

	return (
		<>
			<div className="flex w-full flex-col gap-2 min-[480px]:w-auto min-[480px]:flex-row min-[480px]:flex-wrap">
				{connected ? (
					<>
						<Button
							type="button"
							onClick={() => void onRefreshRateLimits()}
							disabled={requestState === "refreshing_limits"}
							variant="outline"
							size="sm"
							className="w-full min-[480px]:w-auto"
						>
							{requestState === "refreshing_limits" ? (
								<>
									<Spinner className="size-3.5" />
									Refresh
								</>
							) : (
								"Refresh limits"
							)}
						</Button>
						<Button
							type="button"
							onClick={() => setDisconnectOpen(true)}
							disabled={requestState === "disconnecting"}
							variant="destructive"
							size="sm"
							className="w-full min-[480px]:w-auto"
							data-testid="codex-connection-disconnect-trigger"
						>
							{requestState === "disconnecting" ? (
								<>
									<Spinner className="size-3.5" />
									Disconnect
								</>
							) : (
								"Disconnect"
							)}
						</Button>
					</>
				) : (
					<>
						<Button
							type="button"
							onClick={() => void onStartManagedLogin()}
							disabled={requestState === "starting_login"}
							variant="secondary"
							size="sm"
							className={cn(
								"w-full min-[480px]:w-auto border-transparent bg-foreground text-background hover:bg-foreground/90 hover:text-background",
							)}
							data-testid="codex-connection-start-login"
						>
							{requestState === "starting_login" ? (
								<>
									<Spinner className="size-3.5" />
									Connect
								</>
							) : (
								"Connect Codex account"
							)}
						</Button>
						<Button
							type="button"
							onClick={() => void onPollLoginStatus()}
							disabled={requestState === "polling"}
							variant="outline"
							size="sm"
							className="w-full min-[480px]:w-auto"
							data-testid="codex-connection-poll-status"
						>
							{requestState === "polling" ? (
								<>
									<Spinner className="size-3.5" />
									Check
								</>
							) : (
								"Check login status"
							)}
						</Button>
					</>
				)}
			</div>

			<CodexConnectionDisconnectDialog
				open={disconnectOpen}
				onOpenChange={setDisconnectOpen}
				requestState={requestState}
				onConfirmDisconnect={() => {
					setDisconnectOpen(false);
					void onDisconnectAccount();
				}}
			/>
		</>
	);
}
