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
				"sha256-87e1150d49b01bf18aba28491fe5716850e4a9a808f7c1e91d43cf9464582d14",
			fileCount: 132,
			sourceLayout: "single-next-app-root",
			sourceRoot: STARTER_TEMPLATE_SOURCE_ROOT,
			templateId: "starter-app",
			templateVersion: "2026-05-13-chat-starter",
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
		expect(fileSet.has("src/app/(app)/chat/page.tsx")).toBe(true);
		expect(fileSet.has("src/app/api/billing/checkout/route.ts")).toBe(true);
		expect(fileSet.has("src/lib/billing/stripe-sync.ts")).toBe(true);
		expect(fileSet.has("src/lib/chat/models.ts")).toBe(true);
		expect(fileSet.has("src/lib/chat/openai-stream.ts")).toBe(true);
		expect(fileSet.has("src/lib/chat/rules.ts")).toBe(true);
		expect(fileSet.has("src/proxy.ts")).toBe(true);
		expect(fileSet.has("convex/schema.ts")).toBe(true);
		expect(fileSet.has("convex/chat.ts")).toBe(true);
		expect(fileSet.has("convex/notes.ts")).toBe(false);
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
		expect(files).not.toContain("next-env.d.ts");
		expect(files).not.toContain("tsconfig.tsbuildinfo");
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
			isStarterTemplateGeneratedOverlayAllowed("src/proxy.ts", manifest),
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
				"src/components/app/billing-panel.tsx",
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
			isStarterTemplateGeneratedOverlayAllowed("config/product.ts", manifest),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"config/generated-design-system.ts",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"content/docs/index.mdx",
				manifest,
			),
		).toBe(true);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				".env.production.example",
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
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/app/api/billing/checkout/route.ts",
				manifest,
			),
		).toBe(false);
		expect(
			isStarterTemplateGeneratedOverlayAllowed(
				"src/app/api/stripe/webhook/route.ts",
				manifest,
			),
		).toBe(false);
	});
});
