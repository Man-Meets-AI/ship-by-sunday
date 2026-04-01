import Link from "next/link";
import { type PacketReadinessResult } from "@packet-compiler";
import { Button } from "@/components/ui/button";
import { reviewArtifacts } from "../../lib/review-artifacts";
import { ArrowRight } from "lucide-react";

const proofRows = [
	{
		title: "Agent-Ready Packs",
		description:
			"Design, Marketing, Build, and Prompt Packs generated from your answers",
	},
	{
		title: "Agent-First Starter Repo",
		description:
			"A starter repo shaped for the AI age, with the docs, overrides, and handoff structure already in place",
	},
	{
		title: "One bundle, one source of truth",
		description:
			"So design, marketing, code, and prompts all work from the same brief instead of drifting",
	},
];

export function PacketReviewCheckpointCard({
	isReviewReady,
	packetReadiness,
}: {
	isReviewReady: boolean;
	packetReadiness: PacketReadinessResult;
}) {
	const incompleteArtifacts = reviewArtifacts.filter(
		(artifact) => !packetReadiness[artifact.id].isReady,
	);

	return (
		<section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-muted/15 p-8 sm:p-12">
			{/* Background accent */}
			<div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

			<div className="relative space-y-10">
				<div className="space-y-6">
					<div className="space-y-3">
						<h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
							{isReviewReady
								? "Your Ship Kit is ready."
								: "Finish the remaining blockers."}
						</h2>
						<p className="text-lg leading-relaxed text-muted-foreground">
							{isReviewReady
								? "This download gives you the two things that actually get the product out: the Agent-Ready Packs that keep AI on the rails, and the Agent-First Starter Repo that turns those packs into execution."
								: "You still have a few remaining questions to answer before your Ship Kit is ready."}
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

					<div className="flex flex-col gap-4 sm:max-w-sm">
						{isReviewReady ? (
							<Button
								asChild
								size="lg"
								className="h-14 w-full text-lg font-bold"
							>
								<a download href="/api/download/repo">
									Download Ship Kit
								</a>
							</Button>
						) : (
							<Button
								type="button"
								size="lg"
								className="h-14 w-full text-lg font-bold"
								disabled
							>
								Download Ship Kit
							</Button>
						)}
						<p className="px-1 text-xs leading-5 text-muted-foreground">
							Download this first. Then continue to Build Lessons.
						</p>
					</div>
				</div>

				{/* Proof rows */}
				<div className="divide-y divide-border/40 border-t border-border/40">
					{proofRows.map((row) => (
						<div key={row.title} className="py-5">
							<p className="font-semibold tracking-tight">{row.title}</p>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{row.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
