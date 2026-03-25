import type { LessonPromptImport, LessonPromptTemplateId } from "./contracts";
import { getReferenceGalleryImageUrls } from "./reference-gallery";
import type { PersistedFieldValues } from "./registry";
import {
	type FieldValuesSource,
	normalizeFieldValues,
} from "./registry/shared";

export type CompetitorResearchPromptContext = {
	user: {
		statement: string;
		problem: string;
		when?: string;
		whereSituation?: string;
		trigger?: string;
		painLevel?: string;
		painWhyNow?: string;
	};
	outcome: {
		statement: string;
		successLooksLike?: string;
		differenceForUser?: string;
	};
};

export type ScopeBoundaryPromptContext = CompetitorResearchPromptContext & {
	research?: {
		summary?: string;
		rows: Array<{
			solutionName: string;
			whatItDoesWell: string;
			whereItFallsShort: string;
			whatUsersCareAboutMost: string;
		}>;
	};
};

export type VisualDirectionGuidePromptContext = {
	directionNotes: string;
	referenceImageUrls?: string[];
};

export type PromptTemplateArtifactContext = {
	artifactKey: string;
	fieldValues: PersistedFieldValues;
	fields?: Array<[string, unknown]>;
};

export type PromptTemplateState = {
	prompt: string | null;
	disabledReason: string | null;
};

export type CompetitorResearchImportResult = {
	rows: string[][];
	summary: string;
};

export type ScopeBoundaryImportResult = {
	inScope: string[];
	outOfScope: string[];
	rationale: string;
};

const RESEARCH_TABLE_HEADING = "research table";
const RESEARCH_SUMMARY_HEADINGS = [
	"what this means for my v1",
	"key pattern i noticed",
];
const KEEP_IN_V1_HEADINGS = ["keep in v1", "in scope", "in scope features"];
const CUT_FROM_V1_HEADINGS = [
	"cut from v1",
	"out of scope",
	"out of scope features",
];
const V1_RATIONALE_HEADINGS = [
	"why this version is enough",
	"why this is enough for v1",
	"v1 rationale",
];

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

function getResearchRows(fieldValues: PersistedFieldValues, fieldId: string) {
	const value = fieldValues[fieldId];
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.filter(
			(row): row is string[] =>
				Array.isArray(row) && row.every((cell) => typeof cell === "string"),
		)
		.map((row) => row.map((cell) => cell.trim()))
		.filter(
			(row) =>
				row.length >= 4 && row.slice(0, 4).every((cell) => cell.length > 0),
		)
		.map(
			([
				solutionName,
				whatItDoesWell,
				whereItFallsShort,
				whatUsersCareAboutMost,
			]) => ({
				solutionName,
				whatItDoesWell,
				whereItFallsShort,
				whatUsersCareAboutMost,
			}),
		);
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
	const outcomeStatement = getTrimmedFieldValue(
		outcomeArtifact.fieldValues,
		"outcome_statement_body",
	);

	if (!user || !problem || !outcomeStatement) {
		return null;
	}

	return {
		user: {
			statement: user,
			problem,
			when:
				getTrimmedFieldValue(userArtifact.fieldValues, "problem_when") ??
				undefined,
			whereSituation:
				getTrimmedFieldValue(userArtifact.fieldValues, "problem_where") ??
				undefined,
			trigger:
				getTrimmedFieldValue(userArtifact.fieldValues, "problem_trigger") ??
				undefined,
			painLevel:
				getTrimmedFieldValue(userArtifact.fieldValues, "pain_level") ??
				undefined,
			painWhyNow:
				getTrimmedFieldValue(userArtifact.fieldValues, "pain_why_now") ??
				undefined,
		},
		outcome: {
			statement: outcomeStatement,
			successLooksLike:
				getTrimmedFieldValue(
					outcomeArtifact.fieldValues,
					"messaging_what_it_does",
				) ?? undefined,
			differenceForUser:
				getTrimmedFieldValue(
					outcomeArtifact.fieldValues,
					"messaging_benefit",
				) ?? undefined,
		},
	};
}

