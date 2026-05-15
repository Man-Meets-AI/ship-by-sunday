import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	STARTER_TEMPLATE_SOURCE_ROOT,
	isStarterTemplateGeneratedOverlayAllowed,
	listStarterTemplateSourceFiles,
	listStarterTemplateSourceFilesSync,
	verifyStarterTemplateSourceSnapshot,
	type StarterTemplateSourceManifest,
} from "../src/server";

function createPruningTestManifest(): StarterTemplateSourceManifest {
	return {
		schemaVersion: "starter-template-source.v1",
		templateId: "starter-app",
		templateVersion: "test-pruning",
		sourceRoot: STARTER_TEMPLATE_SOURCE_ROOT,
		sourceLayout: "single-next-app-root",
		fileCount: 1,
		contentDigest: "sha256-test",
		provenance: {
			originKind: "local-directory-snapshot",
			originPathHint: "test",
			originGitCommit: null,
			capturedAt: "2026-05-15",
			capturedByProgram: "test",
			notes: "Test fixture.",
		},
		requiredFiles: ["README.md"],
		excludedPathSegments: [".next", "node_modules"],
		excludedFilePaths: [".env.local"],
		generatedOverlayPolicy: {
			description: "Test policy.",
			allowedExactPaths: [],
			allowedPathPrefixes: [],
			blockedPathPrefixes: ["node_modules/"],
		},
	};
}

describe("starter template source contract", () => {
	it("pins the imported Starter source snapshot by manifest digest", async () => {
		const verification = await verifyStarterTemplateSourceSnapshot();

		expect(verification.manifest).toMatchObject({
			contentDigest:
				"sha256-6681c4e9492ea7cb07634a9beb7d8c656b2dec556e939b8fe01c7f35fff79c0c",
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

	it("prunes excluded source directories before recursing", async () => {
		const tempRoot = await mkdtemp(path.join(tmpdir(), "sbs-template-prune-"));
		const sourceRoot = path.join(tempRoot, STARTER_TEMPLATE_SOURCE_ROOT);
		const unreadableDependencyDirectory = path.join(
			sourceRoot,
			"node_modules",
			"blocked",
		);

		try {
			await mkdir(unreadableDependencyDirectory, { recursive: true });
			await writeFile(path.join(sourceRoot, "README.md"), "template");
			await writeFile(path.join(sourceRoot, ".env.local"), "secret");
			await chmod(unreadableDependencyDirectory, 0);

			const manifest = createPruningTestManifest();

			await expect(
				listStarterTemplateSourceFiles({
					manifest,
					repoRootPath: tempRoot,
				}),
			).resolves.toEqual(["README.md"]);
			expect(
				listStarterTemplateSourceFilesSync({
					manifest,
					repoRootPath: tempRoot,
				}),
			).toEqual(["README.md"]);
		} finally {
			await chmod(unreadableDependencyDirectory, 0o700).catch(() => {});
			await rm(tempRoot, { force: true, recursive: true });
		}
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
