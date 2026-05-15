import {
	DEFAULT_PRESET_CONFIG,
	decodePreset,
	type PresetConfig,
} from "shadcn/preset";

export type DesignTokenMap = Record<string, string>;

export type PresetFontMeta = {
	family: string;
	fallback: string;
	googleParam: string;
	label: string;
};

export type PresetStyleMeta = {
	label: string;
	shadow: string;
	borderWidth: string;
	gap: string;
	personality: string;
	surfaceStyle: string;
	layoutStyle: string;
};

export type ResolvedPresetDesignSystem = {
	presetCode: string;
	presetConfig: PresetConfig;
	themeHex: string;
	themeLabel: string;
	baseColorLabel: string;
	font: {
		id: string;
		label: string;
		cssFamily: string;
		googleFontsUrl: string | null;
	};
	geometry: {
		radiusId: string;
		radiusLabel: string;
		base: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
		twoXl: string;
		threeXl: string;
		fourXl: string;
	};
	style: PresetStyleMeta & {
		id: string;
	};
	sidebar: {
		menuColor: PresetConfig["menuColor"];
		menuAccent: PresetConfig["menuAccent"];
	};
	tokens: {
		light: DesignTokenMap;
		dark: DesignTokenMap;
	};
};

const THEME_COLOR_HEX: Record<string, string> = {
	neutral: "#737373",
	stone: "#78716c",
	zinc: "#71717a",
	gray: "#6b7280",
	amber: "#f59e0b",
	blue: "#3b82f6",
	cyan: "#06b6d4",
	emerald: "#10b981",
	fuchsia: "#d946ef",
	green: "#22c55e",
	indigo: "#6366f1",
	lime: "#84cc16",
	orange: "#f97316",
	pink: "#ec4899",
	purple: "#a855f7",
	red: "#ef4444",
	rose: "#f43f5e",
	sky: "#0ea5e9",
	teal: "#14b8a6",
	violet: "#8b5cf6",
	yellow: "#eab308",
	mauve: "#a78bfa",
	olive: "#6b7a3d",
	mist: "#94a3b8",
	taupe: "#a8a29e",
};

const FONT_ENTRIES: Record<string, PresetFontMeta> = {
	inter: {
		family: "Inter",
		googleParam: "Inter:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Inter",
	},
	"noto-sans": {
		family: "Noto Sans",
		googleParam: "Noto+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Noto Sans",
	},
	"nunito-sans": {
		family: "Nunito Sans",
		googleParam: "Nunito+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Nunito Sans",
	},
	figtree: {
		family: "Figtree",
		googleParam: "Figtree:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Figtree",
	},
	roboto: {
		family: "Roboto",
		googleParam: "Roboto:wght@400;500;700",
		fallback: "sans-serif",
		label: "Roboto",
	},
	raleway: {
		family: "Raleway",
		googleParam: "Raleway:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Raleway",
	},
	"dm-sans": {
		family: "DM Sans",
		googleParam: "DM+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "DM Sans",
	},
	"public-sans": {
		family: "Public Sans",
		googleParam: "Public+Sans:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Public Sans",
	},
	outfit: {
		family: "Outfit",
		googleParam: "Outfit:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Outfit",
	},
	"jetbrains-mono": {
		family: "JetBrains Mono",
		googleParam: "JetBrains+Mono:wght@400;500;600;700",
		fallback: "monospace",
		label: "JetBrains Mono",
	},
	geist: {
		family: "Geist",
		googleParam: "Geist:wght@400;500;600;700",
		fallback: "sans-serif",
		label: "Geist",
	},
	"geist-mono": {
		family: "Geist Mono",
		googleParam: "Geist+Mono:wght@400;500;600;700",
		fallback: "monospace",
		label: "Geist Mono",
	},
	lora: {
		family: "Lora",
		googleParam: "Lora:wght@400;500;600;700",
		fallback: "serif",
		label: "Lora",
	},
	merriweather: {
		family: "Merriweather",
		googleParam: "Merriweather:wght@400;700",
		fallback: "serif",
		label: "Merriweather",
	},
	"playfair-display": {
		family: "Playfair Display",
		googleParam: "Playfair+Display:wght@400;500;600;700",
		fallback: "serif",
		label: "Playfair Display",
	},
	"noto-serif": {
		family: "Noto Serif",
		googleParam: "Noto+Serif:wght@400;500;600;700",
		fallback: "serif",
		label: "Noto Serif",
	},
	"roboto-slab": {
		family: "Roboto Slab",
		googleParam: "Roboto+Slab:wght@400;500;600;700",
		fallback: "serif",
		label: "Roboto Slab",
	},
};

