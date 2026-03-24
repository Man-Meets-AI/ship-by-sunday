import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PinnedArtifact } from "@/features/course/lesson/shells/types";

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

const recapTitleClass =
	"text-xs font-medium uppercase tracking-widest text-muted-foreground";

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
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className={recapTitleClass}>User</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 pt-0">
					<p className="text-sm leading-relaxed text-foreground">
						{user ?? "Complete lesson 1.4 to pin a user."}
					</p>
					{problem ? (
						<p className="text-sm leading-relaxed text-muted-foreground">
							Problem: {problem}
						</p>
					) : null}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className={recapTitleClass}>Outcome</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					<p className="text-sm leading-relaxed text-foreground">
						{outcome ?? "Complete lesson 1.5 to pin an outcome."}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
