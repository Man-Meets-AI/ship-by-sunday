import type { PinnedArtifact } from "@/features/course/lesson/shells/types";

const labelClass =
	"text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

function readPinnedText(
	pinnedArtifacts: PinnedArtifact[],
	artifactKey: string,
	fieldId: string,
) {
	const artifact = pinnedArtifacts.find(
		(candidate) => candidate.artifactKey === artifactKey,
	);
	const value = artifact?.fieldValues?.[fieldId];
	if (typeof value !== "string") {
		return null;
	}
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function CompetitorResearchTargetRecap({
	pinnedArtifacts,
}: {
	pinnedArtifacts: PinnedArtifact[];
}) {
	const user = readPinnedText(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_owner",
	);
	const problem = readPinnedText(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_statement",
	);
	const outcome = readPinnedText(
		pinnedArtifacts,
		"outcome_statement",
		"outcome_statement_body",
	);

	if (!user && !outcome) {
		return null;
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			<div className="rounded-lg border border-border bg-card px-4 py-4">
				<p className={labelClass}>User</p>
				<p className="mt-2 text-sm leading-relaxed text-foreground">
					{user ?? "Complete lesson 1.4 to pin a user."}
				</p>
				{problem ? (
					<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
						Problem: {problem}
					</p>
				) : null}
			</div>
			<div className="rounded-lg border border-border bg-card px-4 py-4">
				<p className={labelClass}>Outcome</p>
				<p className="mt-2 text-sm leading-relaxed text-foreground">
					{outcome ?? "Complete lesson 1.5 to pin an outcome."}
				</p>
			</div>
		</div>
	);
}
