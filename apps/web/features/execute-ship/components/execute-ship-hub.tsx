"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	executeShipTracks,
	getExecuteShipTrack,
	type ExecuteShipTrackId,
} from "@/features/execute-ship/lib/execute-ship-tracks";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecuteShipTrackDetail } from "./execute-ship-track-detail";

const defaultTrackId = "build-now" as const satisfies ExecuteShipTrackId;

export function ExecuteShipHub({ productName }: { productName?: string }) {
	const defaultTrack = getExecuteShipTrack(defaultTrackId);

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showSkillRail={false}
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<Card>
					<CardHeader className="gap-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Continue the run
								</p>
								<CardTitle>
									{productName
										? `${productName} is ready for execution.`
										: "Your packet run is ready for execution."}
								</CardTitle>
							</div>
							<Badge variant="outline">Optional branch</Badge>
						</div>
						<p className="text-sm text-muted-foreground">
							This hub is where the packet-first flow hands off into real build,
							refinement, QA, and launch work. The required outcome is still the
							Starter Snapshot. This space just keeps momentum once that
							download moment is done.
						</p>
					</CardHeader>
					<CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
						{executeShipTracks.map((track) => (
							<div
								key={track.id}
								className="rounded-xl border border-border/70 bg-muted/30 p-3 text-sm"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
									{track.status}
								</p>
								<p className="mt-2 font-medium">{track.label}</p>
							</div>
						))}
					</CardContent>
				</Card>
				<Tabs defaultValue={defaultTrack.id} className="gap-6">
					<TabsList className="grid h-auto gap-3 bg-transparent p-0 xl:grid-cols-5">
						{executeShipTracks.map((track) => (
							<TabsTrigger
								key={track.id}
								value={track.id}
								className="h-auto min-h-28 flex-col items-start justify-start gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-left data-active:border-primary/35 data-active:bg-primary/5"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
									{track.status}
								</p>
								<p className="font-medium">{track.label}</p>
								<p className="text-xs text-muted-foreground">{track.summary}</p>
							</TabsTrigger>
						))}
					</TabsList>
					{executeShipTracks.map((track) => (
						<TabsContent key={track.id} value={track.id}>
							<ExecuteShipTrackDetail track={track} />
						</TabsContent>
					))}
				</Tabs>
			</div>
		</AppShell>
	);
}
