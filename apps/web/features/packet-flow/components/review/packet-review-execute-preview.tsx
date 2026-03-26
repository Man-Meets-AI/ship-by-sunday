import Link from "next/link";
import { routeConfig } from "@/config/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PacketReviewExecutePreview({
	isReviewReady,
	hasTriggeredStarterDownload,
	isExecuteUnlocked,
	isUnlockPending,
	onUnlockExecuteShip,
}: {
	isReviewReady: boolean;
	hasTriggeredStarterDownload: boolean;
	isExecuteUnlocked: boolean;
	isUnlockPending: boolean;
	onUnlockExecuteShip: () => void;
}) {
	return (
		<Card className="border-dashed">
			<CardHeader className="gap-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Optional next path
						</p>
						<CardTitle>Execute / Ship</CardTitle>
					</div>
					<Badge variant={isExecuteUnlocked ? "secondary" : "outline"}>
						{isExecuteUnlocked ? "Unlocked" : "Unlock after download"}
					</Badge>
				</div>
				<p className="text-sm text-muted-foreground">
					This branch keeps momentum after Review with build, refinement, QA,
					and launch guidance. It stays outside the required packet-definition
					run and will unlock through a separate review-side action.
				</p>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
					{[
						"Build Now",
						"Refine Design",
						"Refine Marketing",
						"QA & Debug",
						"Launch & Ship",
					].map((track) => (
						<div
							key={track}
							className="rounded-xl border border-border/70 bg-muted/30 p-3 text-sm"
						>
							<p className="font-medium">{track}</p>
						</div>
					))}
				</div>
				{isExecuteUnlocked ? (
					<Button asChild className="w-full">
						<Link href={routeConfig.execute}>Open Execute / Ship</Link>
					</Button>
				) : (
					<Button
						type="button"
						variant="outline"
						className="w-full"
						disabled={
							!isReviewReady || !hasTriggeredStarterDownload || isUnlockPending
						}
						onClick={onUnlockExecuteShip}
					>
						{!isReviewReady
							? "Finish Review first"
							: !hasTriggeredStarterDownload
								? "Download Starter Snapshot first"
								: isUnlockPending
									? "Unlocking Execute / Ship..."
									: "Unlock Execute / Ship"}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
