import { existsSync } from "node:fs";
import path from "node:path";

import { buildDocsSpineDraftQualityReport } from "../src/workflows/docs-spine-adoption/quality-eval";
import { buildDocsSpineScannerBundle } from "../src/workflows/docs-spine-adoption/scanner";
import { buildDocsSpineSynthesisArtifacts } from "../src/workflows/docs-spine-adoption/synthesis";

type RealRepoEvalTarget = {
	name: string;
	repositoryRoot: string;
};

type ProposedMarkdownFile = {
	targetRef: string;
	markdown: string;
};

const REAL_REPO_EVAL_ENABLED =
	process.env.SBS_DOCS_SPINE_REAL_REPO_EVAL === "1";
const REAL_REPO_EVAL_NOW = Date.UTC(2026, 4, 6, 12);
const REAL_REPO_TARGETS: RealRepoEvalTarget[] = [
	{
		name: "worker",
		repositoryRoot:
			process.env.SBS_DOCS_SPINE_WORKER_REPO ??
			"/Users/bazelrex/Developer/worker",
	},
	{
		name: "ship-by-sunday",
		repositoryRoot:
			process.env.SBS_DOCS_SPINE_SBS_REPO ??
			"/Users/bazelrex/Developer/ship-by-sunday",
	},
	{
		name: "customer",
		repositoryRoot:
			process.env.SBS_DOCS_SPINE_CUSTOMER_REPO ??
			"/Users/bazelrex/Developer/arena-crm",
	},
];

describe.skipIf(!REAL_REPO_EVAL_ENABLED)("docs spine real repo eval", () => {
	it.each(REAL_REPO_TARGETS)(
		"scans and synthesizes $name with perfect docs-spine quality",
		async ({ repositoryRoot }) => {
			expect(existsSync(path.join(repositoryRoot, ".git"))).toBe(true);

			const scannerBundle = await buildDocsSpineScannerBundle({
				repositoryRoot,
				now: REAL_REPO_EVAL_NOW,
			});
			const synthesisArtifacts = buildDocsSpineSynthesisArtifacts({
				repoFacts: scannerBundle.repoFacts,
				scannerArtifacts: scannerBundle.artifacts,
				now: REAL_REPO_EVAL_NOW,
			});
			const qualityReport = buildDocsSpineDraftQualityReport({
				draftArtifacts: synthesisArtifacts,
				repoFacts: scannerBundle.repoFacts,
				now: REAL_REPO_EVAL_NOW,
			});
			const serializedScannerFacts = JSON.stringify(scannerBundle);
			const proposedFiles = synthesisArtifacts.flatMap((artifact) =>
				extractProposedFiles(artifact.value),
			);
			const proposedTargetRefs = proposedFiles.map((file) => file.targetRef);
			const proposedMarkdown = proposedFiles
				.map((file) => file.markdown)
				.join("\n");

			expect(scannerBundle.repoFacts.docsSurface.docsRefs).not.toEqual(
				expect.arrayContaining([
					expect.stringMatching(SOURCE_OR_TEST_REF_PATTERN),
				]),
			);
			expect(serializedScannerFacts).not.toMatch(SECRET_PATTERN);
			expect(serializedScannerFacts).not.toMatch(PACKAGE_SCRIPT_BODY_PATTERN);
			expect(proposedMarkdown).not.toMatch(PRIMARY_ROUTE_PATH_PATTERN);
			expect(proposedMarkdown).not.toMatch(LOCAL_ABSOLUTE_PATH_PATTERN);
			expect(proposedMarkdown).not.toContain("2026-05-05-docs-spine-adoption");
			expect(proposedTargetRefs).toContain("docs/prompts/program-create.md");
			expect(proposedTargetRefs).toContain(
				"docs/prompts/program-orchestrator.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/prompts/program-planning-brief.md",
			);
			expect(proposedTargetRefs).toContain("docs/prompts/exec-plan-writer.md");
			expect(proposedTargetRefs).toContain(
				"docs/prompts/exec-plan-validate.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/programs/active/2026-05-06-docs-spine-adoption/track-1-docs-spine-surfaces.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/programs/active/2026-05-06-docs-spine-adoption/normalized-track-1.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/programs/active/2026-05-06-docs-spine-adoption/converged-decision-packet.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/programs/active/2026-05-06-docs-spine-adoption/dependency-graph.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/programs/active/2026-05-06-docs-spine-adoption/plan-split-recommendation.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/programs/active/2026-05-06-docs-spine-adoption/cross-repo-review.md",
			);
			expect(proposedTargetRefs).toContain(
				"docs/programs/active/2026-05-06-docs-spine-adoption/current-planning-brief.txt",
			);
			expect(proposedMarkdown).toContain("# Program Create Prompt");
			expect(proposedMarkdown).toContain("## Quality Gate");
			if (
				!scannerBundle.repoFacts.docsSurface.programRefs.includes(
					"docs/programs/active/index.md",
				)
			) {
				expect(proposedTargetRefs).toContain("docs/programs/active/index.md");
			}
			if (
				!scannerBundle.repoFacts.docsSurface.programRefs.includes(
					"docs/programs/completed/index.md",
				)
			) {
				expect(proposedTargetRefs).toContain(
					"docs/programs/completed/index.md",
				);
			}
			expect(qualityReport.status).toBe("passed");
			expect(qualityReport.score).toBe(100);
		},
	);
});

function extractProposedFiles(value: unknown): ProposedMarkdownFile[] {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return [];
	}
	const proposedFiles = (value as Record<string, unknown>).proposedFiles;
	if (!Array.isArray(proposedFiles)) {
		return [];
	}
	return proposedFiles
		.map((file) => {
			if (!file || typeof file !== "object" || Array.isArray(file)) {
				return null;
			}
			const targetRef = (file as Record<string, unknown>).targetRef;
			const markdown = (file as Record<string, unknown>).markdown;
			if (typeof targetRef !== "string" || typeof markdown !== "string") {
				return null;
			}
			return { targetRef, markdown };
		})
		.filter((file): file is ProposedMarkdownFile => file !== null);
}

const SOURCE_OR_TEST_REF_PATTERN =
	/(?:^|["`\s/])(?:(?:apps|packages)\/[^"`\s]+\/(?:src|test|tests|__tests__)\/|(?:src|test|tests|__tests__)\/)/;
const PRIMARY_ROUTE_PATH_PATTERN =
	/(?:^|["`\s/])(?:(?:apps|packages)\/[^"`\s]+\/(?:src|test|tests|__tests__|assets|public|static)\/|(?:src|test|tests|__tests__|assets|public|static)\/)/;
const SECRET_PATTERN = /(?:SECRET_|TOKEN=)/;
const LOCAL_ABSOLUTE_PATH_PATTERN =
	/(?:^|[\s`("'[])(?:\/Users\/|\/home\/|\/private\/var\/|[A-Za-z]:\\)/;
const PACKAGE_SCRIPT_BODY_PATTERN = /SECRET_TOKEN=|never-sync|turbo run gate/;
