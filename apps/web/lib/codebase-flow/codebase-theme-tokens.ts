import type { CSSProperties } from "react";
import {
	buildPresetPreviewCssVars,
	getPresetGoogleFontsUrl,
	getPresetFontFamily,
	getPresetStyleMeta,
	type PresetStyleMeta,
} from "@shipbysunday/codebase-compiler";
import type { PresetConfig } from "shadcn/preset";

export function getPreviewFontFamily(font: string): string {
	return getPresetFontFamily(font);
}

export function getGoogleFontsUrl(font: string): string | null {
	return getPresetGoogleFontsUrl(font);
}

export function buildPreviewCssVars(config: PresetConfig): CSSProperties {
	return buildPresetPreviewCssVars(config) as unknown as CSSProperties;
}

export const STYLE_META: Record<string, PresetStyleMeta> = {
	nova: getPresetStyleMeta("nova"),
	vega: getPresetStyleMeta("vega"),
	maia: getPresetStyleMeta("maia"),
	lyra: getPresetStyleMeta("lyra"),
	mira: getPresetStyleMeta("mira"),
};

export type { PresetStyleMeta as StyleMeta };
