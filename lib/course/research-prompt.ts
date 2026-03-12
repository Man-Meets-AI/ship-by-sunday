export type CompetitorResearchPromptContext = {
	user: {
		statement: string;
		problem: string;
		painMoment?: string;
		currentSolution?: string;
		reachability?: string;
	};
	outcome: {
		statement: string;
		successLooksLike?: string;
		differenceForUser?: string;
	};
};

function formatContextLine(label: string, value?: string) {
	if (!value) {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? `- ${label}: ${trimmed}` : null;
}

export function buildCompetitorResearchPrompt(
	context: CompetitorResearchPromptContext,
) {
	const contextLines = [
		formatContextLine("User", context.user.statement),
		formatContextLine("Problem to solve", context.user.problem),
		formatContextLine("Pain moment", context.user.painMoment),
		formatContextLine("Current workaround", context.user.currentSolution),
		formatContextLine(
			"Why I can reach them quickly",
			context.user.reachability,
		),
		formatContextLine("Desired outcome", context.outcome.statement),
		formatContextLine("Success looks like", context.outcome.successLooksLike),
		formatContextLine(
			"What should feel different for the user",
			context.outcome.differenceForUser,
		),
	].filter((line): line is string => Boolean(line));

	return [
		"Act as a deep research analyst.",
		"",
		"Your goal is to find existing solutions that already solve the following problem for the following type of user.",
		"",
		"Current idea context",
		...contextLines,
		"",
		"Research task",
		"- Find 2-3 relevant solutions. Include direct competitors, adjacent substitutes, or the current workaround solution.",
		"- Use public evidence where possible: product pages, reviews, Reddit or community threads, app stores, G2/Capterra, or other credible discussion sources when relevant.",
		"- Focus on the fastest useful signal, not a giant market report.",
		"- For each solution, capture what it does well, where it falls short, and what users seem to care about most.",
		"",
		"Output exactly two sections in this order:",
		"",
		"Research Table",
		"Solution name | What it does well | Where it does poorly | What users care about",
		"Solution name | What it does well | Where it does poorly | What users care about",
		"Solution name | What it does well | Where it does poorly | What users care about",
		"",
		"Key pattern I noticed",
		"Write 2-4 sentences summarizing the strongest pattern across the solutions.",
		"",
		"Output rules",
		"- Do not use markdown table syntax.",
		"- Do not add a header row.",
		"- Do not number the lines.",
		"- Keep the Research Table section as raw | delimited lines only.",
		"- If evidence is thin, say that plainly instead of inventing certainty.",
		"",
		"Pasteback instructions",
		"- Paste the raw | delimited lines into the Research Table field in Ship by Sunday.",
		"- Paste the 2-4 sentence summary into the Key pattern I noticed field.",
	].join("\n");
}