type BaseSpec = {
	hue: number;
	chroma: number;
	label: string;
};

const BASE_SPECS: Record<string, BaseSpec> = {
	neutral: { hue: 0, chroma: 0, label: "Neutral" },
	stone: { hue: 56, chroma: 0.006, label: "Stone" },
	zinc: { hue: 286, chroma: 0.006, label: "Zinc" },
	gray: { hue: 264, chroma: 0.007, label: "Gray" },
	mauve: { hue: 293, chroma: 0.01, label: "Mauve" },
	olive: { hue: 140, chroma: 0.008, label: "Olive" },
	mist: { hue: 230, chroma: 0.008, label: "Mist" },
	taupe: { hue: 56, chroma: 0.005, label: "Taupe" },
};

const RADIUS_REM: Record<string, string> = {
	none: "0rem",
	small: "0.3rem",
	medium: "0.5rem",
	default: "0.625rem",
	large: "0.875rem",
};

const RADIUS_LABELS: Record<string, string> = {
	none: "Sharp",
	small: "Tight",
	medium: "Compact",
	default: "Balanced",
	large: "Soft",
};

const STYLE_META: Record<string, PresetStyleMeta> = {
	nova: {
		label: "Nova",
		shadow: "0 1px 2px oklch(0 0 0 / 5%)",
		borderWidth: "1px",
		gap: "0.75rem",
		personality: "clean, modern, and balanced",
		surfaceStyle: "quiet surfaces with light framing",
		layoutStyle: "structured spacing with a calm visual rhythm",
	},
	vega: {
		label: "Vega",
		shadow: "0 1px 3px oklch(0 0 0 / 8%)",
		borderWidth: "1px",
		gap: "0.75rem",
		personality: "crisp, practical, and confident",
		surfaceStyle: "clear containers with restrained depth",
		layoutStyle: "direct sections and firm hierarchy",
	},
	maia: {
		label: "Maia",
		shadow: "0 2px 8px oklch(0 0 0 / 6%)",
		borderWidth: "1px",
		gap: "1rem",
		personality: "polished, premium, and spacious",
		surfaceStyle: "soft elevation with room for breathing space",
		layoutStyle: "more generous spacing and calmer pacing",
	},
	lyra: {
		label: "Lyra",
		shadow: "none",
		borderWidth: "1px",
		gap: "0.5rem",
		personality: "minimal, deliberate, and low-noise",
		surfaceStyle: "flat surfaces with thin structure",
		layoutStyle: "compact blocks with strong alignment",
	},
	mira: {
		label: "Mira",
		shadow: "none",
		borderWidth: "0px",
		gap: "0.75rem",
		personality: "spare, utility-first, and highly restrained",
		surfaceStyle: "flat surfaces with almost no ornamental chrome",
		layoutStyle: "lean composition with strong emphasis on content",
	},
};

const LIGHT_PRIMARY_WITH_DARK_FG = new Set(["yellow", "lime"]);

