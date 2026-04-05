import type { PresetConfig } from "shadcn/preset";

// ---------------------------------------------------------------------------
// Theme accent → oklch primary (light mode)
// Based on Tailwind CSS v4 oklch palette values.
// ---------------------------------------------------------------------------

const THEME_PRIMARY_OKLCH: Record<string, string> = {
	neutral: "oklch(0.205 0 0)",
	stone: "oklch(0.216 0.006 56.043)",
	zinc: "oklch(0.228 0.006 285.938)",
	gray: "oklch(0.21 0.006 285.885)",
	amber: "oklch(0.666 0.179 58.318)",
	blue: "oklch(0.546 0.245 262.881)",
	cyan: "oklch(0.609 0.126 221.723)",
	emerald: "oklch(0.596 0.145 163.225)",
	fuchsia: "oklch(0.591 0.293 322.896)",
	green: "oklch(0.627 0.194 149.214)",
	indigo: "oklch(0.511 0.262 276.966)",
	lime: "oklch(0.648 0.2 131.684)",
	orange: "oklch(0.646 0.222 41.116)",
	pink: "oklch(0.592 0.249 0.584)",
	purple: "oklch(0.553 0.261 293.541)",
	red: "oklch(0.577 0.245 27.325)",
	rose: "oklch(0.588 0.241 17.723)",
	sky: "oklch(0.585 0.163 237.618)",
	teal: "oklch(0.6 0.13 184.704)",
	violet: "oklch(0.541 0.281 293.009)",
	yellow: "oklch(0.681 0.162 75.834)",
	mauve: "oklch(0.541 0.15 293)",
	olive: "oklch(0.55 0.08 140)",
	mist: "oklch(0.55 0.05 240)",
	taupe: "oklch(0.5 0.02 60)",
};

const LIGHT_PRIMARY_WITH_DARK_FG = new Set(["yellow", "lime"]);

function getThemeAccentTokens(theme: string): Record<string, string> {
	const primary = THEME_PRIMARY_OKLCH[theme] ?? THEME_PRIMARY_OKLCH.neutral;
	const fg = LIGHT_PRIMARY_WITH_DARK_FG.has(theme)
		? "oklch(0.205 0 0)"
		: "oklch(0.985 0 0)";

	return {
		"--primary": primary,
		"--primary-foreground": fg,
		"--ring": primary,
		"--sidebar-primary": primary,
		"--sidebar-primary-foreground": fg,
		"--sidebar-ring": primary,
	};
}

// ---------------------------------------------------------------------------
// Base color → neutral surface tokens (light mode)
// Parameterized by hue angle + chroma scale so all 8 bases share structure.
// ---------------------------------------------------------------------------

type BaseSpec = { hue: number; chroma: number };

const BASE_SPECS: Record<string, BaseSpec> = {
	neutral: { hue: 0, chroma: 0 },
	stone: { hue: 56, chroma: 0.006 },
	zinc: { hue: 286, chroma: 0.006 },
	gray: { hue: 264, chroma: 0.007 },
	mauve: { hue: 293, chroma: 0.01 },
	olive: { hue: 140, chroma: 0.008 },
	mist: { hue: 230, chroma: 0.008 },
	taupe: { hue: 56, chroma: 0.005 },
};

function oklch(l: number, c: number, h: number): string {
	if (c < 0.001) return `oklch(${l} 0 0)`;
	return `oklch(${l} ${c.toFixed(4)} ${h})`;
}

function getBaseColorTokens(baseColor: string): Record<string, string> {
	const { hue: h, chroma: c } = BASE_SPECS[baseColor] ?? BASE_SPECS.neutral;

	return {
		"--background": oklch(0.99, c * 0.05, h),
		"--foreground": oklch(0.145, c, h),
		"--card": oklch(0.99, c * 0.05, h),
		"--card-foreground": oklch(0.145, c, h),
		"--popover": oklch(0.99, c * 0.05, h),
		"--popover-foreground": oklch(0.145, c, h),
		"--secondary": oklch(0.97, c * 0.15, h),
		"--secondary-foreground": oklch(0.205, c, h),
		"--muted": oklch(0.97, c * 0.15, h),
		"--muted-foreground": oklch(0.556, c * 0.3, h),
		"--accent": oklch(0.97, c * 0.15, h),
		"--accent-foreground": oklch(0.205, c, h),
		"--destructive": "oklch(0.577 0.245 27.325)",
		"--destructive-foreground": "oklch(0.985 0 0)",
		"--border": oklch(0.922, c * 0.2, h),
		"--input": oklch(0.922, c * 0.2, h),
	};
}

// ---------------------------------------------------------------------------
// Sidebar tokens from menuColor + menuAccent
// ---------------------------------------------------------------------------

function getSidebarTokens(
	config: Pick<PresetConfig, "menuColor" | "menuAccent" | "baseColor">,
): Record<string, string> {
	const { hue: h, chroma: c } =
		BASE_SPECS[config.baseColor] ?? BASE_SPECS.neutral;
	const isInverted =
		config.menuColor === "inverted" ||
		config.menuColor === "inverted-translucent";
	const isTranslucent =
		config.menuColor === "default-translucent" ||
		config.menuColor === "inverted-translucent";

	if (isInverted) {
		const bg = isTranslucent ? "oklch(0.145 0 0 / 85%)" : oklch(0.145, c, h);
		return {
			"--sidebar": bg,
			"--sidebar-foreground": "oklch(0.985 0 0)",
			"--sidebar-accent": "oklch(0.269 0 0)",
			"--sidebar-accent-foreground": "oklch(0.985 0 0)",
			"--sidebar-border": "oklch(0.99 0 0 / 10%)",
		};
	}

	const bg = isTranslucent
		? "oklch(0.985 0 0 / 85%)"
		: oklch(0.985, c * 0.05, h);
	return {
		"--sidebar": bg,
		"--sidebar-foreground": oklch(0.145, c, h),
		"--sidebar-accent": oklch(0.97, c * 0.15, h),
		"--sidebar-accent-foreground": oklch(0.205, c, h),
		"--sidebar-border": oklch(0.922, c * 0.2, h),
	};
}

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

