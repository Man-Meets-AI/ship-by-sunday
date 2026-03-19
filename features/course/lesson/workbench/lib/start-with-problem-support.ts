export type StartWithProblemSignal = {
	label: string;
	ok: boolean;
	help: string;
};

const BROAD_AUDIENCE_PATTERN =
	/\b(users?|people|everyone|anyone|business(?:es)?|companies|founders|teams)\b/i;
const SOLUTION_LANGUAGE_PATTERN =
	/\b(ai|app|tool|platform|product|build|create|software|assistant)\b/i;

function getTrimmedValue(fieldValues: Record<string, unknown>, key: string) {
	const value = fieldValues[key];
	return typeof value === "string" ? value.trim() : "";
}

export function getStartWithProblemCandidate(
	fieldValues: Record<string, unknown>,
	index: 1 | 2 | 3,
) {
	return {
		index,
		owner: getTrimmedValue(fieldValues, `problem_${index}_who`),
		pain: getTrimmedValue(fieldValues, `problem_${index}_pain`),
	};
}

export type StartWithProblemCandidate = ReturnType<
	typeof getStartWithProblemCandidate
>;

export function getStartWithProblemSignals(
	candidate: StartWithProblemCandidate,
): StartWithProblemSignal[] {
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
