import {
	DEFAULT_PRESET_CONFIG,
	encodePreset,
	type PresetConfig,
} from "shadcn/preset";
import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "../canonical-project-definition/schema";

const DESIGN_PRESET_NARRATIVE_KEYS = [
	"visual_thesis",
	"content_plan",
	"interaction_thesis",
	"design_tokens",
	"typography_direction",
	"imagery_direction",
	"layout_direction",
	"existing_system_mode",
	"copy_tone",
] as const satisfies readonly CanonicalProjectFactKey[];

type DesignPresetNarrativeKey = (typeof DESIGN_PRESET_NARRATIVE_KEYS)[number];

export const designPresetDerivedFactKeys = [
	...DESIGN_PRESET_NARRATIVE_KEYS,
] as const satisfies readonly CanonicalProjectFactKey[];

export type DesignPresetDefinition = {
	id: string;
	label: string;
	summary: string;
	category: string;
	presetCode: string;
	previewPageUrl: string;
	rawDesignMdUrl: string;
	previewImagePath: string;
	logoPath: string;
	designReferences: readonly string[];
	narrativeOverrides?: Partial<
		Pick<CanonicalProjectFactsDraft, DesignPresetNarrativeKey>
	>;
};

function createPresetCode(overrides: Partial<PresetConfig>) {
	return encodePreset({
		...DEFAULT_PRESET_CONFIG,
		...overrides,
	});
}

export const designPresetDefinitions = [
	{
		id: "t3-code",
		label: "T3 Code",
		summary: "Dense product UI with DM Sans, zinc surfaces, and blue actions.",
		category: "Software",
		presetCode: createPresetCode({
			theme: "blue",
			style: "mira",
			font: "dm-sans",
			radius: "default",
			baseColor: "zinc",
		}),
		previewPageUrl:
			"/docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md",
		rawDesignMdUrl:
			"/docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md",
		previewImagePath: "/codebase/design-presets/previews/t3-code.svg",
		logoPath: "/codebase/design-presets/logos/t3-code.svg",
		designReferences: [
			"apps/web/src/app/globals.css",
			"apps/web/src/components/ui",
		],
		narrativeOverrides: {
			copy_tone: "Direct, compact, product-grade, and implementation-focused.",
			typography_direction:
				"Use DM Sans for primary UI typography and system monospace only for code, values, and command text.",
			layout_direction:
				"Favor dense app-like sections, compact controls, quiet borders, and clear left-aligned hierarchy over editorial or decorative layouts.",
			design_tokens:
				"Zinc semantic surfaces, blue primary actions, additive T3 Code radii, and light/dark tokens inherited from the app shell.",
			interaction_thesis:
				"Favor quick, low-noise feedback and direct interactions that keep the interface efficient and calm.",
		},
	},
	{
		id: "vercel",
		label: "Vercel",
		summary: "Black-and-white precision with Geist typography.",
		category: "Hosting",
		presetCode: createPresetCode({
			theme: "neutral",
			style: "mira",
			font: "geist",
			radius: "small",
			baseColor: "neutral",
		}),
		previewPageUrl: "https://getdesign.md/vercel/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/vercel/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/vercel.png",
		logoPath: "/codebase/design-presets/logos/vercel.svg",
		designReferences: ["https://getdesign.md/vercel/design-md"],
		narrativeOverrides: {
			copy_tone: "Precise, restrained, and infrastructure-grade.",
		},
	},
	{
		id: "linear",
		label: "Linear",
		summary: "Low-noise dark precision with a disciplined purple accent.",
		category: "Software",
		presetCode: createPresetCode({
			theme: "purple",
			style: "lyra",
			font: "inter",
			radius: "medium",
			baseColor: "zinc",
		}),
		previewPageUrl: "https://getdesign.md/linear.app/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/linear.app/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/linear.png",
		logoPath: "/codebase/design-presets/logos/linear.svg",
		designReferences: ["https://getdesign.md/linear.app/design-md"],
		narrativeOverrides: {
			copy_tone: "Calm, precise, and quietly opinionated.",
		},
	},
	{
		id: "notion",
		label: "Notion",
		summary: "Warm editorial minimalism with softer surfaces and calm pacing.",
		category: "Software",
		presetCode: createPresetCode({
			theme: "stone",
			style: "nova",
			font: "noto-serif",
			radius: "small",
			baseColor: "stone",
		}),
		previewPageUrl: "https://getdesign.md/notion/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/notion/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/notion.png",
		logoPath: "/codebase/design-presets/logos/notion.svg",
		designReferences: ["https://getdesign.md/notion/design-md"],
		narrativeOverrides: {
			copy_tone: "Warm, editorial, and intentionally understated.",
		},
	},
	{
		id: "stripe",
		label: "Stripe",
		summary:
			"Premium product marketing with crisp gradients and elegant structure.",
		category: "Payment",
		presetCode: createPresetCode({
			theme: "violet",
			style: "maia",
			font: "inter",
			radius: "large",
			baseColor: "mist",
			menuAccent: "bold",
		}),
		previewPageUrl: "https://getdesign.md/stripe/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/stripe/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/stripe.png",
		logoPath: "/codebase/design-presets/logos/stripe.svg",
		designReferences: ["https://getdesign.md/stripe/design-md"],
		narrativeOverrides: {
			copy_tone: "Polished, high-trust, and technically fluent.",
		},
	},
	{
		id: "supabase",
		label: "Supabase",
		summary: "Emerald-accented developer tooling with code-first confidence.",
		category: "Database",
		presetCode: createPresetCode({
			theme: "emerald",
			style: "vega",
			font: "geist",
			radius: "medium",
			baseColor: "neutral",
			menuAccent: "bold",
		}),
		previewPageUrl: "https://getdesign.md/supabase/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/supabase/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/supabase.png",
		logoPath: "/codebase/design-presets/logos/supabase.svg",
		designReferences: ["https://getdesign.md/supabase/design-md"],
		narrativeOverrides: {
			copy_tone: "Developer-first, direct, and confident.",
		},
	},
	{
		id: "framer",
		label: "Framer",
		summary: "Bold blue design energy with motion-forward surfaces.",
		category: "Software",
		presetCode: createPresetCode({
			theme: "blue",
			style: "maia",
			font: "figtree",
			radius: "large",
			baseColor: "zinc",
			menuAccent: "bold",
		}),
		previewPageUrl: "https://getdesign.md/framer/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/framer/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/framer.png",
		logoPath: "/codebase/design-presets/logos/framer.svg",
		designReferences: ["https://getdesign.md/framer/design-md"],
		narrativeOverrides: {
			copy_tone: "Expressive, design-led, and high-tempo.",
		},
	},
	{
		id: "raycast",
		label: "Raycast",
		summary:
			"Dark utility chrome with bright accent energy and compact rhythm.",
		category: "Software",
		presetCode: createPresetCode({
			theme: "orange",
			style: "vega",
			font: "geist",
			radius: "medium",
			baseColor: "zinc",
			menuAccent: "bold",
			menuColor: "inverted",
		}),
		previewPageUrl: "https://getdesign.md/raycast/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/raycast/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/raycast.png",
		logoPath: "/codebase/design-presets/logos/raycast.svg",
		designReferences: ["https://getdesign.md/raycast/design-md"],
		narrativeOverrides: {
			copy_tone: "Fast, sharp, and productivity-first.",
		},
	},
	{
		id: "cursor",
		label: "Cursor",
		summary:
			"Dark coding-tool UI with a focused green accent and quiet chrome.",
		category: "Software",
		presetCode: createPresetCode({
			theme: "green",
			style: "mira",
			font: "geist",
			radius: "small",
			baseColor: "neutral",
			menuColor: "inverted",
		}),
		previewPageUrl: "https://getdesign.md/cursor/design-md",
		rawDesignMdUrl: "https://getdesign.md/design-md/cursor/DESIGN.md",
		previewImagePath: "/codebase/design-presets/previews/cursor.png",
		logoPath: "/codebase/design-presets/logos/cursor.svg",
		designReferences: ["https://getdesign.md/cursor/design-md"],
		narrativeOverrides: {
			copy_tone: "Tool-like, quiet, and technically direct.",
		},
	},
] as const satisfies readonly DesignPresetDefinition[];

