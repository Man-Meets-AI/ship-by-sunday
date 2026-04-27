import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import {
	formatResetTimestamp,
	type RateLimitSnapshot,
	type RateLimitWindow,
} from "@/app/(workspace)/_components/codex-connection-card/codex-connection-card-model";

function RateLimitWindowBlock({
	label,
	timeWindow,
}: {
	label: string;
	timeWindow: RateLimitWindow | null;
}) {
	if (!timeWindow) {
		return (
			<Item variant="muted" size="sm">
				<ItemContent>
					<ItemTitle>{label}</ItemTitle>
					<ItemDescription>Not available</ItemDescription>
				</ItemContent>
			</Item>
		);
	}

	const value = Math.min(100, Math.max(0, timeWindow.usedPercent));

	return (
		<Item variant="muted" size="sm">
			<ItemContent className="gap-2">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<ItemTitle>{label}</ItemTitle>
					<span className="text-right text-sm text-muted-foreground">
						{timeWindow.usedPercent}% used · resets{" "}
						{formatResetTimestamp(timeWindow.resetsAt)}
					</span>
				</div>
				<Progress value={value} aria-label={`${label} usage ${value}%`} />
			</ItemContent>
		</Item>
	);
}

export function CodexConnectionRateLimitsCard({
	snapshots,
}: {
	snapshots: RateLimitSnapshot[];
}) {
	return (
		<ItemGroup className="gap-3">
			<p className="text-xs font-medium text-muted-foreground">Rate limits</p>
			{snapshots.map((snapshot, index) => {
				const key = snapshot.limitId ?? `default-${index}`;
				return (
					<ItemGroup key={key} className="gap-2">
						{index > 0 ? <ItemSeparator /> : null}
						<p className="text-sm font-medium text-foreground">
							{snapshot.limitName ?? snapshot.limitId ?? "default"}
						</p>
						<RateLimitWindowBlock
							label="Primary"
							timeWindow={snapshot.primary}
						/>
						<RateLimitWindowBlock
							label="Secondary"
							timeWindow={snapshot.secondary}
						/>
					</ItemGroup>
				);
			})}
		</ItemGroup>
	);
}
