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
import {
	decodePresetSafe,
	getPresetFontLabel,
	getPresetThemeHex,
} from "@shipbysunday/blueprint-compiler";

export type { PresetConfig };
export { encodePreset, decodePreset, generateRandomConfig, decodePresetSafe };

export const DEFAULT_THEME_PRESET_CODE = encodePreset(DEFAULT_PRESET_CONFIG);

export const THEME_COLOR_OPTIONS = PRESET_THEMES;
export const STYLE_OPTIONS = PRESET_STYLES;
export const FONT_OPTIONS = PRESET_FONTS;
export const RADIUS_OPTIONS = PRESET_RADII;
export const BASE_COLOR_OPTIONS = PRESET_BASE_COLORS;
export const ICON_LIBRARY_OPTIONS = PRESET_ICON_LIBRARIES;
export const MENU_ACCENT_OPTIONS = PRESET_MENU_ACCENTS;
export const MENU_COLOR_OPTIONS = PRESET_MENU_COLORS;

export function themeColorHex(theme: string): string {
	return getPresetThemeHex(theme);
}

export function formatFontLabel(font: string): string {
	return getPresetFontLabel(font);
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
