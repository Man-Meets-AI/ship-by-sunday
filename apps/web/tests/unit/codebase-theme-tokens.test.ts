import { describe, expect, it } from "vitest";
import { DEFAULT_PRESET_CONFIG } from "shadcn/preset";
import {
	buildPreviewCssVars,
	getGoogleFontsUrl,
	getPreviewFontFamily,
} from "@/lib/codebase-flow/codebase-theme-tokens";

describe("buildPreviewCssVars", () => {
	it("returns a CSSProperties-shaped object with semantic tokens", () => {
		const vars = buildPreviewCssVars(DEFAULT_PRESET_CONFIG);
		expect(vars).toHaveProperty("--primary");
		expect(vars).toHaveProperty("--background");
		expect(vars).toHaveProperty("--radius");
		expect(vars).toHaveProperty("--sidebar");
		expect(vars).toHaveProperty("fontFamily");
	});

	it("changes --primary when theme changes", () => {
		const neutral = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			theme: "neutral",
		});
		const blue = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			theme: "blue",
		});
		expect(neutral["--primary" as keyof typeof neutral]).not.toBe(
			blue["--primary" as keyof typeof blue],
		);
	});

	it("changes --radius when radius changes", () => {
		const none = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			radius: "none",
		});
		const large = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			radius: "large",
		});
		expect(none["--radius" as keyof typeof none]).not.toBe(
			large["--radius" as keyof typeof large],
		);
	});

	it("changes fontFamily when font changes", () => {
		const inter = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			font: "inter",
		});
		const lora = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			font: "lora",
		});
		expect(inter.fontFamily).toContain("Inter");
		expect(lora.fontFamily).toContain("Lora");
	});

	it("applies inverted sidebar tokens for inverted menu color", () => {
		const defaultMenu = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			menuColor: "default",
		});
		const inverted = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			menuColor: "inverted",
		});
		expect(defaultMenu["--sidebar" as keyof typeof defaultMenu]).not.toBe(
			inverted["--sidebar" as keyof typeof inverted],
		);
	});

	it("applies style-specific shadow tokens", () => {
		const nova = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			style: "nova",
		});
		const mira = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			style: "mira",
		});
		expect(nova["--preview-shadow" as keyof typeof nova]).not.toBe(
			mira["--preview-shadow" as keyof typeof mira],
		);
	});

	it("changes base color tokens when baseColor changes", () => {
		const neutral = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			baseColor: "neutral",
		});
		const stone = buildPreviewCssVars({
			...DEFAULT_PRESET_CONFIG,
			baseColor: "stone",
		});
		expect(neutral["--border" as keyof typeof neutral]).not.toBe(
			stone["--border" as keyof typeof stone],
		);
	});
});

describe("getGoogleFontsUrl", () => {
	it("returns a valid Google Fonts URL for a known font", () => {
		const url = getGoogleFontsUrl("inter");
		expect(url).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2/);
		expect(url).toContain("Inter");
	});

	it("returns null for an unknown font", () => {
		expect(getGoogleFontsUrl("not-a-font")).toBeNull();
	});
});

describe("getPreviewFontFamily", () => {
	it("returns the CSS font-family stack for a known font", () => {
		expect(getPreviewFontFamily("inter")).toBe("'Inter', sans-serif");
		expect(getPreviewFontFamily("lora")).toBe("'Lora', serif");
		expect(getPreviewFontFamily("jetbrains-mono")).toBe(
			"'JetBrains Mono', monospace",
		);
	});

	it("falls back to system sans for unknown font", () => {
		expect(getPreviewFontFamily("bogus")).toContain("sans-serif");
	});
});
