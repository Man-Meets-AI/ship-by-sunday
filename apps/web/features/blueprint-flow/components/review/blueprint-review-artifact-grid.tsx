import { PROMPT_PACK_LABEL, STARTER_SNAPSHOT_LABEL } from "@blueprint-compiler";
import type { BlueprintPageSectionStatus } from "@/features/blueprint-flow/hooks/use-blueprint-page-state";
import { reviewArtifacts } from "../../lib/review-artifacts";

export function BlueprintReviewArtifactGrid({
	sectionStatuses,
}: {
	sectionStatuses: BlueprintPageSectionStatus[];
}) {
	const sectionStatusById = new Map(
		sectionStatuses.map((sectionStatus) => [
			sectionStatus.sectionId,
			sectionStatus,
		]),
	);

	return (
		<section className="space-y-12">
			<div className="max-w-2xl space-y-4">
				<div className="space-y-1">
					<p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/60">
						Contents
					</p>
					<h2 className="text-2xl font-bold tracking-tight">
						What&apos;s inside the {STARTER_SNAPSHOT_LABEL}
					</h2>
				</div>
				<p className="text-sm leading-relaxed text-muted-foreground">
					One download gives you the generated Design, Marketing, Build, and
					prompt materials in the repo-root `docs/` tree. This preview is
					informational only; the packs ship together inside the snapshot.
				</p>
			</div>

			<div className="divide-y divide-border/40 border-t border-border/40">
				{reviewArtifacts.map((artifact) => {
					const pendingFactKeys = artifact.sectionIds.flatMap((sectionId) => {
						const sectionStatus = sectionStatusById.get(sectionId);
						return sectionStatus?.missingFactKeys ?? [];
					});
					const isReady = pendingFactKeys.length === 0;

					return (
						<div
							key={artifact.id}
							className="group grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center"
						>
							<div className="space-y-2">
								<h3 className="text-lg font-bold tracking-tight">
									{artifact.title}
								</h3>
								<p className="max-w-md text-sm leading-relaxed text-muted-foreground">
									{isReady
										? artifact.summary
										: `${pendingFactKeys.length} answer${pendingFactKeys.length === 1 ? "" : "s"} still need attention in ${artifact.sectionLabel.toLowerCase()}.`}
								</p>
								{isReady ? (
									<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
										Included under {artifact.includedPath}
									</p>
								) : null}
							</div>
						</div>
					);
				})}

				<div className="group grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
					<div className="space-y-2">
						<h3 className="text-lg font-bold tracking-tight">
							{PROMPT_PACK_LABEL}
						</h3>
						<p className="max-w-md text-sm leading-relaxed text-muted-foreground">
							{sectionStatuses.every(
								(sectionStatus) => sectionStatus.isComplete,
							)
								? `The shipped ExecPlan prompts land under docs/prompts/ inside your ${STARTER_SNAPSHOT_LABEL}.`
								: `Will be generated once your ${STARTER_SNAPSHOT_LABEL} is ready.`}
						</p>
						{sectionStatuses.every(
							(sectionStatus) => sectionStatus.isComplete,
						) ? (
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
								Included under docs/prompts/
							</p>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}