const CHART_TOKENS = {
	light: {
		"--chart-2": "oklch(0.6 0.118 184.704)",
		"--chart-3": "oklch(0.398 0.07 227.392)",
		"--chart-4": "oklch(0.828 0.189 84.429)",
		"--chart-5": "oklch(0.769 0.188 70.08)",
	},
	dark: {
		"--chart-2": "oklch(0.696 0.17 162.48)",
		"--chart-3": "oklch(0.769 0.188 70.08)",
		"--chart-4": "oklch(0.627 0.265 303.9)",
		"--chart-5": "oklch(0.645 0.246 16.439)",
	},
} as const;

function oklch(lightness: number, chroma: number, hue: number) {
	if (chroma < 0.001) {
		return `oklch(${lightness} 0 0)`;
	}

	return `oklch(${lightness} ${chroma.toFixed(4)} ${hue})`;
}

function oklchAlpha(
	lightness: number,
	chroma: number,
	hue: number,
	alphaPercentage: string,
) {
	if (chroma < 0.001) {
		return `oklch(${lightness} 0 0 / ${alphaPercentage})`;
	}

	return `oklch(${lightness} ${chroma.toFixed(4)} ${hue} / ${alphaPercentage})`;
}

function formatLabel(value: string) {
	return value
		.split("-")
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

function getFontEntry(font: string): PresetFontMeta {
	return (
		FONT_ENTRIES[font] ?? {
			family: "Inter",
			googleParam: "Inter:wght@400;500;600;700",
			fallback: "sans-serif",
			label: "Inter",
		}
	);
}

function getStyleMeta(style: string): PresetStyleMeta {
	return STYLE_META[style] ?? STYLE_META.nova;
}

export function getPresetStyleMeta(style: string): PresetStyleMeta {
	return getStyleMeta(style);
}

function getThemeAccentTokens(theme: string, mode: "light" | "dark") {
	const primary = getThemePrimaryOklch(theme, mode);
	const primaryForeground = LIGHT_PRIMARY_WITH_DARK_FG.has(theme)
		? "oklch(0.145 0 0)"
		: "oklch(0.985 0 0)";

	return {
		"--primary": primary,
		"--primary-foreground": primaryForeground,
		"--ring": primary,
		"--chart-1": primary,
		"--sidebar-primary": primary,
		"--sidebar-primary-foreground": primaryForeground,
		"--sidebar-ring": primary,
		...(mode === "light" ? CHART_TOKENS.light : CHART_TOKENS.dark),
	};
}

function getThemePrimaryOklch(theme: string, mode: "light" | "dark") {
	if (theme === "blue") {
		return mode === "dark"
			? "oklch(0.588 0.217 264)"
			: "oklch(0.488 0.217 264)";
	}

	return theme in THEME_COLOR_HEX
		? (THEME_PRIMARY_OKLCH[theme] ?? THEME_PRIMARY_OKLCH.neutral)
		: THEME_PRIMARY_OKLCH.neutral;
}

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

function getBaseColorTokens(
	baseColor: string,
	mode: "light" | "dark",
): DesignTokenMap {
	const { hue, chroma } = BASE_SPECS[baseColor] ?? BASE_SPECS.neutral;

	if (mode === "light") {
		return {
			"--background": oklch(0.99, chroma * 0.05, hue),
			"--foreground": oklch(0.145, chroma, hue),
			"--card": oklch(0.99, chroma * 0.05, hue),
			"--card-foreground": oklch(0.145, chroma, hue),
			"--popover": oklch(0.99, chroma * 0.05, hue),
			"--popover-foreground": oklch(0.145, chroma, hue),
			"--secondary": oklch(0.97, chroma * 0.15, hue),
			"--secondary-foreground": oklch(0.205, chroma, hue),
			"--muted": oklch(0.97, chroma * 0.15, hue),
			"--muted-foreground": oklch(0.556, chroma * 0.3, hue),
			"--accent": oklch(0.97, chroma * 0.15, hue),
			"--accent-foreground": oklch(0.205, chroma, hue),
			"--destructive": "oklch(0.577 0.245 27.325)",
			"--destructive-foreground": "oklch(0.985 0 0)",
			"--border": oklch(0.922, chroma * 0.2, hue),
			"--input": oklch(0.922, chroma * 0.2, hue),
		};
	}

	return {
		"--background": oklch(0.145, chroma * 0.15, hue),
		"--foreground": oklch(0.985, chroma * 0.05, hue),
		"--card": oklch(0.205, chroma * 0.18, hue),
		"--card-foreground": oklch(0.985, chroma * 0.05, hue),
		"--popover": oklch(0.205, chroma * 0.18, hue),
		"--popover-foreground": oklch(0.985, chroma * 0.05, hue),
		"--secondary": oklch(0.269, chroma * 0.18, hue),
		"--secondary-foreground": oklch(0.985, chroma * 0.05, hue),
		"--muted": oklch(0.269, chroma * 0.18, hue),
		"--muted-foreground": oklch(0.708, chroma * 0.28, hue),
		"--accent": oklch(0.269, chroma * 0.18, hue),
		"--accent-foreground": oklch(0.985, chroma * 0.05, hue),
		"--destructive": "oklch(0.704 0.191 22.216)",
		"--destructive-foreground": "oklch(0.985 0 0)",
		"--border": oklchAlpha(0.99, chroma * 0.05, hue, "10%"),
		"--input": oklchAlpha(0.99, chroma * 0.05, hue, "15%"),
	};
}

function getSidebarTokens(
	config: Pick<PresetConfig, "menuColor" | "menuAccent" | "baseColor">,
	mode: "light" | "dark",
): DesignTokenMap {
	const { hue, chroma } = BASE_SPECS[config.baseColor] ?? BASE_SPECS.neutral;
	const isInverted =
		config.menuColor === "inverted" ||
		config.menuColor === "inverted-translucent";
	const isTranslucent =
		config.menuColor === "default-translucent" ||
		config.menuColor === "inverted-translucent";

	if (mode === "light") {
		if (isInverted) {
			const sidebarBackground = isTranslucent
				? "oklch(0.145 0 0 / 85%)"
				: oklch(0.145, chroma, hue);

			return {
				"--sidebar": sidebarBackground,
				"--sidebar-foreground": "oklch(0.985 0 0)",
				"--sidebar-accent": "oklch(0.269 0 0)",
				"--sidebar-accent-foreground": "oklch(0.985 0 0)",
				"--sidebar-border": "oklch(0.99 0 0 / 10%)",
			};
		}

		return {
			"--sidebar": isTranslucent
				? "oklch(0.985 0 0 / 85%)"
				: oklch(0.985, chroma * 0.05, hue),
			"--sidebar-foreground": oklch(0.145, chroma, hue),
			"--sidebar-accent": oklch(0.97, chroma * 0.15, hue),
			"--sidebar-accent-foreground": oklch(0.205, chroma, hue),
			"--sidebar-border": oklch(0.922, chroma * 0.2, hue),
		};
	}

	if (isInverted) {
		return {
			"--sidebar": isTranslucent
				? "oklch(0.985 0 0 / 92%)"
				: oklch(0.985, chroma * 0.05, hue),
			"--sidebar-foreground": oklch(0.145, chroma, hue),
			"--sidebar-accent": oklch(0.97, chroma * 0.15, hue),
			"--sidebar-accent-foreground": oklch(0.205, chroma, hue),
			"--sidebar-border": oklch(0.922, chroma * 0.2, hue),
		};
	}

	return {
		"--sidebar": isTranslucent
			? "oklch(0.205 0 0 / 88%)"
			: oklch(0.205, chroma * 0.18, hue),
		"--sidebar-foreground": oklch(0.985, chroma * 0.05, hue),
		"--sidebar-accent": oklch(0.269, chroma * 0.18, hue),
		"--sidebar-accent-foreground": oklch(0.985, chroma * 0.05, hue),
		"--sidebar-border": oklchAlpha(0.99, chroma * 0.05, hue, "10%"),
	};
}

export function decodePresetSafe(presetCode: string): PresetConfig {
	try {
		const preset = decodePreset(presetCode);
		return preset ?? { ...DEFAULT_PRESET_CONFIG };
	} catch {
		return { ...DEFAULT_PRESET_CONFIG };
	}
}

export function getPresetThemeHex(theme: string) {
	return THEME_COLOR_HEX[theme] ?? THEME_COLOR_HEX.neutral;
}

export function getPresetFontLabel(font: string) {
	return getFontEntry(font).label;
}

export function getPresetFontFamily(font: string) {
	const entry = getFontEntry(font);
	return `'${entry.family}', ${entry.fallback}`;
}

export function getPresetGoogleFontsUrl(font: string) {
	const entry = FONT_ENTRIES[font];
	if (!entry) {
		return null;
	}

	return `https://fonts.googleapis.com/css2?family=${entry.googleParam}&display=swap`;
}

export function buildPresetPreviewCssVars(
	config: PresetConfig,
): Record<string, string> {
	const resolved = resolvePresetDesignSystem("", config);

	return {
		...resolved.tokens.light,
		"--radius": resolved.geometry.base,
		"--preview-shadow": resolved.style.shadow,
		"--preview-border-w": resolved.style.borderWidth,
		"--preview-gap": resolved.style.gap,
		fontFamily: resolved.font.cssFamily,
	};
}

export function resolvePresetDesignSystem(
	presetCode: string,
	explicitConfig?: PresetConfig,
): ResolvedPresetDesignSystem {
	const presetConfig = explicitConfig ?? decodePresetSafe(presetCode);
	const fontEntry = getFontEntry(presetConfig.font);
	const styleMeta = getStyleMeta(presetConfig.style);
	const radiusBase = RADIUS_REM[presetConfig.radius] ?? RADIUS_REM.default;

	return {
		presetCode,
		presetConfig,
		themeHex: getPresetThemeHex(presetConfig.theme),
		themeLabel: formatLabel(presetConfig.theme),
		baseColorLabel:
			BASE_SPECS[presetConfig.baseColor]?.label ??
			formatLabel(presetConfig.baseColor),
		font: {
			id: presetConfig.font,
			label: fontEntry.label,
			cssFamily: `'${fontEntry.family}', ${fontEntry.fallback}`,
			googleFontsUrl: getPresetGoogleFontsUrl(presetConfig.font),
		},
		geometry: {
			radiusId: presetConfig.radius,
			radiusLabel:
				RADIUS_LABELS[presetConfig.radius] ?? formatLabel(presetConfig.radius),
			base: radiusBase,
			sm: `calc(${radiusBase} * 0.6)`,
			md: `calc(${radiusBase} * 0.8)`,
			lg: radiusBase,
			xl: `calc(${radiusBase} * 1.4)`,
			twoXl: `calc(${radiusBase} * 1.8)`,
			threeXl: `calc(${radiusBase} * 2.2)`,
			fourXl: `calc(${radiusBase} * 2.6)`,
		},
		style: {
			id: presetConfig.style,
			...styleMeta,
		},
		sidebar: {
			menuColor: presetConfig.menuColor,
			menuAccent: presetConfig.menuAccent,
		},
		tokens: {
			light: {
				...getBaseColorTokens(presetConfig.baseColor, "light"),
				...getThemeAccentTokens(presetConfig.theme, "light"),
				...getSidebarTokens(presetConfig, "light"),
			},
			dark: {
				...getBaseColorTokens(presetConfig.baseColor, "dark"),
				...getThemeAccentTokens(presetConfig.theme, "dark"),
				...getSidebarTokens(presetConfig, "dark"),
			},
		},
	};
}
