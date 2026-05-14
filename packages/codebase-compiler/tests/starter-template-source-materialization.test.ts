import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createCompleteProjectDefinition } from "../src";
import { assertGeneratedTemplateSourceOverlaysAllowed } from "../src/repo-generation/materialize-repo-snapshot";
import {
	materializeRepoSnapshot,
	materializeStarterTemplateSourceFiles,
	verifyStarterTemplateSourceSnapshot,
} from "../src/server";

function snapshotText(file: { content: string | Buffer } | undefined) {
	if (!file) {
		return "";
	}

	return typeof file.content === "string"
		? file.content
		: file.content.toString();
}

describe("starter template source materialization", () => {
	it("maps the pinned single-app template source into apps/web", async () => {
		const files = await materializeStarterTemplateSourceFiles();
		const paths = files.map((file) => file.path);

		expect(paths).toEqual(
			expect.arrayContaining([
				"apps/web/src/components/ui/button.tsx",
				"apps/web/src/app/(app)/dashboard/page.tsx",
				"apps/web/src/app/(app)/chat/page.tsx",
				"apps/web/src/components/app/chat-workbench.tsx",
				"apps/web/src/lib/chat/models.ts",
				"apps/web/convex/chat.ts",
				"apps/web/src/lib/billing/stripe-sync.ts",
				"apps/web/convex/schema.ts",
			]),
		);
		expect(paths).not.toEqual(
			expect.arrayContaining([
				"apps/web/bun.lock",
				"apps/web/README.md",
				"apps/web/package.json",
				"apps/web/src/app/(app)/notes/page.tsx",
				"apps/web/src/components/app/notes-workbench.tsx",
				"apps/web/convex/notes.ts",
				"apps/web/.github/workflows/ci.yml",
				"apps/web/src/app/api/billing/checkout/route.ts",
				"apps/web/src/app/(marketing)/page.test.tsx",
				"apps/web/src/lib/email/send.ts",
				"apps/web/src/lib/sentry/server.ts",
				"apps/web/instrumentation.ts",
				"apps/web/sentry.server.config.ts",
			]),
		);
		expect(paths.some((sourcePath) => sourcePath.includes("templates/"))).toBe(
			false,
		);
	});

	it("lets generated overlays win after template-source files are mapped", async () => {
		const snapshotFiles = await materializeRepoSnapshot(
			createCompleteProjectDefinition(),
		);
		const snapshotPaths = new Set(snapshotFiles.map((file) => file.path));
		const marketingPage = snapshotText(
			snapshotFiles.find(
				(file) => file.path === "apps/web/src/app/(marketing)/page.tsx",
			),
		);
		const rootLayout = snapshotText(
			snapshotFiles.find((file) => file.path === "apps/web/src/app/layout.tsx"),
		);
		const appReadme = snapshotText(
			snapshotFiles.find((file) => file.path === "apps/web/README.md"),
		);
		const billingPanel = snapshotText(
			snapshotFiles.find(
				(file) => file.path === "apps/web/src/components/app/billing-panel.tsx",
			),
		);
		const tsconfig = JSON.parse(
			snapshotText(
				snapshotFiles.find((file) => file.path === "apps/web/tsconfig.json"),
			) || "{}",
		) as {
			compilerOptions?: { paths?: Record<string, string[]> };
		};

		expect(snapshotPaths.has("apps/web/src/components/ui/button.tsx")).toBe(
			true,
		);
		expect(snapshotPaths.has("apps/web/src/app/(app)/dashboard/page.tsx")).toBe(
			true,
		);
		expect(snapshotPaths.has("apps/web/src/app/(app)/chat/page.tsx")).toBe(
			true,
		);
		expect(snapshotPaths.has("apps/web/src/app/(app)/notes/page.tsx")).toBe(
			false,
		);
		expect(snapshotPaths.has("apps/web/convex/chat.ts")).toBe(true);
		expect(snapshotPaths.has("apps/web/convex/notes.ts")).toBe(false);
		expect(snapshotPaths.has("apps/web/convex/schema.ts")).toBe(true);
		expect(snapshotPaths.has("apps/web/app/page.tsx")).toBe(false);
		expect(snapshotPaths.has("apps/web/app/layout.tsx")).toBe(false);
		expect(snapshotPaths.has("apps/web/src/app/_content/home-page.ts")).toBe(
			false,
		);
		expect(snapshotPaths.has("docs/facts/template-source.json")).toBe(true);
		expect(marketingPage).toContain(
			'import { productConfig, productContent } from "@/config/product";',
		);
		expect(marketingPage).toContain("productContent.headline");
		expect(marketingPage).not.toContain("Generated Starter App");
		expect(marketingPage).not.toContain("Operations for small teams");
		expect(marketingPage).not.toContain("Northstar");
		expect(rootLayout).toContain("productConfig");
		expect(rootLayout).toContain("clerkPublishableKey ? (");
		expect(rootLayout).toContain("publishableKey={clerkPublishableKey}");
		expect(rootLayout).not.toContain("@/lib/env/client");
		expect(appReadme).toContain("No-Provider Contract");
		expect(appReadme).toContain("config/product.ts");
		expect(appReadme).toContain("src/app/(app)/chat/page.tsx");
		expect(appReadme).not.toContain("_content");
		expect(appReadme).not.toContain("api/stripe/webhook");
		expect(billingPanel).toContain(
			"generated starter until the billing setup slice materializes",
		);
		expect(billingPanel).not.toContain('action="/api/billing/checkout"');
		expect(billingPanel).not.toContain('action="/api/billing/portal"');
		expect(tsconfig.compilerOptions?.paths?.["@/*"]).toEqual([
			"./*",
			"./src/*",
		]);
	});

	it("rejects generated overlays outside manifest policy", async () => {
		const verification = await verifyStarterTemplateSourceSnapshot();

		expect(() =>
			assertGeneratedTemplateSourceOverlaysAllowed(
				[
					{
						path: "apps/web/src/components/ui/button.tsx",
						content: "unsafe replacement",
					},
					{
						path: "apps/web/src/app/api/generated-unsafe/route.ts",
						content: "unsafe generated addition",
					},
				],
				verification,
			),
		).toThrow(/not allowed by the pinned template source policy/);
		expect(() =>
			assertGeneratedTemplateSourceOverlaysAllowed(
				[
					{
						path: "apps/web/src/app/layout.tsx",
						content: "allowed replacement",
					},
					{
						path: "apps/web/config/product.ts",
						content: "allowed generated addition",
					},
				],
				verification,
			),
		).not.toThrow();
	});

	it("rejects missing template-source manifest state before generation", async () => {
		const tempRoot = await mkdtemp(
			path.join(tmpdir(), "sbs-template-source-missing-"),
		);

		try {
			await expect(
				materializeStarterTemplateSourceFiles(tempRoot),
			).rejects.toThrow();
		} finally {
			await rm(tempRoot, { force: true, recursive: true });
		}
	});
});
