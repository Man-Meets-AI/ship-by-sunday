import type { LessonContent } from "@/lib/course/manifest";

import { WorkbenchCard } from "../shared/workbench-card";
import { StartWithProblemCandidateCard } from "./start-with-problem-candidate-card";

const BROAD_AUDIENCE_PATTERN =
	/\b(users?|people|everyone|anyone|business(?:es)?|companies|founders|teams)\b/i;
const SOLUTION_LANGUAGE_PATTERN =
	/\b(ai|app|tool|platform|product|build|create|software|assistant)\b/i;

function getTrimmedValue(fieldValues: Record<string, unknown>, key: string) {
	const value = fieldValues[key];
	return typeof value === "string" ? value.trim() : "";
}

function getCandidate(fieldValues: Record<string, unknown>, index: 1 | 2 | 3) {
	return {
		index,
		owner: getTrimmedValue(fieldValues, `problem_${index}_who`),
		pain: getTrimmedValue(fieldValues, `problem_${index}_pain`),
	};
}

function getSignals(candidate: ReturnType<typeof getCandidate>) {
	const ownerLooksSpecific =
		candidate.owner.length >= 4 &&
		!BROAD_AUDIENCE_PATTERN.test(candidate.owner);
	const painLooksGrounded =
		candidate.pain.length >= 24 &&
		!SOLUTION_LANGUAGE_PATTERN.test(candidate.pain);
	const painLooksRecognizable =
		/\b(after|when|during|every|each|because|without|before)\b/i.test(
			candidate.pain,
		) || candidate.pain.length >= 60;

	return [
		{
			label: "Real person or group",
			ok: ownerLooksSpecific,
			help: ownerLooksSpecific
				? candidate.owner
				: "Sharpen beyond broad labels like teams, founders, or users.",
		},
		{
			label: "Recurring painful problem",
			ok: painLooksGrounded,
			help: painLooksGrounded
				? "Reads more like pain than a product idea."
				: "Describe what keeps going wrong, not the app you want to build.",
		},
		{
			label: "Recognizable situation",
			ok: painLooksRecognizable,
			help: painLooksRecognizable
				? "The moment sounds concrete enough to picture."
				: "Add when or where this pain shows up so the person would recognize it.",
		},
	];
}

export function StartWithProblemSupport({
	lessonContent,
	fieldValues,
}: {
	lessonContent: LessonContent;
	fieldValues: Record<string, unknown>;
}) {
	const examples = (lessonContent.coach.examples ?? []).slice(0, 2);
	const candidates = [
		getCandidate(fieldValues, 1),
		getCandidate(fieldValues, 2),
		getCandidate(fieldValues, 3),
	];

	return (
		<div className="space-y-3">
			<WorkbenchCard label="Quality bar">
				<div className="space-y-3 text-[12px] leading-relaxed text-product-text">
					<p>
						Write three candidate pains that are grounded enough to carry into
						<code className="mx-1 font-mono text-[11px]">1.2</code>. Strong
						problems name a real person, a recurring headache, and a situation
						that person would recognize immediately.
					</p>
					<ul className="grid gap-2 md:grid-cols-3">
						{[
							"Name a real person or group, not a market.",
							"Describe the pain that keeps happening.",
							"Anchor it in life or work, not a startup idea.",
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
						Next lesson handoff: you will choose one of these three problems to
						carry into <code className="mx-1 font-mono">1.2 Pick One User</code>
						.
					</p>
				</div>
			</WorkbenchCard>
			{examples.length > 0 ? (
				<WorkbenchCard label="Examples that set the bar">
					<div className="grid gap-3 lg:grid-cols-2">
						{examples.map((example) => (
							<div
								key={example.id}
								className="border border-product-border/60 bg-product-surface px-3 py-3"
							>
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									{example.title}
								</p>
								<p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-product-text">
									{example.body}
								</p>
							</div>
						))}
					</div>
				</WorkbenchCard>
			) : null}
			<WorkbenchCard label="Compare your three candidates">
				<div className="grid gap-3 lg:grid-cols-3">
					{candidates.map((candidate) => (
						<StartWithProblemCandidateCard
							key={candidate.index}
							index={candidate.index}
							owner={candidate.owner}
							pain={candidate.pain}
							signals={getSignals(candidate)}
						/>
					))}
				</div>
			</WorkbenchCard>
		</div>
	);
}
