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
				"apps/web/src/lib/billing/stripe-sync.ts",
				"apps/web/convex/schema.ts",
			]),
		);
		expect(paths).not.toEqual(
			expect.arrayContaining([
				"apps/web/bun.lock",
				"apps/web/README.md",
				"apps/web/package.json",
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
		expect(appReadme).not.toContain("_content");
		expect(appReadme).not.toContain("api/stripe/webhook");
		expect(tsconfig.compilerOptions?.paths?.["@/*"]).toEqual([
			"./*",
			"./src/*",
		]);
	});

	it("rejects generated overlays that replace template-source files outside manifest policy", async () => {
		const verification = await verifyStarterTemplateSourceSnapshot();

		expect(() =>
			assertGeneratedTemplateSourceOverlaysAllowed(
				[
					{
						path: "apps/web/src/components/ui/button.tsx",
						content: "unsafe replacement",
					},
					{
						path: "apps/web/src/app/api/stripe/webhook/route.ts",
						content: "provider-heavy replacement",
					},
				],
				verification,
			),
		).toThrow(/not allowed to replace/);
		expect(() =>
			assertGeneratedTemplateSourceOverlaysAllowed(
				[
					{
						path: "apps/web/src/app/layout.tsx",
						content: "allowed replacement",
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
