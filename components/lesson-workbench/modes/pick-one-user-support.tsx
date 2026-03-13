import type { LessonHandoff } from "@/lib/course/manifest";
import { getCandidateProblemOptions } from "@/lib/course/registry";

import type { WorkbenchModeProps } from "../types";
import { WorkbenchCard } from "../shared/workbench-card";

const BROAD_AUDIENCE_PATTERN =
	/\b(users?|people|everyone|anyone|business(?:es)?|companies|founders|teams)\b/i;
const RECURRING_PAIN_PATTERN =
	/\b(after|when|during|every|each|because|without|before|still)\b/i;

function getTextValue(fieldValues: Record<string, unknown>, fieldId: string) {
	const value = fieldValues[fieldId];
	return typeof value === "string" ? value.trim() : "";
}

function getCandidateSignals(problem: { owner: string; statement: string }) {
	const ownerLooksSpecific =
		problem.owner.length >= 4 && !BROAD_AUDIENCE_PATTERN.test(problem.owner);
	const painLooksGrounded =
		problem.statement.length >= 24 &&
		RECURRING_PAIN_PATTERN.test(problem.statement);

	return [
		ownerLooksSpecific
			? `Specific enough to picture: ${problem.owner}`
			: "Sharpen the user beyond a broad audience label.",
		painLooksGrounded
			? "Pain reads like a real repeated moment."
			: "Pressure-test whether the pain sounds recurring enough.",
		"Ask whether you can get this in front of them this week.",
	];
}

