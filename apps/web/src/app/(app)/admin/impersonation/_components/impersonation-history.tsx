"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { AdminImpersonationPageData } from "../_server/admin-impersonation-server";

type HistoryItem = AdminImpersonationPageData["history"][number];

function formatDate(value: number | null) {
	if (!value) {
		return "n/a";
	}
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function getTerminalTimestamp(item: HistoryItem) {
	if (item.stoppedAt) {
		return item.stoppedAt;
	}
	if (item.failedAt) {
		return item.failedAt;
	}
	if (item.invalidatedAt) {
		return item.invalidatedAt;
	}
	if (item.status === "expired") {
		return item.updatedAt;
	}
	return null;
}

export function ImpersonationHistory({
	history,
}: {
	history: AdminImpersonationPageData["history"];
}) {
	return (
		<Card className="rounded-lg">
			<CardHeader>
				<CardTitle>History</CardTitle>
				<CardDescription>
					Recent app-managed support sessions and audit counts.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{history.length === 0 ? (
					<div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
						No support sessions yet.
					</div>
				) : (
					history.map((item) => (
						<div
							key={item.sessionId}
							className="grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]"
						>
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="truncate font-medium">
										{item.customerEmail ?? "Unknown customer"}
									</span>
									<Badge variant="outline">{item.status}</Badge>
								</div>
								<p className="line-clamp-2 text-muted-foreground">
									{item.reason}
								</p>
							</div>
							<div className="grid gap-1 text-xs text-muted-foreground sm:text-right">
								<span>Started {formatDate(item.startedAt)}</span>
								<span>Ended {formatDate(getTerminalTimestamp(item))}</span>
								<span>
									{item.eventCount} events, {item.blockedEventCount} blocked
								</span>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
