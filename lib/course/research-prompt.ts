import type { LessonPromptImport, LessonPromptTemplateId } from "./contracts";
import type { PersistedFieldValues } from "./registry";

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

export type PromptTemplateArtifactContext = {
	artifactKey: string;
	fieldValues: PersistedFieldValues;
};

export type PromptTemplateState = {
	prompt: string | null;
	disabledReason: string | null;
};

export type CompetitorResearchImportResult = {
	rows: string[][];
	summary: string;
};

const RESEARCH_TABLE_HEADING = "research table";
const KEY_PATTERN_HEADING = "key pattern i noticed";

function formatContextLine(label: string, value?: string) {
	if (!value) {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? `- ${label}: ${trimmed}` : null;
}

function getTrimmedFieldValue(
	fieldValues: PersistedFieldValues,
	fieldId: string,
): string | null {
	const value = fieldValues[fieldId];
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function getCompetitorResearchPromptContext(
	pinnedArtifacts: PromptTemplateArtifactContext[],
): CompetitorResearchPromptContext | null {
	const userArtifact =
		pinnedArtifacts.find(
			(artifact) => artifact.artifactKey === "user_statement",
		) ?? null;
	const outcomeArtifact =
		pinnedArtifacts.find(
			(artifact) => artifact.artifactKey === "outcome_statement",
		) ?? null;

	if (!userArtifact || !outcomeArtifact) {
		return null;
	}

	const user = getTrimmedFieldValue(
		userArtifact.fieldValues,
		"selected_problem_owner",
	);
	const problem = getTrimmedFieldValue(
		userArtifact.fieldValues,
		"selected_problem_statement",
	);
	const outcome = getTrimmedFieldValue(outcomeArtifact.fieldValues, "outcome");

	if (!user || !problem || !outcome) {
		return null;
	}

	return {
		user: {
			statement: user,
			problem,
			painMoment:
				getTrimmedFieldValue(userArtifact.fieldValues, "pain_moment") ??
				undefined,
			currentSolution:
				getTrimmedFieldValue(userArtifact.fieldValues, "current_solution") ??
				undefined,
			reachability:
				getTrimmedFieldValue(userArtifact.fieldValues, "reachability") ??
				undefined,
		},
		outcome: {
			statement: outcome,
			successLooksLike:
				getTrimmedFieldValue(
					outcomeArtifact.fieldValues,
					"success_looks_like",
				) ?? undefined,
			differenceForUser:
				getTrimmedFieldValue(
					outcomeArtifact.fieldValues,
					"difference_for_user",
				) ?? undefined,
		},
	};
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
		"- Do not add bullets.",
		"- Do not include citations, source lists, or a references appendix in the returned output.",
		"- Each line must follow this exact field order:",
		"solution name | what it does well | where it falls short | what users care about most",
		"",
		"Key pattern I noticed",
		"- After the Research Table, add this section label exactly: Key pattern I noticed",
		"- Under it, write a short synthesis of the main pattern across the solutions",
		"- Keep this synthesis brief, concrete, and decision-useful",
		"- If the evidence is thin or mixed, say that clearly",
		"- Do not add citations or source notes here either",
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

export function getPromptTemplateState(
	promptTemplateId: LessonPromptTemplateId,
	pinnedArtifacts: PromptTemplateArtifactContext[],
): PromptTemplateState {
	if (promptTemplateId !== "competitor_research") {
		return {
			prompt: null,
			disabledReason: "This prompt template is not wired yet.",
		};
	}

	const context = getCompetitorResearchPromptContext(pinnedArtifacts);
	if (!context) {
		return {
			prompt: null,
			disabledReason:
				"Finish lessons 1.2 and 1.3 first so we can build this prompt from your chosen user and outcome.",
		};
	}

	return {
		prompt: buildCompetitorResearchPrompt(context),
		disabledReason: null,
	};
}

function normalizeHeadingText(line: string) {
	return line
		.trim()
		.replace(/^#{1,6}\s*/, "")
		.replace(/^[-*+]\s+/, "")
		.replace(/^\d+[.)]\s+/, "")
		.replace(/:$/, "")
		.trim()
		.toLowerCase();
}

function stripListPrefix(line: string) {
	return line
		.trim()
		.replace(/^[-*+]\s+/, "")
		.replace(/^\d+[.)]\s+/, "");
}

function isFootnoteDefinition(line: string) {
	return /^\[\d+\]:\s+/u.test(line.trim());
}

function isMarkdownTableDivider(line: string) {
	return /^\|?[\s:-]+(?:\|[\s:-]+)+\|?$/u.test(line.trim());
}

function normalizeSpacing(value: string) {
	return value
		.replace(/\s{2,}/gu, " ")
		.replace(/\s+([.,;:!?])/gu, "$1")
		.replace(/\(\s*\)/gu, "")
		.trim();
}

function stripInlineCitations(value: string) {
	return normalizeSpacing(
		value
			.replace(
				/\(\s*(?:\[[^\]]+\]\[\d+\]|\[[^\]]+\]\([^)]+\)|https?:\/\/[^)\s]+|www\.[^)\s]+)(?:\s*,\s*(?:\[[^\]]+\]\[\d+\]|\[[^\]]+\]\([^)]+\)|https?:\/\/[^)\s]+|www\.[^)\s]+))*\s*\)/gu,
				"",
			)
			.replace(/\[([^\]]+)\]\[\d+\]/gu, "$1")
			.replace(/\[([^\]]+)\]\(([^)]+)\)/gu, "$1")
			.replace(/\s*\[\d+\]/gu, ""),
	);
}