export function PickOneUserSupport({
	handoff,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: {
	handoff: LessonHandoff;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"];
	invalidFieldIds: Set<string>;
}) {
	const sourceArtifact = pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === handoff.sourceArtifactKey,
	);
	const candidateProblems = getCandidateProblemOptions(
		handoff,
		sourceArtifact?.fieldValues,
	);
	const persistedFields = handoff.persistedFields ?? [];
	const selectedProblemIndex =
		typeof fieldValues[handoff.selectionFieldId] === "number"
			? (fieldValues[handoff.selectionFieldId] as number)
			: typeof fieldValues[handoff.selectionFieldId] === "string"
				? Number(fieldValues[handoff.selectionFieldId])
				: null;
	const selectedProblem =
		selectedProblemIndex !== null
			? candidateProblems.find(
					(problem) => problem.index === selectedProblemIndex,
				)
			: null;
	const previewRows = [
		{
			label: "User",
			filled: Boolean(
				getTextValue(fieldValues, "selected_problem_owner") || selectedProblem?.owner,
			),
			value:
				getTextValue(fieldValues, "selected_problem_owner") ||
				selectedProblem?.owner ||
				"Choose one user-problem pair above.",
		},
		{
			label: "Chosen problem",
			filled: Boolean(
				getTextValue(fieldValues, "selected_problem_statement") ||
					selectedProblem?.statement,
			),
			value:
				getTextValue(fieldValues, "selected_problem_statement") ||
				selectedProblem?.statement ||
				"The chosen problem will appear here.",
		},
		{
			label: "Pain moment",
			filled: Boolean(getTextValue(fieldValues, "pain_moment")),
			value:
				getTextValue(fieldValues, "pain_moment") ||
				"Name the exact moment this becomes painful.",
		},
		{
			label: "Current workaround",
			filled: Boolean(getTextValue(fieldValues, "current_solution")),
			value:
				getTextValue(fieldValues, "current_solution") ||
				"Describe how they handle it today.",
		},
		{
			label: "Reach this week",
			filled: Boolean(getTextValue(fieldValues, "reachability")),
			value:
				getTextValue(fieldValues, "reachability") ||
				"State the real path you have to show this to them this week.",
		},
	];

	return (
		<div className="space-y-3">
			<WorkbenchCard label="Choose the user to build for">
				<div className="space-y-3 text-[12px] leading-relaxed text-product-text">
					<p>
						Choose the one user-problem pair you can test fastest. This is the
						commitment that shapes the rest of the CEO block.
					</p>
					<ul className="grid gap-2 md:grid-cols-3">
						{[
							"Pick a specific person or group, not a broad audience.",
							"Choose the pain that sounds repeated and recognizable.",
							"Bias toward the user you can reach this week.",
						].map((item) => (
							<li
								key={item}
								className="border border-product-border/60 bg-product-surface px-3 py-2"
							>
								{item}
							</li>
						))}
					</ul>
					<p className="text-[11px] text-product-muted">
						You can switch choices anytime before completing the lesson.
					</p>
					{candidateProblems.length > 0 ? (
						<div className="grid gap-3 lg:grid-cols-3">
							{candidateProblems.map((problem) => {
								const isSelected = problem.index === selectedProblemIndex;
								const isDimmed = selectedProblemIndex !== null && !isSelected;

								return (
									<button
										key={problem.index}
										type="button"
										onClick={() => {
											onFieldChange(handoff.selectionFieldId, problem.index);
											for (const field of persistedFields) {
												onFieldChange(
													field.targetFieldId,
													field.source === "owner"
														? problem.owner
														: problem.statement,
												);
											}
										}}
										className={`flex h-full flex-col border px-4 py-4 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[rgb(var(--product-accent))] ${
											isSelected
												? "border-product-accent bg-product-chip/55"
												: isDimmed
													? "border-product-border/70 bg-product-surface/45 hover:bg-product-surface/60"
													: "border-product-border bg-product-surface hover:bg-product-surface-strong"
										}`}
									>
										<div className="flex items-center justify-between gap-3">
											<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
												Problem {problem.index}
											</p>
											<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
												{isSelected
													? "Current choice"
													: isDimmed
														? "Not chosen"
														: "Available"}
											</p>
										</div>
										<p className="mt-3 font-display text-sm uppercase tracking-[0.04em] text-product-text">
											{problem.owner}
										</p>
										<p className="mt-3 flex-1 text-[12px] leading-relaxed text-product-text">
											{problem.statement}
										</p>
										<ul className="mt-4 space-y-1 border-t border-product-border/60 pt-3 text-[11px] leading-relaxed text-product-muted">
											{getCandidateSignals(problem).map((signal) => (
												<li key={`${problem.index}-${signal}`}>{signal}</li>
											))}
										</ul>
										<p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
											{isSelected ? "Selected" : "Commit to this user"}
										</p>
									</button>
								);
							})}
						</div>
					) : (
						<div className="border border-dashed border-product-border bg-product-surface px-4 py-4 text-product-muted">
							The problems from `1.1` are not available yet. Go back and finish
							that page first.
						</div>
					)}
					{invalidFieldIds.has(handoff.selectionFieldId) ? (
						<p className="text-[11px] font-medium leading-relaxed text-[#a83232]">
							Choose the one user-problem pair you can test fastest.
						</p>
					) : null}
				</div>
			</WorkbenchCard>
			<WorkbenchCard label="Pressure-test your choice">
				<div className="space-y-3 text-[12px] leading-relaxed text-product-text">
					<p>
						Before you move on, make sure this is a real user with a real moment
						of pain and a path to reach them soon.
					</p>
					<div className="grid gap-3 md:grid-cols-3">
						{previewRows.slice(2).map((row) => (
							<div
								key={row.label}
								className="border border-product-border/60 bg-product-surface px-3 py-3"
							>
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									{row.label}
								</p>
								<p
									className={`mt-2 ${row.filled ? "text-product-text" : "text-product-muted"}`}
								>
									{row.value}
								</p>
							</div>
						))}
					</div>
					{selectedProblem ? (
						<p className="text-[11px] text-product-muted">
							You picked <strong>{selectedProblem.owner}</strong>. The detailed
							notes below should prove this is the user you want to serve first.
						</p>
					) : (
						<p className="text-[11px] text-product-muted">
							Pick a user above to unlock the detailed notes below.
						</p>
					)}
				</div>
			</WorkbenchCard>
			<WorkbenchCard label="User statement preview">
				<div className="space-y-3 text-[12px] leading-relaxed text-product-text">
					<p>
						This is the direction <code className="mx-1 font-mono">1.3</code>{" "}
						will inherit next.
					</p>
					<div className="space-y-2 border border-product-border/60 bg-product-surface px-4 py-4">
						{previewRows.map((row) => (
							<div key={row.label}>
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									{row.label}
								</p>
								<p
									className={`mt-1 ${row.filled ? "text-product-text" : "text-product-muted"}`}
								>
									{row.value}
								</p>
							</div>
						))}
					</div>
				</div>
			</WorkbenchCard>
		</div>
	);
}
