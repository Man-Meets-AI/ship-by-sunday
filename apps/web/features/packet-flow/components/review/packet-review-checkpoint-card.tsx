import Link from "next/link";
import {
	STARTER_SNAPSHOT_LABEL,
	type PacketReadinessResult,
} from "@packet-compiler";
import { Button } from "@/components/ui/button";
import { reviewArtifacts } from "../../lib/review-artifacts";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";

export function PacketReviewCheckpointCard({
	isReviewReady,
	packetReadiness,
	isExecuteUnlocked,
	onStarterDownload,
}: {
	isReviewReady: boolean;
	packetReadiness: PacketReadinessResult;
	isExecuteUnlocked: boolean;
	onStarterDownload: () => void;
}) {
	const incompleteArtifacts = reviewArtifacts.filter(
		(artifact) => !packetReadiness[artifact.id].isReady,
	);

	return (
		<section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-muted/15 p-8 sm:p-12">
			{/* Background accent */}
			<div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

			<div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
				<div className="max-w-2xl space-y-6">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							{isReviewReady ? (
								<CheckCircle2 className="h-5 w-5 text-green-500" />
							) : (
								<Lock className="h-4 w-4 text-muted-foreground/60" />
							)}
							<p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
								{isReviewReady ? "Milestone Reached" : "Required Milestone"}
							</p>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
							{isReviewReady
								? `${STARTER_SNAPSHOT_LABEL} is ready.`
								: "Finish the remaining blockers."}
						</h2>
						<p className="text-lg leading-relaxed text-muted-foreground">
							{isReviewReady
								? "The required packet run is complete. Download the full Starter Snapshot to capture your Design, Marketing, and Build packs in one place."
								: "The required packet run ends here, but you still have a few remaining questions to answer before your full snapshot is ready."}
						</p>
					</div>

					{!isReviewReady && incompleteArtifacts.length > 0 && (
						<div className="grid gap-4 sm:grid-cols-2">
							{incompleteArtifacts.map((artifact) => (
								<Link
									key={artifact.id}
									href={artifact.stageRoute}
									className="group flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4 transition-all hover:border-primary/50 hover:bg-background"
								>
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
											{artifact.stageLabel}
										</p>
										<p className="font-semibold">{artifact.title}</p>
									</div>
									<ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
								</Link>
							))}
						</div>
					)}
				</div>

				<div className="flex shrink-0 flex-col gap-4 lg:w-80">
					<Button
						asChild
						size="lg"
						className="h-14 w-full text-lg font-bold"
						disabled={!isReviewReady}
					>
						<Link href="/api/download/repo" onClick={onStarterDownload}>
							Download Snapshot
						</Link>
					</Button>
					<p className="px-1 text-center text-xs leading-5 text-muted-foreground lg:text-left">
						{isExecuteUnlocked
							? "Execute / Ship is unlocked as a separate optional next path."
							: "Execute / Ship opens as a separate optional next path after this download."}
					</p>
				</div>
			</div>
		</section>
	);
}
