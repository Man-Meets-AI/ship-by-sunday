import Link from "next/link";
import { routeConfig } from "@/config/product";
import { Button } from "@/components/ui/button";

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
	if (!hasTriggeredStarterDownload && !isExecuteUnlocked) {
		return null;
	}

	return (
		<section className="space-y-4 border-t border-dashed border-border/60 pt-6">
			<div className="max-w-3xl space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					Optional next path
				</p>
				<h2 className="text-xl font-semibold tracking-tight">Execute / Ship</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					Keep moving with build, refinement, QA, and launch guidance after the
					required packet run.
				</p>
			</div>
			<div className="space-y-4">
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
					{[
						"Build Now",
						"Refine Design",
						"Refine Marketing",
						"QA & Debug",
						"Launch & Ship",
					].map((track) => (
						<div
							key={track}
							className="border-t border-border/60 pt-3 text-sm text-muted-foreground"
						>
							<p className="font-medium text-foreground">{track}</p>
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
			</div>
		</section>
	);
}
