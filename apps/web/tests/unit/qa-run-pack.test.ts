import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../../");

const temporaryDirectories: string[] = [];

function createEmptyEnvFile() {
	const tempDirectory = mkdtempSync(path.join(tmpdir(), "qa-run-pack-"));
	const envFilePath = path.join(tempDirectory, ".env.test");

	writeFileSync(envFilePath, "");
	temporaryDirectories.push(tempDirectory);
	return envFilePath;
}

describe("qa:run-pack", () => {
	afterEach(() => {
		for (const tempDirectory of temporaryDirectories.splice(0)) {
			rmSync(tempDirectory, { force: true, recursive: true });
		}
	});

	it("plans the hosted production verifier for production billing proof", () => {
		const envFilePath = createEmptyEnvFile();
		const result = spawnSync(
			"node",
			[
				"qa/scripts/run-pack.mjs",
				"--pack=billing_integration",
				"--dry-run",
				"--slug=prod-billing-test",
			],
			{
				cwd: repoRoot,
				encoding: "utf8",
				env: {
					...process.env,
					PLAYWRIGHT_BASE_URL: "https://www.man-meets-ai.com",
					QA_ENV_FILE: envFilePath,
				},
			},
		);

		expect(result.status).toBe(0);
		const output = JSON.parse(result.stdout);
		const commands = output.steps.map((step: { command: string[] }) =>
			step.command.join(" "),
		);

		expect(commands).toContain("bun run --cwd apps/web stripe:hosted:verify");
		expect(commands).not.toContain(
			"bun run --cwd apps/web test:e2e:sandbox:billing-integration",
		);
	});
});