function getScopeBoundaryPromptContext(
	pinnedArtifacts: PromptTemplateArtifactContext[],
): ScopeBoundaryPromptContext | null {
	const baseContext = getCompetitorResearchPromptContext(pinnedArtifacts);
	if (!baseContext) {
		return null;
	}

	const researchArtifact =
		pinnedArtifacts.find(
			(artifact) => artifact.artifactKey === "research_notes",
		) ?? null;
	const researchRows = researchArtifact
		? getResearchRows(researchArtifact.fieldValues, "research_table").slice(
				0,
				3,
			)
		: [];
	const researchSummary = researchArtifact
		? (getTrimmedFieldValue(researchArtifact.fieldValues, "research_summary") ??
			undefined)
		: undefined;

	return {
		...baseContext,
		research:
			researchRows.length > 0 || researchSummary
				? {
						rows: researchRows,
						summary: researchSummary,
					}
				: undefined,
	};
}

function getVisualDirectionGuidePromptContext(
	pinnedArtifacts: PromptTemplateArtifactContext[],
	fieldValues: PersistedFieldValues,
): VisualDirectionGuidePromptContext | null {
	const referenceArtifact =
		pinnedArtifacts.find(
			(artifact) => artifact.artifactKey === "reference_board",
		) ?? null;
	const directionNotes = getTrimmedFieldValue(
		fieldValues,
		"visual_direction_notes",
	);
	const referenceImageUrls = referenceArtifact
		? getReferenceGalleryImageUrls(
				referenceArtifact.fieldValues.reference_gallery,
				8,
			)
		: [];

	if (!directionNotes) {
		return null;
	}

	return {
		directionNotes,
		referenceImageUrls:
			referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
	};
}

export function buildCompetitorResearchPrompt(
	context: CompetitorResearchPromptContext,
) {
	const contextLines = [
		formatContextLine("User", context.user.statement),
		formatContextLine("Problem to solve", context.user.problem),
		formatContextLine("When it happens", context.user.when),
		formatContextLine("Where / situation", context.user.whereSituation),
		formatContextLine("Trigger", context.user.trigger),
		formatContextLine("Pain level", context.user.painLevel),
		formatContextLine("Why solve now", context.user.painWhyNow),
		formatContextLine("Desired outcome", context.outcome.statement),
		formatContextLine("What it does", context.outcome.successLooksLike),
		formatContextLine("What they get", context.outcome.differenceForUser),
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
		"5. what evidence you saw",
		"",
		"Writing guidance:",
		"- Keep every field concise and specific",
		"- Use practical product language, not analyst jargon",
		"- Focus on the parts that would matter to a builder deciding what to emulate, avoid, or differentiate from",
		"- Prefer sharp observations over broad summaries",
		"- Mention uncertainty plainly when needed",
		'- In "what evidence you saw", name the concrete surface briefly, such as product page, pricing page, onboarding flow, help doc, review thread, or app store listing.',
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
		"solution name | what it does well | where it falls short | what users care about most | what evidence you saw",
		"",
		"What this means for my v1",
		"- After the Research Table, add this section label exactly: What this means for my v1",
		"- Under it, write a short synthesis of the main pattern across the solutions and the product decision it should change",
		"- Keep this synthesis brief, concrete, and decision-useful",
		"- If the evidence is thin or mixed, say that clearly",
		"- Do not add citations or source notes here either",
		"",
		"Output rules:",
		"- Return only these two sections:",
		"  1. Research Table",
		"  2. What this means for my v1",
		"- Keep the Research Table section as raw | delimited lines only.",
		"- Keep the Research Table clean enough to paste directly into structured product fields with minimal cleanup",
		"- Do not add intro text",
		"- Do not add conclusion text",
		"- Do not add any extra sections",
	].join("\n");
}