function collectSectionLines(input: string) {
	const tableLines: string[] = [];
	const summaryLines: string[] = [];
	let currentSection: "table" | "summary" | null = null;

	for (const rawLine of input.replace(/\r\n?/gu, "\n").split("\n")) {
		const normalizedHeading = normalizeHeadingText(rawLine);

		if (normalizedHeading === RESEARCH_TABLE_HEADING) {
			currentSection = "table";
			continue;
		}

		if (normalizedHeading === KEY_PATTERN_HEADING) {
			currentSection = "summary";
			continue;
		}

		if (!currentSection) {
			continue;
		}

		if (isFootnoteDefinition(rawLine)) {
			continue;
		}

		if (currentSection === "table") {
			tableLines.push(rawLine);
			continue;
		}

		summaryLines.push(rawLine);
	}

	return { tableLines, summaryLines };
}

function isHeaderLikeRow(cells: string[]) {
	if (cells.length !== 4) {
		return false;
	}

	const [first, second, third, fourth] = cells.map((cell) =>
		cell.trim().toLowerCase(),
	);

	return (
		(first.includes("solution") || first.includes("competitor")) &&
		(second.includes("does well") || second === "good") &&
		(third.includes("falls short") || third === "poor") &&
		fourth.includes("care")
	);
}

function parseResearchTableRows(lines: string[]) {
	const rows: string[][] = [];

	for (const rawLine of lines) {
		const cleanedLine = stripListPrefix(stripInlineCitations(rawLine));
		if (cleanedLine.length === 0 || isMarkdownTableDivider(cleanedLine)) {
			continue;
		}

		const normalizedLine = cleanedLine
			.replace(/^\|/u, "")
			.replace(/\|$/u, "")
			.trim();
		if (normalizedLine.length === 0 || !normalizedLine.includes("|")) {
			continue;
		}

		const cells = normalizedLine
			.split("|")
			.map((cell) => normalizeSpacing(stripInlineCitations(cell)));
		if (isHeaderLikeRow(cells) || cells.every((cell) => cell.length === 0)) {
			continue;
		}

		if (cells.length !== 4 || cells.some((cell) => cell.length === 0)) {
			throw new Error(
				"Paste the ChatGPT response with each research row in this format: solution name | what it does well | where it falls short | what users care about most.",
			);
		}

		rows.push(cells);
	}

	if (rows.length === 0) {
		throw new Error(
			"Paste the full response with a Research Table section that contains at least one usable row.",
		);
	}

	return rows;
}

function parseResearchSummary(lines: string[]) {
	const summary = lines
		.map((line) =>
			normalizeSpacing(stripListPrefix(stripInlineCitations(line))),
		)
		.filter((line) => line.length > 0 && !isFootnoteDefinition(line))
		.join("\n")
		.trim();

	if (summary.length === 0) {
		throw new Error(
			"Paste the full response with a Key pattern I noticed section so we can fill the summary field.",
		);
	}

	return summary;
}

export function parseCompetitorResearchImport(
	input: string,
): CompetitorResearchImportResult {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		throw new Error(
			"Paste the full ChatGPT response that includes both Research Table and Key pattern I noticed.",
		);
	}

	const { tableLines, summaryLines } = collectSectionLines(trimmed);
	if (tableLines.length === 0 || summaryLines.length === 0) {
		throw new Error(
			"Paste the full ChatGPT response that includes both Research Table and Key pattern I noticed.",
		);
	}

	return {
		rows: parseResearchTableRows(tableLines),
		summary: parseResearchSummary(summaryLines),
	};
}

export function parsePromptTemplateImport(
	promptTemplateId: LessonPromptTemplateId,
	input: string,
) {
	if (promptTemplateId !== "competitor_research") {
		throw new Error("This prompt import is not wired yet.");
	}

	return parseCompetitorResearchImport(input);
}

export function buildPromptImportFieldValues(
	promptImport: LessonPromptImport,
	input: string,
) {
	const imported = parsePromptTemplateImport(
		promptImport.promptTemplateId,
		input,
	);

	return {
		[promptImport.tableFieldId]: imported.rows,
		[promptImport.summaryFieldId]: imported.summary,
	};
}
