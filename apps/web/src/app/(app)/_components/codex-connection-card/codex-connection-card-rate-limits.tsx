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
} from "@/app/(app)/_components/codex-connection-card/codex-connection-card-model";

function formatRollingWindow(minutes: number | null): string | null {
	if (minutes == null) {
		return null;
	}
	if (minutes <= 0) {
		return null;
	}
	return minutes === 1
		? "1-minute rolling window"
		: `${minutes}-minute rolling window`;
}

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
	const windowLine = formatRollingWindow(timeWindow.windowDurationMins);
	const resetLabel = formatResetTimestamp(timeWindow.resetsAt);

	return (
		<Item variant="muted" size="sm">
			<ItemContent className="gap-2">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<ItemTitle>{label}</ItemTitle>
					<span className="text-right text-sm text-muted-foreground font-number">
						<span className="font-medium text-foreground">
							{timeWindow.usedPercent}%
						</span>
						{" used"}
						{windowLine ? ` · ${windowLine}` : null}
					</span>
				</div>
				<p className="text-xs text-muted-foreground">
					Resets at{" "}
					<span className="font-number text-foreground/90">{resetLabel}</span>
				</p>
				<Progress value={value} aria-label={`${label} usage ${value}%`} />
			</ItemContent>
		</Item>
	);
}

function SnapshotMeta({ snapshot }: { snapshot: RateLimitSnapshot }) {
	const plan = snapshot.planType;
	const credits = snapshot.credits;
	if (!plan && !credits) {
		return null;
	}

	return (
		<dl className="grid gap-2 text-sm sm:grid-cols-2">
			{plan ? (
				<div className="space-y-0.5">
					<dt className="text-xs font-medium text-muted-foreground uppercase">
						Plan
					</dt>
					<dd className="font-number text-foreground">{plan}</dd>
				</div>
			) : null}
			{credits ? (
				<div className="space-y-0.5">
					<dt className="text-xs font-medium text-muted-foreground uppercase">
						Credits
					</dt>
					<dd className="text-foreground">
						{credits.unlimited
							? "Unlimited"
							: credits.hasCredits
								? credits.balance
								: "No balance reported"}
					</dd>
				</div>
			) : null}
		</dl>
	);
}

export function CodexConnectionRateLimitsCard({
	snapshots,
}: {
	snapshots: RateLimitSnapshot[];
}) {
	return (
		<section className="space-y-3" aria-labelledby="codex-rate-limits-heading">
			<h3
				id="codex-rate-limits-heading"
				className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
			>
				Rate limits
			</h3>
			<ItemGroup className="gap-3">
				{snapshots.map((snapshot, index) => {
					const key = snapshot.limitId ?? `default-${index}`;
					return (
						<ItemGroup key={key} className="gap-2">
							{index > 0 ? <ItemSeparator /> : null}
							<p className="text-sm font-medium text-foreground">
								{snapshot.limitName ?? snapshot.limitId ?? "Usage"}
							</p>
							<SnapshotMeta snapshot={snapshot} />
							<RateLimitWindowBlock
								label="Primary window"
								timeWindow={snapshot.primary}
							/>
							<RateLimitWindowBlock
								label="Secondary window"
								timeWindow={snapshot.secondary}
							/>
						</ItemGroup>
					);
				})}
			</ItemGroup>
		</section>
	);
}
