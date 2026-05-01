import { mkdtemp } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createCompleteProjectDefinition } from "../src";
import { resolveRepoRootPath } from "../src/repo-root";
import {
	loadOpenAiBlueprintTemplates,
	materializeRepoSnapshot,
} from "../src/server";

describe("repo root resolution", () => {
	it("loads blueprint templates while the cwd is outside the repository", async () => {
		const originalCwd = process.cwd();
		const temporaryWorkingDirectory = await mkdtemp(
			path.join(os.tmpdir(), "blueprint-compiler-cwd-"),
		);

		process.chdir(temporaryWorkingDirectory);
		try {
			const templates = await loadOpenAiBlueprintTemplates();

			expect(templates.buildAgents).toContain("#");
			expect(templates.marketingReadme).toContain("#");
			expect(resolveRepoRootPath()).toBe(path.resolve(originalCwd, "..", ".."));
		} finally {
			process.chdir(originalCwd);
		}
	});

	it("materializes the repo snapshot while the cwd is outside the repository", async () => {
		const originalCwd = process.cwd();
		const temporaryWorkingDirectory = await mkdtemp(
			path.join(os.tmpdir(), "blueprint-compiler-snapshot-"),
		);

		process.chdir(temporaryWorkingDirectory);
		try {
			const snapshotFiles = await materializeRepoSnapshot(
				createCompleteProjectDefinition(),
			);
			const snapshotPaths = snapshotFiles.map((file) => file.path);

			expect(snapshotPaths).toEqual(
				expect.arrayContaining([
					"docs/index.md",
					"docs/build/docs/agent-handoff.md",
					"docs/build/docs/prompt.md",
					"docs/prompts/execplan-execution-loop.md",
					"apps/web/config/product.ts",
				]),
			);
		} finally {
			process.chdir(originalCwd);
		}
	});
});