export function buildScopeBoundaryPrompt(context: ScopeBoundaryPromptContext) {
	const contextLines = [
		formatContextLine("User", context.user.statement),
		formatContextLine("Problem to solve", context.user.problem),
		formatContextLine("When it happens", context.user.when),
		formatContextLine("Where / situation", context.user.whereSituation),
		formatContextLine("Trigger", context.user.trigger),
		formatContextLine("Pain level", context.user.painLevel),
		formatContextLine("Why solve now", context.user.painWhyNow),
		formatContextLine("Desired outcome", context.outcome.statement),
		formatContextLine("What it does", context.outcome.successLooksLike),
		formatContextLine("What they get", context.outcome.differenceForUser),
	].filter((line): line is string => Boolean(line));
	const researchLines = [
		...(context.research?.rows ?? []).map(
			(row) =>
				`- ${row.solutionName}: does well -> ${row.whatItDoesWell}; falls short -> ${row.whereItFallsShort}; users care about -> ${row.whatUsersCareAboutMost}`,
		),
		formatContextLine("Research pattern", context.research?.summary),
	].filter((line): line is string => Boolean(line));

	return [
		"You are helping a builder cut an MVP to the smallest believable version they can ship in a weekend sprint.",
		"",
		"Your job is to recommend the narrowest v1 that still lets the user reach the promised outcome in one clean core flow.",
		"Prefer subtraction over ambition.",
		"",
		"Do not turn this into a roadmap, platform plan, or future-state vision.",
		"",
		"Context to scope against:",
		...contextLines,
		"",
		"Research signal to keep in mind:",
		...(researchLines.length > 0
			? researchLines
			: [
					"- No extra research notes were saved. Scope from the user, problem, and outcome only.",
				]),
		"",
		"Scoping rules:",
		"- Assume one primary user, one core flow, and one believable weekend build.",
		"- Keep the Keep in v1 section to 3-5 items max.",
		"- Every Keep in v1 item should be necessary for the user to reach the outcome.",
		"- Phrase features as crisp user-facing capabilities, not vague themes or engineering chores.",
		"- Use the Cut from v1 section to name tempting extras builders often add too early.",
		"- Avoid dashboards, analytics, settings, collaboration, team roles, notifications, admin panels, integrations, billing, or platform-level extras unless they are absolutely required for the user to reach the outcome in the core flow.",
		"- If something sounds nice but is not necessary for the user to get the win, cut it.",
		"",
		"Required output format:",
		"",
		"Keep in v1",
		"- Output this section as a simple bullet list only.",
		"- One feature or capability per bullet.",
		"",
		"Cut from v1",
		"- Output this section as a simple bullet list only.",
		"- Include at least 3 cuts.",
		"",
		"Why this version is enough",
		"- Write 2-4 concise sentences.",
		"- Explain why this smaller version is still believable and useful for the user.",
		"",
		"Output rules:",
		"- Return only these three sections in this order:",
		"  1. Keep in v1",
		"  2. Cut from v1",
		"  3. Why this version is enough",
		"- Do not add intro text.",
		"- Do not add conclusion text.",
		"- Do not add any extra sections.",
		"- Do not include citations or source lists.",
	].join("\n");
}

export function buildVisualDirectionGuidePrompt(
	context: VisualDirectionGuidePromptContext,
) {
	const referenceLines = (context.referenceImageUrls ?? []).map(
		(url, index) => `- Reference ${index + 1}: ${url}`,
	);

	return [
		"You are helping a builder turn rough screens and a stated visual direction into a practical app visual system they can build from this weekend.",
		"",
		"Your job is to write one markdown file named `visualguide.md` that gives a coding agent enough visual direction to build a coherent first version without inventing the design from scratch.",
		"",
		"Do not write implementation code.",
		"Do not explain your process.",
		"Do not add intro text or outro text outside the markdown file contents.",
		"",
		"Direction note from the builder:",
		`- ${context.directionNotes}`,
		...(referenceLines.length > 0
			? ["", "Reference images to study:", ...referenceLines]
			: []),
		"",
		"File requirements for `visualguide.md`:",
		"- Keep it practical and build-oriented, not brand-agency fluff.",
		"- Translate the references into rules a coding agent can follow.",
		"- Stay specific about hierarchy, typography feel, spacing, surfaces, contrast, interaction tone, and what to avoid.",
		"- Tie the visual guidance back to the references instead of inventing a new style direction.",
		"- Assume the builder wants a sharp v1, not a full design system.",
		"",
		"Use this markdown structure exactly:",
		"# Visual Guide",
		"## Overall Direction",
		"## Design Principles",
		"## Typography Direction",
		"## Color and Contrast",
		"## Layout and Spacing",
		"## Components and UI Patterns",
		"## Interaction Tone",
		"## What To Avoid",
		"",
		"Each section should be concise, concrete, and action-oriented.",
		"",
		"Output rules:",
		"- Return only the markdown contents of `visualguide.md`.",
		"- Do not wrap the file in prose before or after the markdown.",
		"- If you use a code fence, it must contain only the markdown file and nothing else.",
	].join("\n");
}

