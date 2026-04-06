import type { CanonicalProjectFactsDraft } from "../canonical-project-definition/schema";
import {
	resolvePresetDesignSystem,
	type ResolvedPresetDesignSystem,
} from "./preset-design-system";

export type GeneratedDesignSystem = {
	productName: string;
	preset: ResolvedPresetDesignSystem;
	overview: string;
	users: string;
	brandPersonality: string;
	visualThemeAndAtmosphere: string;
	designPrinciples: string[];
	componentStylings: {
		buttons: string;
		cards: string;
		inputs: string;
		sidebar: string;
	};
	layoutPrinciples: string[];
	responsiveBehavior: string[];
	motionNotes: string[];
	dos: string[];
	donts: string[];
	agentPromptGuide: string[];
	derivedFacts: {
		visualThesis: string;
		contentPlan: string;
		interactionThesis: string;
		designTokens: string;
		typographyDirection: string;
		imageryDirection: string;
		layoutDirection: string;
		existingSystemMode: string;
		copyTone: string;
	};
	designReferences: string[];
};

function trimText(value: string | undefined) {
	return value?.trim() ?? "";
}

function cleanFragment(value: string | undefined) {
	return trimTrailingPunctuation(trimText(value));
}

function normalizeTextList(value: readonly string[] | undefined) {
	return (value ?? [])
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

function sentenceCase(value: string) {
	if (!value) {
		return value;
	}

	return value.charAt(0).toUpperCase() + value.slice(1);
}

function trimTrailingPunctuation(value: string) {
	return value.replace(/[.\s]+$/g, "").trim();
}

function asSentence(value: string) {
	const trimmedValue = trimTrailingPunctuation(value);
	if (!trimmedValue) {
		return "";
	}

	return `${sentenceCase(trimmedValue)}.`;
}

function formatSentenceList(values: string[]) {
	return values.filter(Boolean).join(" ");
}

function isPlaceholderReference(value: string) {
	return /example\.com/i.test(value) || /your-domain-here/i.test(value);
}

function getAccentDescription(preset: ResolvedPresetDesignSystem) {
	return preset.presetConfig.theme === "neutral"
		? "an ink-like neutral accent"
		: `${preset.themeLabel.toLowerCase()} accents`;
}

function normalizeDesignReferences(value: readonly string[] | undefined) {
	return normalizeTextList(value).filter(
		(reference) => !isPlaceholderReference(reference),
	);
}

function buildOverview(facts: CanonicalProjectFactsDraft) {
	const primaryUser = cleanFragment(facts.primary_user) || "the primary user";
	const productName = trimText(facts.product_name) || "This product";
	const problemStatement = cleanFragment(facts.problem_statement);
	const successLooksLike = cleanFragment(facts.success_looks_like);

	return formatSentenceList([
		asSentence(`${productName} is built for ${primaryUser.toLowerCase()}`),
		problemStatement
			? asSentence(`They come here because ${problemStatement.toLowerCase()}`)
			: "",
		successLooksLike
			? asSentence(`Success looks like ${successLooksLike.toLowerCase()}`)
			: "",
	]);
}

function buildUsersSummary(facts: CanonicalProjectFactsDraft) {
	const primaryUser = cleanFragment(facts.primary_user) || "The primary user";

	return asSentence(primaryUser);
}

function deriveCopyTone(styleId: string) {
	if (styleId === "maia") {
		return "Confident, polished, and specific.";
	}

	if (styleId === "lyra" || styleId === "mira") {
		return "Direct, concise, and utility-first.";
	}

	return "Direct, practical, and product-led.";
}

function buildBrandPersonality(
	facts: CanonicalProjectFactsDraft,
	preset: ResolvedPresetDesignSystem,
) {
	const copyTone = trimText(facts.copy_tone) || deriveCopyTone(preset.style.id);
	const primaryUser = cleanFragment(facts.primary_user) || "the intended user";

	return formatSentenceList([
		asSentence(copyTone),
		asSentence(
			`The interface should feel ${preset.style.personality} for ${primaryUser.toLowerCase()}, not generic or ornamental`,
		),
	]);
}

function buildVisualThemeAndAtmosphere(
	facts: CanonicalProjectFactsDraft,
	preset: ResolvedPresetDesignSystem,
) {
	const productName = trimText(facts.product_name) || "The product";
	const neutralDescriptor =
		preset.presetConfig.baseColor === "neutral"
			? "a neutral surface system"
			: `${preset.baseColorLabel.toLowerCase()}-tinted neutrals`;

	return formatSentenceList([
		asSentence(
			`${productName} should use ${preset.font.label} typography, ${preset.geometry.radiusLabel.toLowerCase()} corners, ${neutralDescriptor}, and ${getAccentDescription(preset)}`,
		),
		asSentence(
			`Favor ${preset.style.surfaceStyle} and ${preset.style.layoutStyle}`,
		),
	]);
}

function buildDesignPrinciples(
	facts: CanonicalProjectFactsDraft,
	preset: ResolvedPresetDesignSystem,
) {
	const primaryUser = cleanFragment(facts.primary_user) || "the primary user";

	return [
		`Use semantic theme tokens before hard-coded colors. The ${preset.themeLabel.toLowerCase()} accent should mark the most important action, not decorative chrome.`,
		preset.presetConfig.theme === "neutral"
			? "Treat the accent like ink. Use it sparingly for decisive actions and active states."
			: "",
		`Let ${preset.font.label} typography and spacing carry hierarchy before adding extra containers or effects.`,
		"Keep surfaces restrained and structural. Avoid visual noise that makes the interface feel like a generic AI template.",
		`Preserve responsive clarity for ${primaryUser}. Do not hide key actions or amputate mobile behavior.`,
	].filter(Boolean);
}

function buildComponentStylings(preset: ResolvedPresetDesignSystem) {
	const sidebarTreatment =
		preset.sidebar.menuColor === "inverted" ||
		preset.sidebar.menuColor === "inverted-translucent"
			? "a contrasted sidebar that intentionally separates navigation from the main canvas"
			: "a sidebar that stays close to the main surface palette";
	const sidebarAccent =
		preset.sidebar.menuAccent === "bold"
			? "Use strong active states in the sidebar."
			: "Keep sidebar active states quiet and supportive.";

	return {
		buttons:
			"Primary buttons should spend the accent color on the single clearest action in a view. Secondary actions should rely on outline or muted surfaces.",
		cards:
			"Cards should feel restrained and structural rather than ornamental. Avoid stacking cards inside cards unless hierarchy truly needs the extra layer.",
		inputs:
			"Inputs should use semantic border, input, and ring tokens with low-noise surfaces and clear focus treatment.",
		sidebar: `${sentenceCase(sidebarTreatment)}. ${sidebarAccent}`,
	};
}

function buildLayoutPrinciples(
	facts: CanonicalProjectFactsDraft,
	preset: ResolvedPresetDesignSystem,
) {
	const coreFlow = normalizeTextList(facts.core_flow);

	return [
		`Favor ${preset.style.layoutStyle}. Keep the primary action visually obvious before secondary controls or support copy.`,
		coreFlow.length > 0
			? `Let the interface make the core flow legible: ${coreFlow.join(" -> ")}.`
			: "Let the interface make the core workflow legible from the first screen.",
		"Use spacing rhythm and section structure to guide the eye. Do not rely on repeated card grids or centered everything.",
	];
}

function buildResponsiveBehavior() {
	return [
		"Keep the primary action obvious on smaller screens and preserve the same semantic hierarchy across breakpoints.",
		"Adapt layouts by simplifying composition, not by hiding critical functionality or collapsing key states.",
	];
}

function buildMotionNotes(preset: ResolvedPresetDesignSystem) {
	const firstNote =
		preset.style.id === "maia"
			? "Use subtle transitions that reinforce premium polish without turning routine UI into spectacle."
			: "Use restrained motion for state changes and feedback. Motion should clarify, not distract.";

	return [
		firstNote,
		"Avoid bounce, elastic easing, and decorative glow effects. Prefer quick, calm transitions driven by transform and opacity.",
		"Keep motion safe on smaller screens. Never hide or delay critical actions behind animation.",
	];
}

function buildDos() {
	return [
		"Use semantic tokens before hard-coded values.",
		"Make one action clearly primary per screen.",
		"Let spacing and typography create hierarchy before adding more chrome.",
	];
}

function buildDonts() {
	return [
		"Do not lean on overused starter aesthetics such as cards-on-cards, identical feature grids, or decorative gradient headlines.",
		"Do not stack cards inside cards unless hierarchy truly needs it.",
		"Do not use decorative gradient text or dark-mode glow aesthetics as a shortcut for design.",
		"Do not center everything by default when left alignment would improve scanability.",
		"Do not hide critical functionality on mobile or treat mobile as a reduced interface.",
	];
}

function buildAgentPromptGuide(designSystem: GeneratedDesignSystem) {
	return [
		`Use ${designSystem.preset.font.label} as the primary UI font and keep the base radius at ${designSystem.preset.geometry.base}.`,
		`Build from semantic tokens such as \`background\`, \`foreground\`, \`primary\`, \`border\`, and \`sidebar-*\` before reaching for hard-coded values.`,
		"Keep DESIGN.md and the generated runtime design config in sync when you intentionally change the visual system.",
	];
}

function deriveVisualThesis(
	facts: CanonicalProjectFactsDraft,
	preset: ResolvedPresetDesignSystem,
) {
	return `${trimText(facts.product_name) || "The product"} should feel ${preset.style.personality}, using ${preset.font.label} typography, ${preset.geometry.radiusLabel.toLowerCase()} corners, and ${preset.themeLabel.toLowerCase()} accents to guide the primary action.`;
}

function deriveContentPlan(facts: CanonicalProjectFactsDraft) {
	const promise =
		trimText(facts.outcome_statement) ||
		trimText(facts.success_looks_like) ||
		trimText(facts.product_summary);

	if (!promise) {
		return "Lead with the core promise, keep the primary workflow obvious, and let supporting detail stay subordinate to the main action.";
	}

	return `Lead with ${promise.toLowerCase()}, make the primary workflow legible immediately, and keep supporting detail subordinate to the main action.`;
}

function deriveInteractionThesis(preset: ResolvedPresetDesignSystem) {
	if (preset.style.id === "maia") {
		return "Use calm, premium state changes and direct feedback that make the interface feel polished without slowing it down.";
	}

	if (preset.style.id === "lyra" || preset.style.id === "mira") {
		return "Favor quick, low-noise feedback and direct interactions that keep the interface efficient and calm.";
	}

	return "Favor crisp hover, focus, and state transitions that reinforce hierarchy without turning routine interactions into performance pieces.";
}

function deriveDesignTokens(preset: ResolvedPresetDesignSystem) {
	return `${preset.baseColorLabel} neutral surfaces with ${preset.themeLabel.toLowerCase()} accents, ${preset.font.label} typography, and ${preset.geometry.radiusLabel.toLowerCase()} corners.`;
}

function deriveTypographyDirection(preset: ResolvedPresetDesignSystem) {
	return `${preset.font.label} carries the primary interface typography. Keep hierarchy clear through consistent weights and sizes before introducing extra type families.`;
}

function deriveImageryDirection(facts: CanonicalProjectFactsDraft) {
	if (normalizeTextList(facts.design_references).length > 0) {
		return "Use the provided references as the visual anchor. Favor product-relevant imagery and avoid decorative filler visuals.";
	}

	return "Favor product-relevant visuals and restrained supporting graphics over generic stock scenes or decorative gradients.";
}

function deriveLayoutDirection(preset: ResolvedPresetDesignSystem) {
	return `Use ${preset.style.layoutStyle}. Let the primary action and the core workflow read clearly before secondary content.`;
}

function deriveExistingSystemMode(facts: CanonicalProjectFactsDraft) {
	return normalizeTextList(facts.design_references).length > 0
		? "reference-driven"
		: "preset-driven";
}

export function buildGeneratedDesignSystem(
	facts: CanonicalProjectFactsDraft,
): GeneratedDesignSystem {
	const preset = resolvePresetDesignSystem(
		trimText(facts.theme_preset) || "a0",
	);
	const copyTone = trimText(facts.copy_tone) || deriveCopyTone(preset.style.id);
	const overview = buildOverview(facts);
	const users = buildUsersSummary(facts);
	const brandPersonality = buildBrandPersonality(facts, preset);
	const visualThemeAndAtmosphere = buildVisualThemeAndAtmosphere(facts, preset);
	const designPrinciples = buildDesignPrinciples(facts, preset);
	const componentStylings = buildComponentStylings(preset);
	const layoutPrinciples = buildLayoutPrinciples(facts, preset);
	const motionNotes = buildMotionNotes(preset);
	const dos = buildDos();
	const donts = buildDonts();

	const generatedDesignSystem: GeneratedDesignSystem = {
		productName: trimText(facts.product_name) || "Generated Product",
		preset,
		overview,
		users,
		brandPersonality,
		visualThemeAndAtmosphere,
		designPrinciples,
		componentStylings,
		layoutPrinciples,
		responsiveBehavior: buildResponsiveBehavior(),
		motionNotes,
		dos,
		donts,
		agentPromptGuide: [],
		derivedFacts: {
			visualThesis:
				trimText(facts.visual_thesis) || deriveVisualThesis(facts, preset),
			contentPlan: trimText(facts.content_plan) || deriveContentPlan(facts),
			interactionThesis:
				trimText(facts.interaction_thesis) || deriveInteractionThesis(preset),
			designTokens: trimText(facts.design_tokens) || deriveDesignTokens(preset),
			typographyDirection:
				trimText(facts.typography_direction) ||
				deriveTypographyDirection(preset),
			imageryDirection:
				trimText(facts.imagery_direction) || deriveImageryDirection(facts),
			layoutDirection:
				trimText(facts.layout_direction) || deriveLayoutDirection(preset),
			existingSystemMode:
				trimText(facts.existing_system_mode) || deriveExistingSystemMode(facts),
			copyTone,
		},
		designReferences: normalizeDesignReferences(facts.design_references),
	};

	generatedDesignSystem.agentPromptGuide = buildAgentPromptGuide(
		generatedDesignSystem,
	);

	return generatedDesignSystem;
}

function renderTokenLine(
	label: string,
	lightToken: string,
	darkToken: string,
	role: string,
) {
	return `- **${label}**: light \`${lightToken}\`, dark \`${darkToken}\` - ${role}`;
}

export function renderGeneratedDesignMarkdown(
	designSystem: GeneratedDesignSystem,
) {
	const tokenLines = [
		renderTokenLine(
			"Background",
			designSystem.preset.tokens.light["--background"],
			designSystem.preset.tokens.dark["--background"],
			"Main canvas",
		),
		renderTokenLine(
			"Foreground",
			designSystem.preset.tokens.light["--foreground"],
			designSystem.preset.tokens.dark["--foreground"],
			"Primary text and high-contrast marks",
		),
		renderTokenLine(
			"Primary",
			designSystem.preset.tokens.light["--primary"],
			designSystem.preset.tokens.dark["--primary"],
			"Primary actions and selected states",
		),
		renderTokenLine(
			"Border",
			designSystem.preset.tokens.light["--border"],
			designSystem.preset.tokens.dark["--border"],
			"Dividers and quiet structure",
		),
		renderTokenLine(
			"Sidebar",
			designSystem.preset.tokens.light["--sidebar"],
			designSystem.preset.tokens.dark["--sidebar"],
			"Navigation surfaces",
		),
	];
	const lines = [
		"# Design System",
		"",
		"## Overview",
		"",
		designSystem.overview,
		"",
		"## Users",
		"",
		designSystem.users,
		"",
		"## Brand Personality",
		"",
		designSystem.brandPersonality,
		"",
		"## Visual Theme & Atmosphere",
		"",
		designSystem.visualThemeAndAtmosphere,
		"",
		"## Design Principles",
		"",
		...designSystem.designPrinciples.map((principle) => `- ${principle}`),
		"",
		"## Color Palette & Roles",
		"",
		`- **Theme accent**: ${designSystem.preset.themeLabel} (\`${designSystem.preset.themeHex}\`)`,
		`- **Base neutral**: ${designSystem.preset.baseColorLabel}`,
		...tokenLines,
		"",
		"## Typography Rules",
		"",
		`- **Primary font**: ${designSystem.preset.font.label}`,
		`- **Font stack**: \`${designSystem.preset.font.cssFamily}\``,
		`- **Direction**: ${designSystem.derivedFacts.typographyDirection}`,
		"",
		"## Geometry / Corners / Shape Language",
		"",
		`- **Radius profile**: ${designSystem.preset.geometry.radiusLabel}`,
		`- **Base radius**: \`${designSystem.preset.geometry.base}\``,
		`- **Derived scale**: sm \`${designSystem.preset.geometry.sm}\`, md \`${designSystem.preset.geometry.md}\`, lg \`${designSystem.preset.geometry.lg}\`, xl \`${designSystem.preset.geometry.xl}\``,
		"",
		"## Depth & Elevation",
		"",
		`- **Style**: ${designSystem.preset.style.label}`,
		`- **Surface treatment**: ${designSystem.preset.style.surfaceStyle}`,
		`- **Shadow**: \`${designSystem.preset.style.shadow}\``,
		`- **Border width**: \`${designSystem.preset.style.borderWidth}\``,
		"",
		"## Component Stylings",
		"",
		`- **Buttons**: ${designSystem.componentStylings.buttons}`,
		`- **Cards**: ${designSystem.componentStylings.cards}`,
		`- **Inputs**: ${designSystem.componentStylings.inputs}`,
		`- **Sidebar**: ${designSystem.componentStylings.sidebar}`,
		"",
		"## Layout Principles",
		"",
		...designSystem.layoutPrinciples.map((principle) => `- ${principle}`),
		"",
		"## Responsive Behavior",
		"",
		...designSystem.responsiveBehavior.map((item) => `- ${item}`),
		"",
		"## Motion / Interaction Notes",
		"",
		...designSystem.motionNotes.map((note) => `- ${note}`),
		"",
		"## Do's and Don'ts",
		"",
		"### Do",
		"",
		...designSystem.dos.map((item) => `- ${item}`),
		"",
		"### Don't",
		"",
		...designSystem.donts.map((item) => `- ${item}`),
		"",
		"## Agent Prompt Guide",
		"",
		...designSystem.agentPromptGuide.map((item) => `- ${item}`),
	];

	if (designSystem.designReferences.length > 0) {
		lines.push(
			"",
			"## References",
			"",
			...designSystem.designReferences.map((reference) => `- ${reference}`),
		);
	}

	return lines.join("\n");
}
