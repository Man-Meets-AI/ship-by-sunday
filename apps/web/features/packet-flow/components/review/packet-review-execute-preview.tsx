import Link from "next/link";
import { routeConfig } from "@/config/product";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

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
	const isActionable = isReviewReady && hasTriggeredStarterDownload;

	return (
		<section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-background p-8 sm:p-12">
			<div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
				<div className="max-w-2xl space-y-6">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							{isExecuteUnlocked ? (
								<Sparkles className="h-5 w-5 text-primary" />
							) : (
								<Lock className="h-4 w-4 text-muted-foreground/60" />
							)}
							<p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
								The Next Path
							</p>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
							Execute / Ship
						</h2>
						<p className="text-lg leading-relaxed text-muted-foreground">
							Keep moving with build, refinement, QA, and launch guidance after
							the required packet run. This is where you turn your snapshot into
							a live product.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
						{[
							"Build Now",
							"Refine Design",
							"Refine Marketing",
							"QA & Debug",
							"Launch & Ship",
						].map((track) => (
							<div key={track} className="space-y-1">
								<div className="h-px w-full bg-border/60" />
								<p className="pt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
									{track}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className="flex shrink-0 flex-col gap-4 lg:w-80">
					{isExecuteUnlocked ? (
						<Button asChild size="lg" className="h-14 w-full text-lg font-bold">
							<Link href={routeConfig.execute}>Open Execute / Ship</Link>
						</Button>
					) : (
						<Button
							type="button"
							variant={isActionable ? "default" : "outline"}
							size="lg"
							className="h-14 w-full text-lg font-bold"
							disabled={!isActionable || isUnlockPending}
							onClick={onUnlockExecuteShip}
						>
							{isUnlockPending
								? "Unlocking..."
								: !isReviewReady
									? "Locked"
									: !hasTriggeredStarterDownload
										? "Download Snapshot to Unlock"
										: "Unlock Execute / Ship"}
						</Button>
					)}
					<p className="px-1 text-center text-xs leading-5 text-muted-foreground lg:text-left">
						{isExecuteUnlocked
							? "You have full access to the post-download library."
							: "Unlock this path to access the full post-download library and ship your v1."}
					</p>
				</div>
			</div>
		</section>
	);
}
