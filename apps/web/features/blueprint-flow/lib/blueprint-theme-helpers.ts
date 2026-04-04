import {
	DEFAULT_PRESET_CONFIG,
	PRESET_THEMES,
	PRESET_STYLES,
	PRESET_FONTS,
	PRESET_RADII,
	PRESET_BASE_COLORS,
	PRESET_ICON_LIBRARIES,
	PRESET_MENU_ACCENTS,
	PRESET_MENU_COLORS,
	encodePreset,
	decodePreset,
	generateRandomConfig,
	type PresetConfig,
} from "shadcn/preset";

export type { PresetConfig };
export { encodePreset, decodePreset, generateRandomConfig };

export const DEFAULT_THEME_PRESET_CODE = encodePreset(DEFAULT_PRESET_CONFIG);

export const THEME_COLOR_OPTIONS = PRESET_THEMES;
export const STYLE_OPTIONS = PRESET_STYLES;
export const FONT_OPTIONS = PRESET_FONTS;
export const RADIUS_OPTIONS = PRESET_RADII;
export const BASE_COLOR_OPTIONS = PRESET_BASE_COLORS;
export const ICON_LIBRARY_OPTIONS = PRESET_ICON_LIBRARIES;
export const MENU_ACCENT_OPTIONS = PRESET_MENU_ACCENTS;
export const MENU_COLOR_OPTIONS = PRESET_MENU_COLORS;

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

export function themeColorHex(theme: string): string {
	return THEME_COLOR_HEX[theme] ?? "#737373";
}

export function decodePresetSafe(code: string): PresetConfig {
	try {
		const result = decodePreset(code);
		return result ?? { ...DEFAULT_PRESET_CONFIG };
	} catch {
		return { ...DEFAULT_PRESET_CONFIG };
	}
}

const FONT_DISPLAY_NAMES: Record<string, string> = {
	inter: "Inter",
	"noto-sans": "Noto Sans",
	"nunito-sans": "Nunito Sans",
	figtree: "Figtree",
	roboto: "Roboto",
	raleway: "Raleway",
	"dm-sans": "DM Sans",
	"public-sans": "Public Sans",
	outfit: "Outfit",
	"jetbrains-mono": "JetBrains Mono",
	geist: "Geist",
	"geist-mono": "Geist Mono",
	lora: "Lora",
	merriweather: "Merriweather",
	"playfair-display": "Playfair Display",
	"noto-serif": "Noto Serif",
	"roboto-slab": "Roboto Slab",
};

export function formatFontLabel(font: string): string {
	return (
		FONT_DISPLAY_NAMES[font] ??
		font
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ")
	);
}

export function formatRadiusLabel(radius: string): string {
	return radius.charAt(0).toUpperCase() + radius.slice(1);
}

export function formatMenuColorLabel(menuColor: string): string {
	return menuColor
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}
