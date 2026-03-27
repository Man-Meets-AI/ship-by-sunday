import Link from "next/link";
import { STARTER_SNAPSHOT_LABEL } from "@packet-compiler";
import { Button } from "@/components/ui/button";

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
		<section className="space-y-5 rounded-[30px] border border-border/60 bg-muted/15 p-6 sm:p-8">
			<div className="max-w-3xl space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					{isReviewReady ? "Ready to download" : "Finish the last blockers"}
				</p>
				<h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-[2rem]">
					{isReviewReady
						? `${STARTER_SNAPSHOT_LABEL} is ready.`
						: "Finish the remaining blockers."}
				</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					The required packet run ends here. Download the full Starter Snapshot
					to capture the Design, Marketing, Build, and Prompt packs in one
					place.
				</p>
			</div>
			<div className="max-w-sm space-y-3">
				<Button asChild className="w-full" disabled={!isReviewReady}>
					<Link href="/api/download/repo" onClick={onStarterDownload}>
						Download {STARTER_SNAPSHOT_LABEL}
					</Link>
				</Button>
				<p className="text-sm leading-6 text-muted-foreground">
					{isExecuteUnlocked
						? "Execute / Ship is unlocked as a separate optional next path."
						: "Execute / Ship opens as a separate optional next path after this download."}
				</p>
			</div>
		</section>
	);
}
