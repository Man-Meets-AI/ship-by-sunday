import { Button } from "@/components/ui/button";
import type { RequestState } from "@/features/codex/lib/codex-connection-card";

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
	return (
		<div className="flex flex-wrap items-center gap-2">
			{connected ? (
				<>
					<Button
						type="button"
						onClick={() => void onRefreshRateLimits()}
						disabled={requestState === "refreshing_limits"}
						variant="outline"
						size="sm"
					>
						{requestState === "refreshing_limits"
							? "Refreshing..."
							: "Refresh limits"}
					</Button>
					<Button
						type="button"
						onClick={() => void onDisconnectAccount()}
						disabled={requestState === "disconnecting"}
						variant="destructive"
						size="sm"
					>
						{requestState === "disconnecting"
							? "Disconnecting..."
							: "Disconnect"}
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
					>
						{requestState === "starting_login"
							? "Opening login..."
							: "Connect Codex account"}
					</Button>
					<Button
						type="button"
						onClick={() => void onPollLoginStatus()}
						disabled={requestState === "polling"}
						variant="outline"
						size="sm"
					>
						{requestState === "polling" ? "Checking..." : "Check login status"}
					</Button>
				</>
			)}
		</div>
	);
}
