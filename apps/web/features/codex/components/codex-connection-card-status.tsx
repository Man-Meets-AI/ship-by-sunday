import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import type { ConnectionState } from "@/features/codex/lib/codex-connection-card";

export function CodexConnectionStatusCard({
	connection,
}: {
	connection: Pick<ConnectionState, "account" | "connected">;
}) {
	const accountLine =
		connection.account?.type === "chatgpt"
			? `${connection.account.email} · plan ${connection.account.planType}`
			: null;

	return (
		<ItemGroup className="gap-2">
			<Item variant="muted" size="sm">
				<ItemContent>
					<ItemTitle>Status</ItemTitle>
					<ItemDescription>
						{connection.connected ? "Connected" : "Not connected"}
					</ItemDescription>
				</ItemContent>
			</Item>
			{accountLine ? (
				<Item variant="muted" size="sm">
					<ItemContent>
						<ItemTitle>Subscription</ItemTitle>
						<ItemDescription>{accountLine}</ItemDescription>
					</ItemContent>
				</Item>
			) : null}
		</ItemGroup>
	);
}
