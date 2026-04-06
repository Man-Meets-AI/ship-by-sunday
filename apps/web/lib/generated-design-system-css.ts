import type { GeneratedDesignSystem } from "@shipbysunday/blueprint-compiler";

function renderCssVariables(variables: Record<string, string>) {
	return Object.entries(variables)
		.map(([name, value]) => `  ${name}: ${value};`)
		.join("\n");
}

/**
 * Drop dark tokens that are identical to their light counterpart — they aren't
 * dark-mode-adapted and would override the correct inversions in globals.css.
 */
function darkAdaptedOnly(
	light: Record<string, string>,
	dark: Record<string, string>,
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(dark).filter(([key, value]) => light[key] !== value),
	);
}

export function buildGeneratedDesignSystemCss(
	designSystem: GeneratedDesignSystem,
) {
	const fontFamily = designSystem.preset.font.cssFamily;
	const { light, dark } = designSystem.preset.tokens;

	return [
		":root {",
		`  --design-font-sans: ${fontFamily};`,
		`  --radius: ${designSystem.preset.geometry.base};`,
		renderCssVariables(light),
		"}",
		"",
		".dark {",
		renderCssVariables(darkAdaptedOnly(light, dark)),
		"}",
	].join("\n");
}
