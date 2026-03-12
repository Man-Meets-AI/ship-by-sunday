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
		formatContextLine("Reachability", context.user.reachability),
		formatContextLine("Desired outcome", context.outcome.statement),
		formatContextLine("Success looks like", context.outcome.successLooksLike),
		formatContextLine("Difference for user", context.outcome.differenceForUser),
	].filter((line): line is string => Boolean(line));

	return [
		"You are doing a fast competitor / adjacent-solution research pass for a product-building workflow.",
		"",
		"Your job is to help a builder quickly understand what existing solutions already do for this specific user, problem, and desired outcome so they can make better product decisions fast.",
		"",
		"This is not a full market landscape, analyst report, or strategy memo.",
		"Prioritize decision-useful signal over completeness.",
		"Be concrete, concise, and evidence-led.",
		"",
		"Context to anchor the research:",
		...contextLines,
		"",
		"What to research:",
		"- Find 2-3 relevant existing solutions that a user in this situation would realistically consider",
		"- These may include:",
		"  - direct competitors",
		"  - adjacent substitutes",
		"  - current workaround solutions",
		"- Prefer solutions with public evidence available",
		"",
		"Evidence standard:",
		"- Prefer public, observable evidence such as:",
		"  - product pages",
		"  - pricing pages",
		"  - onboarding flows",
		"  - app store listings",
		"  - G2",
		"  - Capterra",
		"  - Reddit",
		"  - community discussions",
		"  - review sites",
		"  - help docs",
		"- Base claims on what is actually supported by the available evidence",
		"- If evidence is thin, mixed, or indirect, say so briefly instead of overstating certainty",
		"- Do not invent user sentiment, product strengths, or weaknesses that are not reasonably supported",
		"",
		"Selection guidance:",
		"- Choose solutions that are most relevant to the user/problem/outcome combination above",
		"- Include a mix when useful: for example, one direct competitor, one adjacent substitute, and one workaround option",
		"- Ignore large but weakly related products if they are not realistic alternatives for this user",
		"- Favor relevance and signal density over brand fame",
		"",
		"For each solution, capture:",
		"1. solution name",
		"2. what it does well",
		"3. where it falls short",
		"4. what users seem to care about most",
		"",
		"Writing guidance:",
		"- Keep every field concise and specific",
		"- Use practical product language, not analyst jargon",
		"- Focus on the parts that would matter to a builder deciding what to emulate, avoid, or differentiate from",
		"- Prefer sharp observations over broad summaries",
		"- Mention uncertainty plainly when needed",
		"",
		"Required output format:",
		"",
		"Research Table",
		"- Output this section as raw pipe-delimited lines only",
		"- Do not use markdown table syntax.",
		"- Do not add a header row.",
		"- Do not number the lines.",
		"- Do not add bullets",
		"- Each line must follow this exact field order:",
		"solution name | what it does well | where it falls short | what users care about most",
		"",
		"Key pattern I noticed",
		"- After the Research Table, add this section label exactly: Key pattern I noticed",
		"- Under it, write a short synthesis of the main pattern across the solutions",
		"- Keep this synthesis brief, concrete, and decision-useful",
		"- If the evidence is thin or mixed, say that clearly",
		"",
		"Output rules:",
		"- Return only these two sections:",
		"  1. Research Table",
		"  2. Key pattern I noticed",
		"- Keep the Research Table section as raw | delimited lines only.",
		"- Keep the Research Table clean enough to paste directly into structured product fields with minimal cleanup",
		"- Do not add intro text",
		"- Do not add conclusion text",
		"- Do not add any extra sections",
	].join("\n");
}
