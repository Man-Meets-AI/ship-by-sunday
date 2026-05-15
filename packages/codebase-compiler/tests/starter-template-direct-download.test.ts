import JSZip from "jszip";
import { createDefaultStarterTemplateProjectDefinition } from "../src";
import {
	buildRepoGenerationManifest,
	buildReviewDownloadZip,
	materializeRepoSnapshot,
} from "../src/server";
import { buildOperatingPackPaths } from "../src/repo-generation/render-starter-operating-pack";

function snapshotText(file: { content: Buffer | string } | undefined) {
	if (!file) {
		return "";
	}

	return typeof file.content === "string"
		? file.content
		: file.content.toString();
}

describe("direct Starter template download defaults", () => {
	it("builds conservative no-question default facts", () => {
		const projectDefinition = createDefaultStarterTemplateProjectDefinition();
		const manifest = buildRepoGenerationManifest(projectDefinition);

		expect(projectDefinition.productKey).toBe("ai-chat-starter");
		expect(projectDefinition.facts.product_name).toBe("AI Chat Starter");
		expect(projectDefinition.facts.objective).toBe(
			"Deliver a generated AI chat starter that can boot safely before providers and guide setup afterward.",
		);
		expect(projectDefinition.facts.user_visible_outcome).toBe(
			"A builder downloads `ai-chat-starter.zip`, runs the repo checks, completes setup, and sends a persisted AI chat message.",
		);
		expect(projectDefinition.facts.proof_sources).toEqual([
			"Generated repo validation output",
			"Template-source provenance file",
			"Provider setup ExecPlan evidence",
		]);
		expect(projectDefinition.facts.core_flow).toEqual([
			"Download the starter repo",
			"Run the no-provider checks",
			"Configure Clerk, Convex, Stripe, and OpenAI",
			"Customize the chat app",
		]);
		expect(projectDefinition.facts.domain).toBeUndefined();
		expect(projectDefinition.facts.contact_email).toBeUndefined();
		expect(projectDefinition.facts.support_email).toBeUndefined();
		expect(projectDefinition.placeholdersInUse).toEqual([
			"domain",
			"contact_email",
			"support_email",
		]);
		expect(manifest.repoName).toBe("ai-chat-starter");
	});

	it("materializes the same generated repo contract with default facts", async () => {
		const projectDefinition = createDefaultStarterTemplateProjectDefinition();
		const operatingPackPaths = buildOperatingPackPaths(projectDefinition);
		const snapshotFiles = await materializeRepoSnapshot(projectDefinition);
		const snapshotPaths = snapshotFiles.map((file) => file.path);
		const projectDefinitionJson = snapshotText(
			snapshotFiles.find(
				(file) => file.path === "docs/facts/project-definition.json",
			),
		);
		const parsedProjectDefinition = JSON.parse(projectDefinitionJson);

		expect(snapshotPaths).toEqual(
			expect.arrayContaining([
				"docs/facts/template-source.json",
				"docs/facts/project-definition.json",
				"apps/web/src/app/(app)/chat/page.tsx",
				"apps/web/src/components/app/chat-workbench.tsx",
				operatingPackPaths.activeProgramPath,
				...operatingPackPaths.activeExecPlanPaths,
			]),
		);
		expect(projectDefinitionJson).toContain(
			'"product_name": "AI Chat Starter"',
		);
		expect(parsedProjectDefinition.facts.objective).toBe(
			"Deliver a generated AI chat starter that can boot safely before providers and guide setup afterward.",
		);
		expect(parsedProjectDefinition.facts.done_when).toBe(
			"The starter boots in no-provider mode and the setup plans lead to a persisted chat response after OpenAI configuration.",
		);
		expect(parsedProjectDefinition.facts.proof_sources).toEqual([
			"Generated repo validation output",
			"Template-source provenance file",
			"Provider setup ExecPlan evidence",
		]);
		expect(
			snapshotText(
				snapshotFiles.find(
					(file) => file.path === "apps/web/config/product.ts",
				),
			),
		).toContain('"domain": "localhost:3000"');
		expect(
			snapshotText(
				snapshotFiles.find(
					(file) => file.path === "apps/web/src/lib/app/links.ts",
				),
			),
		).toContain("normalizeProductUrl(productConfig.domain)");
	});

	it("builds a dynamic zip under the default repo slug", async () => {
		const projectDefinition = createDefaultStarterTemplateProjectDefinition();
		const archive = await buildReviewDownloadZip(projectDefinition);
		const zip = await JSZip.loadAsync(archive);
		const entries = Object.keys(zip.files).sort();

		expect(entries).toEqual(
			expect.arrayContaining([
				"ai-chat-starter/",
				"ai-chat-starter/docs/facts/template-source.json",
				"ai-chat-starter/docs/facts/project-definition.json",
				"ai-chat-starter/apps/web/src/app/(app)/chat/page.tsx",
			]),
		);
	});
});
