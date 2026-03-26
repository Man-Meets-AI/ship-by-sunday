import Link from "next/link";
import { STARTER_SNAPSHOT_LABEL } from "@packet-compiler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PacketReviewCheckpointCard({
	isReviewReady,
	isExecuteUnlocked,
	onStarterDownload,
}: {
	isReviewReady: boolean;
	isExecuteUnlocked: boolean;
	onStarterDownload: () => void;
}) {
	return (
		<Card>
			<CardHeader className="gap-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Required run checkpoint
						</p>
						<CardTitle>
							{isReviewReady
								? `${STARTER_SNAPSHOT_LABEL} ready.`
								: "Finish the remaining blockers."}
						</CardTitle>
					</div>
					<Badge variant={isReviewReady ? "secondary" : "outline"}>
						{isReviewReady ? "Checkpoint complete" : "Final checkpoint"}
					</Badge>
				</div>
				<p className="text-sm text-muted-foreground">
					The required packet-first run ends here. Download the full Starter
					Snapshot to capture the Design, Marketing, Build, and Prompt packs in
					one place, then optionally continue into Execute / Ship.
				</p>
			</CardHeader>
			<CardContent className="space-y-3">
				<Button asChild className="w-full" disabled={!isReviewReady}>
					<Link href="/api/download/repo" onClick={onStarterDownload}>
						Download {STARTER_SNAPSHOT_LABEL}
					</Link>
				</Button>
				<p className="text-sm text-muted-foreground">
					{isExecuteUnlocked
						? "The Starter Snapshot stays the primary outcome, and Execute / Ship is now unlocked as a separate optional branch."
						: "The Starter Snapshot is still the primary outcome. Execute / Ship is a separate optional branch after this download moment, not another required packet stage."}
				</p>
			</CardContent>
		</Card>
	);
}