export function getPromptTemplateState(
	promptTemplateId: LessonPromptTemplateId,
	pinnedArtifacts: PromptTemplateArtifactContext[],
	fieldValues: FieldValuesSource = {},
): PromptTemplateState {
	const values = normalizeFieldValues(fieldValues);

	if (promptTemplateId === "competitor_research") {
		const context = getCompetitorResearchPromptContext(pinnedArtifacts);
		if (!context) {
			return {
				prompt: null,
				disabledReason:
					"Finish lessons 1.4 and 1.5 first so we can build this prompt from your chosen user and outcome.",
			};
		}

		return {
			prompt: buildCompetitorResearchPrompt(context),
			disabledReason: null,
		};
	}

	if (promptTemplateId === "scope_boundary") {
		const context = getScopeBoundaryPromptContext(pinnedArtifacts);
		if (!context) {
			return {
				prompt: null,
				disabledReason:
					"Finish lessons 1.4 through 1.6 first so we can build this scope cut from your chosen user, outcome, and research.",
			};
		}

		return {
			prompt: buildScopeBoundaryPrompt(context),
			disabledReason: null,
		};
	}

	if (promptTemplateId === "visual_direction_guide") {
		const context = getVisualDirectionGuidePromptContext(
			pinnedArtifacts,
			values,
		);
		if (!context) {
			return {
				prompt: null,
				disabledReason:
					"Save at least one visual direction note here before building this prompt.",
			};
		}

		return {
			prompt: buildVisualDirectionGuidePrompt(context),
			disabledReason: null,
		};
	}

	return {
		prompt: null,
		disabledReason: "This prompt template is not wired yet.",
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

function collectNamedSectionLines<TSection extends string>(
	input: string,
	headingAliases: Record<TSection, string[]>,
) {
	const sections = {} as Record<TSection, string[]>;
	const headingMap = new Map<string, TSection>();
	let currentSection: TSection | null = null;

	for (const sectionKey of Object.keys(headingAliases) as TSection[]) {
		sections[sectionKey] = [];
	}

	for (const [sectionKey, aliases] of Object.entries(headingAliases) as Array<
		[TSection, string[]]
	>) {
		for (const alias of aliases) {
			headingMap.set(alias, sectionKey);
		}
	}

	for (const rawLine of input.replace(/\r\n?/gu, "\n").split("\n")) {
		const normalizedHeading = normalizeHeadingText(rawLine);
		const nextSection = headingMap.get(normalizedHeading);

		if (nextSection) {
			currentSection = nextSection;
			continue;
		}

		if (!currentSection || isFootnoteDefinition(rawLine)) {
			continue;
		}

		sections[currentSection].push(rawLine);
	}

	return sections;
}

function collectSectionLines(input: string) {
	const sections = collectNamedSectionLines(input, {
		table: [RESEARCH_TABLE_HEADING],
		summary: RESEARCH_SUMMARY_HEADINGS,
	});

	return {
		tableLines: sections.table,
		summaryLines: sections.summary,
	};
}

function isHeaderLikeRow(cells: string[]) {
	if (cells.length !== 4 && cells.length !== 5) {
		return false;
	}

	const [first, second, third, fourth, fifth] = cells.map((cell) =>
		cell.trim().toLowerCase(),
	);

	return (
		(first.includes("solution") || first.includes("competitor")) &&
		(second.includes("does well") || second === "good") &&
		(third.includes("falls short") || third === "poor") &&
		fourth.includes("care") &&
		(fifth === undefined ||
			fifth.includes("evidence") ||
			fifth.includes("source") ||
			fifth.includes("saw"))
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

		if (
			(cells.length !== 4 && cells.length !== 5) ||
			cells.slice(0, 4).some((cell) => cell.length === 0)
		) {
			throw new Error(
				"Paste the ChatGPT response with each research row in this format: solution name | what it does well | where it falls short | what users care about most | what evidence you saw.",
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

function parseParagraphSection(lines: string[], emptyMessage: string) {
	const summary = lines
		.map((line) =>
			normalizeSpacing(stripListPrefix(stripInlineCitations(line))),
		)
		.filter((line) => line.length > 0 && !isFootnoteDefinition(line))
		.join("\n")
		.trim();

	if (summary.length === 0) {
		throw new Error(emptyMessage);
	}

	return summary;
}

function parseResearchSummary(lines: string[]) {
	return parseParagraphSection(
		lines,
		"Paste the full response with a What this means for my v1 section so we can fill the summary field.",
	);
}

function parseScopeList(lines: string[], emptyMessage: string) {
	const items = lines
		.map((line) =>
			normalizeSpacing(stripListPrefix(stripInlineCitations(line))),
		)
		.filter((line) => line.length > 0 && !isMarkdownTableDivider(line));

	if (items.length === 0) {
		throw new Error(emptyMessage);
	}

	return items;
}

function extractMarkdownDocument(input: string) {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		throw new Error(
			"Paste the returned `visualguide.md` markdown so we can save it in the lesson.",
		);
	}

	if (!trimmed.includes("```")) {
		return trimmed;
	}

	const fencedMatch = trimmed.match(
		/^```(?:md|markdown)?\s*\n?([\s\S]*?)\n?```$/iu,
	);
	if (!fencedMatch) {
		throw new Error(
			"Paste only the raw `visualguide.md` markdown or one fenced markdown block with no extra commentary.",
		);
	}

	const document = fencedMatch[1]?.trim() ?? "";
	if (document.length === 0) {
		throw new Error(
			"Paste the returned `visualguide.md` markdown so we can save it in the lesson.",
		);
	}

	return document;
}

export function parseCompetitorResearchImport(
	input: string,
): CompetitorResearchImportResult {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		throw new Error(
			"Paste the full ChatGPT response that includes both Research Table and What this means for my v1.",
		);
	}

	const { tableLines, summaryLines } = collectSectionLines(trimmed);
	if (tableLines.length === 0 || summaryLines.length === 0) {
		throw new Error(
			"Paste the full ChatGPT response that includes both Research Table and What this means for my v1.",
		);
	}

	return {
		rows: parseResearchTableRows(tableLines),
		summary: parseResearchSummary(summaryLines),
	};
}

export function parseScopeBoundaryImport(
	input: string,
): ScopeBoundaryImportResult {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		throw new Error(
			"Paste the full ChatGPT response that includes Keep in v1, Cut from v1, and Why this version is enough.",
		);
	}

	const sections = collectNamedSectionLines(trimmed, {
		inScope: KEEP_IN_V1_HEADINGS,
		outOfScope: CUT_FROM_V1_HEADINGS,
		rationale: V1_RATIONALE_HEADINGS,
	});

	if (
		sections.inScope.length === 0 ||
		sections.outOfScope.length === 0 ||
		sections.rationale.length === 0
	) {
		throw new Error(
			"Paste the full ChatGPT response that includes Keep in v1, Cut from v1, and Why this version is enough.",
		);
	}

	return {
		inScope: parseScopeList(
			sections.inScope,
			"Paste the full response with a Keep in v1 section that contains at least one usable item.",
		),
		outOfScope: parseScopeList(
			sections.outOfScope,
			"Paste the full response with a Cut from v1 section that contains at least one usable item.",
		),
		rationale: parseParagraphSection(
			sections.rationale,
			"Paste the full response with a Why this version is enough section so we can fill the v1 rationale.",
		),
	};
}

export function parseVisualDirectionGuideImport(input: string) {
	return extractMarkdownDocument(input);
}

export function buildPromptImportFieldValues(
	promptImport: LessonPromptImport,
	input: string,
) {
	if (promptImport.promptTemplateId === "competitor_research") {
		const imported = parseCompetitorResearchImport(input);

		return {
			[promptImport.tableFieldId]: imported.rows,
			[promptImport.summaryFieldId]: imported.summary,
		};
	}

	if (promptImport.promptTemplateId === "visual_direction_guide") {
		return {
			[promptImport.markdownFieldId]: parseVisualDirectionGuideImport(input),
		};
	}

	const imported = parseScopeBoundaryImport(input);

	return {
		[promptImport.inScopeFieldId]: imported.inScope,
		[promptImport.outOfScopeFieldId]: imported.outOfScope,
		[promptImport.rationaleFieldId]: imported.rationale,
	};
}
