import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
	applySbsCodexConfigPatch,
	applyShipbysundayWorkerCodexConfigPatch,
	inspectCodexConfig,
	inspectShipbysundayWorkerCodexConfig,
	previewSbsCodexConfigPatch,
	previewShipbysundayWorkerCodexConfigPatch,
	rollbackSbsCodexConfigPatch,
	rollbackShipbysundayWorkerCodexConfigPatch,
	SHIPBYSUNDAY_WORKER_CODEX_BLOCK_END,
	SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START,
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

	it("previews and applies the Worker managed block without changing unrelated config", async () => {
		const codexHome = await createTemporaryDirectory("sbs-worker-codex-");
		const configPath = path.join(codexHome, "config.toml");
		await writeFile(
			configPath,
			[
				'model = "gpt-5.5"',
				'approval_policy = "on-request"',
				"",
				"[profiles.personal-audit]",
				'sandbox_mode = "read-only"',
				"",
			].join("\n"),
		);

		const preview = await previewShipbysundayWorkerCodexConfigPatch({
			env: { CODEX_HOME: codexHome },
		});
		expect(preview.changed).toBe(true);
		expect(preview.diff).toContain(SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START);
		expect(preview.diff).toContain(
			"[profiles.shipbysunday-worker-project-write]",
		);

		const applied = await applyShipbysundayWorkerCodexConfigPatch({
			env: { CODEX_HOME: codexHome },
		});
		const contents = await readFile(configPath, "utf8");
		const inspection = await inspectShipbysundayWorkerCodexConfig({
			env: { CODEX_HOME: codexHome },
		});

		expect(applied.backupPath).toMatch(
			new RegExp(
				`${escapeRegExp(configPath)}\\.shipbysunday-worker-backup-\\d+`,
			),
		);
		expect(contents).toContain(SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START);
		expect(contents).toContain(SHIPBYSUNDAY_WORKER_CODEX_BLOCK_END);
		expect(contents).toContain("[profiles.personal-audit]");
		expect(contents).toContain("[profiles.shipbysunday-worker-readonly]");
		expect(contents).toContain("[profiles.shipbysunday-worker-project-write]");
		expect(inspection.hasReadonlyProfile).toBe(true);
		expect(inspection.hasProjectWriteProfile).toBe(true);
		expect(inspection.hasReadonlyPermissions).toBe(true);
		expect(inspection.hasProjectWritePermissions).toBe(true);

		await rollbackShipbysundayWorkerCodexConfigPatch({
			backupPath: applied.backupPath ?? "",
			env: { CODEX_HOME: codexHome },
		});
		const rolledBackContents = await readFile(configPath, "utf8");
		expect(rolledBackContents).toContain("[profiles.personal-audit]");
		expect(rolledBackContents).not.toContain(
			"[profiles.shipbysunday-worker-readonly]",
		);
	});

	it("detects explicit untrusted projects when inspecting Worker config", async () => {
		const codexHome = await createTemporaryDirectory("sbs-worker-trust-");
		const configPath = path.join(codexHome, "config.toml");
		await writeFile(
			configPath,
			[
				'[projects."/tmp/repo"]',
				'trust_level = "untrusted"',
				"",
				'[projects."/tmp/other"]',
				'trust_level = "trusted"',
				"",
			].join("\n"),
		);

		await applyShipbysundayWorkerCodexConfigPatch({
			env: { CODEX_HOME: codexHome },
		});

		const repoInspection = await inspectShipbysundayWorkerCodexConfig({
			env: { CODEX_HOME: codexHome },
			repositoryRoot: "/tmp/repo",
		});
		const otherInspection = await inspectShipbysundayWorkerCodexConfig({
			env: { CODEX_HOME: codexHome },
			repositoryRoot: "/tmp/other",
		});

		expect(repoInspection.hasExplicitUntrustedProject).toBe(true);
		expect(otherInspection.hasExplicitUntrustedProject).toBe(false);
	});

	it("keeps Worker profiles separate from legacy SBS profiles", async () => {
		const workerCodexHome = await createTemporaryDirectory("sbs-worker-only-");
		await applyShipbysundayWorkerCodexConfigPatch({
			env: { CODEX_HOME: workerCodexHome },
		});

		const legacyInspection = await inspectCodexConfig({
			env: { CODEX_HOME: workerCodexHome },
		});
		expect(legacyInspection.hasReadonlyProfile).toBe(false);
		expect(legacyInspection.hasWorkspaceWriteProfile).toBe(false);
		expect(legacyInspection.hasReadonlyPermissions).toBe(false);
		expect(legacyInspection.hasWorkspaceWritePermissions).toBe(false);

		const legacyCodexHome = await createTemporaryDirectory("sbs-legacy-only-");
		await applySbsCodexConfigPatch({
			env: { CODEX_HOME: legacyCodexHome },
		});

		const workerInspection = await inspectShipbysundayWorkerCodexConfig({
			env: { CODEX_HOME: legacyCodexHome },
		});
		expect(workerInspection.hasReadonlyProfile).toBe(false);
		expect(workerInspection.hasProjectWriteProfile).toBe(false);
		expect(workerInspection.hasReadonlyPermissions).toBe(false);
		expect(workerInspection.hasProjectWritePermissions).toBe(false);
	});
});

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
