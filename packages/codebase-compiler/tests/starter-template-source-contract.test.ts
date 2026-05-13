import {
	STARTER_TEMPLATE_SOURCE_ROOT,
	isStarterTemplateGeneratedOverlayAllowed,
	verifyStarterTemplateSourceSnapshot,
} from "../src/server";

describe("starter template source contract", () => {
	it("pins the imported Starter source snapshot by manifest digest", async () => {
		const verification = await verifyStarterTemplateSourceSnapshot();

		expect(verification.manifest).toMatchObject({
			contentDigest:
				"sha256-2050b63ecf39c24cfda55f1a3cb93c8d239b94bf701dd8435378be5d2492ee5c",
			fileCount: 131,
			sourceLayout: "single-next-app-root",
			sourceRoot: STARTER_TEMPLATE_SOURCE_ROOT,
			templateId: "starter-app",
			templateVersion: "2026-05-13-sibling-seed",
		});
		expect(verification.contentDigest).toBe(
			verification.manifest.contentDigest,
		);
		expect(verification.fileCount).toBe(verification.manifest.fileCount);
	});

	it("contains the expected sibling template architecture files", async () => {
		const { files, manifest } = await verifyStarterTemplateSourceSnapshot();
		const fileSet = new Set(files);

		for (const requiredFile of manifest.requiredFiles) {
			expect(fileSet.has(requiredFile)).toBe(true);
		}

		expect(fileSet.has("src/app/(marketing)/page.tsx")).toBe(true);
		expect(fileSet.has("src/app/(app)/notes/page.tsx")).toBe(true);
		expect(fileSet.has("src/app/api/billing/checkout/route.ts")).toBe(true);
		expect(fileSet.has("src/lib/billing/stripe-sync.ts")).toBe(true);
		expect(fileSet.has("convex/schema.ts")).toBe(true);
		expect(fileSet.has("convex/notes.ts")).toBe(true);
	});

	it("excludes dependency installs, local env, and build artifacts", async () => {
		const { files } = await verifyStarterTemplateSourceSnapshot();

		expect(files.some((file) => file.startsWith("node_modules/"))).toBe(false);
		expect(files.some((file) => file.startsWith(".git/"))).toBe(false);
		expect(files.some((file) => file.startsWith(".next/"))).toBe(false);
		expect(files.some((file) => file.startsWith(".vercel/"))).toBe(false);
		expect(files).not.toContain(".env.local");
		expect(files).not.toContain(".env.preview");
		expect(files).not.toContain(".env.production");
	});

	it("defines an explicit generated overlay boundary", async () => {
		const { manifest } = await verifyStarterTemplateSourceSnapshot();

		expect(
			isStarterTemplateGeneratedOverlayAllowed("README.md", manifest),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed("src/app/layout.tsx", manifest),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/components/layout/public-auth-controls.tsx",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/components/app/convex-ready-gate.tsx",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/components/layout/brand-lockup.tsx",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/lib/billing/stripe.ts",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/components/providers/app-providers.tsx",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/app/_content/home-page.ts",
				manifest,
			),
		).toBe(false);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/app/(app)/layout.tsx",
				manifest,
			),
		).toBe(false);
		expect(
			isStarterTemplateGeneratedOverlayAllowed("src/app/globals.css", manifest),
		).toBe(false);
		expect(
			isStarterTemplateGeneratedOverlayAllowed("next.config.ts", manifest),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/lib/email/send.ts",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"templates/starter-app/source/README.md",
				manifest,
			),
		).toBe(false);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"node_modules/example/index.js",
				manifest,
			),
		).toBe(false);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/components/ui/button.tsx",
				manifest,
			),
		).toBe(false);
	});
});
