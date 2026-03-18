import fs from "node:fs";
import path from "node:path";

function readSource(relativePath: string) {
	return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("phase 1 motion contract", () => {
	it("defines shared motion utilities with reduced-motion fallbacks", () => {
		const source = readSource("app/globals.css");
		const themeSource = readSource(
			"features/course/shared/utils/product-theme.ts",
		);

		expect(themeSource).toContain(
			`"--motion-fast": \`\${productThemeConfig.motion.fastMs}ms\``,
		);
		expect(themeSource).toContain(
			`"--motion-base": \`\${productThemeConfig.motion.baseMs}ms\``,
		);
		expect(themeSource).toContain(
			'"--ease-standard": productThemeConfig.motion.easeStandard',
		);
		expect(source).toContain(".sbs-press-feedback");
		expect(source).toContain(".sbs-hover-lift");
		expect(source).toContain("@media (prefers-reduced-motion: reduce)");
	});

	it("keeps checkout CTA feedback stable during redirect and error states", () => {
		const source = readSource(
			"features/checkout/components/checkout-button.tsx",
		);

		expect(source).toContain('const loadingLabel = "Redirecting..."');
		expect(source).toContain("aria-busy={isLoading}");
		expect(source).toContain(
			'className="relative inline-grid place-items-center"',
		);
		expect(source).toContain("motion-safe:animate-spin");
		expect(source).toContain('aria-live="polite"');
	});

	it("keeps the checkout-success and access-required handoff states explicit", () => {
		const successSource = readSource(
			"features/checkout/components/checkout-success-view.tsx",
		);
		const accessSource = readSource(
			"features/course/access/components/access-required-page.tsx",
		);

		expect(successSource).toContain("Payment confirmed");
		expect(successSource).toContain("Access handoff");
		expect(successSource).toContain("Opening mission");
		expect(accessSource).toContain("Checking course access");
		expect(accessSource).toContain("Check purchase");
		expect(accessSource).toContain("Waiting on access");
	});

	it("animates the FAQ answer region instead of hard-swapping it", () => {
		const source = readSource(
			"features/marketing/components/faq-accordion.tsx",
		);

		expect(source).toContain("transition-[grid-template-rows]");
		expect(source).toContain("grid-rows-[1fr]");
		expect(source).toContain("grid-rows-[0fr]");
		expect(source).toContain("aria-hidden={!isOpen}");
	});
});
