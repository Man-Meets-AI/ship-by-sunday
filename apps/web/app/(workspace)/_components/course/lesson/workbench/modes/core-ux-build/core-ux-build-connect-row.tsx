"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";

export function CoreUxBuildConnectRow() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const codexConnection = useQuery(
		api.codex.getViewerConnection,
		isAuthenticated && !isLoading ? {} : "skip",
	) as { status?: string } | null | undefined;
	const connected = codexConnection?.status === "connected";

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm font-medium">ChatGPT in course</span>
				<Badge variant={connected ? "default" : "secondary"}>
					{connected ? "Connected" : "Not connected"}
				</Badge>
			</div>
			<Button type="button" size="sm" variant="outline" asChild>
				<Link href={`${routeConfig.settings}#codex-connection`}>
					Connect ChatGPT
				</Link>
			</Button>
		</div>
	);
}