const RADIUS_REM: Record<string, string> = {
	none: "0rem",
	small: "0.3rem",
	medium: "0.5rem",
	default: "0.625rem",
	large: "0.875rem",
};

// ---------------------------------------------------------------------------
// Style treatments
// Style adjustments are represented as CSS custom properties so the preview
// can vary shadow depth, border weight, and density per style.
// ---------------------------------------------------------------------------

type StyleMeta = {
	shadow: string;
	borderWidth: string;
	gap: string;
};

const STYLE_META: Record<string, StyleMeta> = {
	nova: {
		shadow: "0 1px 2px oklch(0 0 0 / 5%)",
		borderWidth: "1px",
		gap: "0.75rem",
	},
	vega: {
		shadow: "0 1px 3px oklch(0 0 0 / 8%)",
		borderWidth: "1px",
		gap: "0.75rem",
	},
	maia: {
		shadow: "0 2px 8px oklch(0 0 0 / 6%)",
		borderWidth: "1px",
		gap: "1rem",
	},
	lyra: { shadow: "none", borderWidth: "1px", gap: "0.5rem" },
	mira: { shadow: "none", borderWidth: "0px", gap: "0.75rem" },
};

// ---------------------------------------------------------------------------
// Font family map
// ---------------------------------------------------------------------------

type FontEntry = {
	family: string;
	googleParam: string;
	fallback: string;
};

const FONT_ENTRIES: Record<string, FontEntry> = {
	inter: {
		family: "Inter",
		googleParam: "Inter:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	"noto-sans": {
		family: "Noto Sans",
		googleParam: "Noto+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	"nunito-sans": {
		family: "Nunito Sans",
		googleParam: "Nunito+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	figtree: {
		family: "Figtree",
		googleParam: "Figtree:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	roboto: {
		family: "Roboto",
		googleParam: "Roboto:wght@400;500;700",
		fallback: "sans-serif",
	},
	raleway: {
		family: "Raleway",
		googleParam: "Raleway:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	"dm-sans": {
		family: "DM Sans",
		googleParam: "DM+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	"public-sans": {
		family: "Public Sans",
		googleParam: "Public+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	outfit: {
		family: "Outfit",
		googleParam: "Outfit:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	"jetbrains-mono": {
		family: "JetBrains Mono",
		googleParam: "JetBrains+Mono:wght@400;500;600;700",
		fallback: "monospace",
	},
	geist: {
		family: "Geist",
		googleParam: "Geist:wght@400;500;600;700",
		fallback: "sans-serif",
	},
	"geist-mono": {
		family: "Geist Mono",
		googleParam: "Geist+Mono:wght@400;500;600;700",
		fallback: "monospace",
	},
	lora: {
		family: "Lora",
		googleParam: "Lora:wght@400;500;600;700",
		fallback: "serif",
	},
	merriweather: {
		family: "Merriweather",
		googleParam: "Merriweather:wght@400;700",
		fallback: "serif",
	},
	"playfair-display": {
		family: "Playfair Display",
		googleParam: "Playfair+Display:wght@400;500;600;700",
		fallback: "serif",
	},
	"noto-serif": {
		family: "Noto Serif",
		googleParam: "Noto+Serif:wght@400;500;600;700",
		fallback: "serif",
	},
	"roboto-slab": {
		family: "Roboto Slab",
		googleParam: "Roboto+Slab:wght@400;500;600;700",
		fallback: "serif",
	},
};

export function getPreviewFontFamily(font: string): string {
	const entry = FONT_ENTRIES[font];
	if (!entry) return "ui-sans-serif, system-ui, sans-serif";
	return `'${entry.family}', ${entry.fallback}`;
}

export function getGoogleFontsUrl(font: string): string | null {
	const entry = FONT_ENTRIES[font];
	if (!entry) return null;
	return `https://fonts.googleapis.com/css2?family=${entry.googleParam}&display=swap`;
}

// ---------------------------------------------------------------------------
// Compose all CSS custom properties for the preview container
// ---------------------------------------------------------------------------

export function buildPreviewCssVars(config: PresetConfig): React.CSSProperties {
	const radius = RADIUS_REM[config.radius] ?? RADIUS_REM.default;
	const style = STYLE_META[config.style] ?? STYLE_META.nova;

	const vars: Record<string, string> = {
		...getBaseColorTokens(config.baseColor),
		...getThemeAccentTokens(config.theme),
		...getSidebarTokens(config),
		"--radius": radius,
		"--preview-shadow": style.shadow,
		"--preview-border-w": style.borderWidth,
		"--preview-gap": style.gap,
		fontFamily: getPreviewFontFamily(config.font),
	};

	return vars as unknown as React.CSSProperties;
}

export { STYLE_META };
export type { StyleMeta };
