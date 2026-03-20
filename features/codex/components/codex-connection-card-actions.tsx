import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
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
		<ButtonGroup>
			{connected ? (
				<>
					<Button
						type="button"
						onClick={() => void onRefreshRateLimits()}
						disabled={requestState === "refreshing_limits"}
						variant="outline"
						size="sm"
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
						onClick={() => void onDisconnectAccount()}
						disabled={requestState === "disconnecting"}
						variant="destructive"
						size="sm"
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
		</ButtonGroup>
	);
}