export type DesignPresetId = (typeof designPresetDefinitions)[number]["id"];

export const DEFAULT_DESIGN_PRESET_ID = "t3-code" satisfies DesignPresetId;

const designPresetDefinitionById = new Map(
	designPresetDefinitions.map((preset) => [preset.id, preset]),
);

export function getDesignPresetDefinition(
	presetId: string | undefined | null,
): DesignPresetDefinition | null {
	if (!presetId) {
		return null;
	}

	return designPresetDefinitionById.get(presetId as DesignPresetId) ?? null;
}

export function resolveDesignPresetDefinition(
	presetId: string | undefined | null,
): DesignPresetDefinition {
	const resolvedPreset =
		getDesignPresetDefinition(presetId) ??
		designPresetDefinitionById.get(DEFAULT_DESIGN_PRESET_ID);

	if (!resolvedPreset) {
		throw new Error("Default design preset definition missing");
	}

	return resolvedPreset;
}

export function buildDesignPresetFactSeed(
	presetId: string | undefined | null,
): {
	design_preset_id: string;
	theme_preset: string;
	design_references: string[];
} & Partial<Pick<CanonicalProjectFactsDraft, DesignPresetNarrativeKey>> {
	const preset = resolveDesignPresetDefinition(presetId);

	return {
		design_preset_id: preset.id,
		theme_preset: preset.presetCode,
		design_references: [...preset.designReferences],
		...preset.narrativeOverrides,
	};
}
