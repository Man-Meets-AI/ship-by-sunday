import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
	applySbsCodexConfigPatch,
	inspectCodexConfig,
	previewSbsCodexConfigPatch,
	rollbackSbsCodexConfigPatch,
} from "../src/core/codex-config-manager";
import { createTemporaryDirectory } from "./test-utils";

describe("codex config manager", () => {
	it("previews and applies only the SBS managed block", async () => {
		const codexHome = await createTemporaryDirectory("sbs-codex-config-");
		const configPath = path.join(codexHome, "config.toml");
		await writeFile(
			configPath,
			[
				'model = "gpt-5.5"',
				"",
				'[projects."/tmp/repo"]',
				'trust_level = "untrusted"',
				"",
			].join("\n"),
		);

		const preview = await previewSbsCodexConfigPatch({
			env: { CODEX_HOME: codexHome },
		});
		expect(preview.changed).toBe(true);
		expect(preview.diff).toContain("[profiles.sbs-doctor-readonly]");

		const applied = await applySbsCodexConfigPatch({
			env: { CODEX_HOME: codexHome },
		});
		const inspection = await inspectCodexConfig({
			env: { CODEX_HOME: codexHome },
			repositoryRoot: "/tmp/repo",
		});

		expect(applied.backupPath).toMatch(
			new RegExp(`${escapeRegExp(configPath)}\\.sbs-backup-\\d+`),
		);
		expect(await readFile(configPath, "utf8")).toContain(
			'[permissions.sbs-workspace-write.filesystem.":project_roots"]',
		);
		expect(inspection.hasExplicitUntrustedProject).toBe(true);

		await rollbackSbsCodexConfigPatch({
			backupPath: applied.backupPath ?? "",
			env: { CODEX_HOME: codexHome },
		});
		expect(await readFile(configPath, "utf8")).not.toContain(
			'[permissions.sbs-workspace-write.filesystem.":project_roots"]',
		);
	});
});

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
