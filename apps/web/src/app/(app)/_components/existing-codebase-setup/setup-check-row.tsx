import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SetupReadinessCheck } from "@/app/(app)/_lib/workspace-setup-readiness-model";
import { SetupStatusBadge } from "./setup-status-badge";

function DetailGrid({
	items,
}: {
	items: Array<{ label: string; value: string }>;
}) {
	return (
		<div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
			{items.map((item) => (
				<div key={item.label} className="min-w-0">
					<div className="text-xs font-medium text-muted-foreground">
						{item.label}
					</div>
					<div className="mt-1 leading-5 text-foreground">{item.value}</div>
				</div>
			))}
		</div>
	);
}

export function SetupCheckRow({ row }: { row: SetupReadinessCheck }) {
	return (
		<li className="border-t border-border/60 px-4 py-4 first:border-t-0 sm:px-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="text-sm font-semibold text-foreground">
							{row.label}
						</h3>
						<SetupStatusBadge status={row.status} />
					</div>
					{row.status === "ready" ? (
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							{row.summary}
						</p>
					) : null}
				</div>
				{row.status === "blocked" ? (
					<div className="flex shrink-0 flex-wrap gap-2">
						<Button type="button" variant="outline" size="sm">
							{row.localActionButton.label}
						</Button>
						<span className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground">
							<RotateCcw className="size-3.5" aria-hidden />
							{row.retryAction.label}
						</span>
					</div>
				) : null}
				{row.status === "warning" ? (
					<div className="flex shrink-0 flex-wrap gap-2">
						{row.actions.map((action) => (
							<Button
								key={`${row.id}-${action.kind}`}
								type="button"
								variant={action.kind === "review" ? "outline" : "ghost"}
								size="sm"
							>
								{action.label}
							</Button>
						))}
					</div>
				) : null}
			</div>

			{row.status === "blocked" ? (
				<DetailGrid
					items={[
						{ label: "Exact cause", value: row.cause },
						{ label: "Why it blocks", value: row.blocksBecause },
						{ label: "Local action", value: row.localAction },
					]}
				/>
			) : null}
			{row.status === "warning" ? (
				<DetailGrid
					items={[
						{ label: "Cause", value: row.cause },
						{ label: "Why it can continue", value: row.allowsBecause },
						{ label: "Local action", value: row.localAction },
					]}
				/>
			) : null}
		</li>
	);
}
