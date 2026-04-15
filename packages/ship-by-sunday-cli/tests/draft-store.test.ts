import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	buildDesignPresetFactSeed,
	createCompleteProjectDefinition,
	createCanonicalProjectDefinitionDraft,
} from "@shipbysunday/blueprint-compiler";
import {
	applyDraftPatchFromFile,
	exportDraftToFile,
	importDraftFromFile,
	saveLocalDraft,
	loadLocalDraft,
} from "../src/draft/draft-store";
import {
	getDraftFilePath,
	getDraftDirectoryPath,
	getDraftTempFilePath,
} from "../src/draft/draft-paths";
import { getBlueprintStageDefinition } from "../src/field-contract";
import { createTemporaryRepoRoot } from "./test-helpers";

describe("draft store", () => {
	it("imports a complete definition and exports the draft envelope", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const importFilePath = path.join(repoRootPath, "import.json");
		await writeFile(
			importFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);

		const importedDraft = await importDraftFromFile(
			repoRootPath,
			importFilePath,
		);
		const exportFilePath = path.join(repoRootPath, "export.json");
		const exportedPath = await exportDraftToFile(repoRootPath, exportFilePath);
		const exportedDraft = JSON.parse(await readFile(exportedPath, "utf8"));

		expect(importedDraft.facts.product_name).toBe("Ship by Sunday OS");
		expect(exportedDraft.facts.product_name).toBe("Ship by Sunday OS");
		expect(await loadLocalDraft(repoRootPath)).not.toBeNull();
	});

	it("imports an agent-style envelope with a facts object", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const importFilePath = path.join(repoRootPath, "facts-envelope.json");
		await writeFile(
			importFilePath,
			JSON.stringify({
				facts: {
					product_name: "Envelope import",
				},
			}),
		);

		const importedDraft = await importDraftFromFile(
			repoRootPath,
			importFilePath,
		);

		expect(importedDraft.facts.product_name).toBe("Envelope import");
	});

	it("re-seeds coupled design fields when importing legacy facts with only design_preset_id", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const importFilePath = path.join(repoRootPath, "legacy-design-preset.json");
		await writeFile(
			importFilePath,
			JSON.stringify({
				schemaVersion: 1,
				clerkUserId: "local-cli-user",
				productKey: "ship-by-sunday",
				facts: {
					product_name: "Legacy import",
					design_preset_id: "notion",
				},
				placeholdersInUse: [],
				createdAt: 1,
				updatedAt: 1,
			}),
		);

		const importedDraft = await importDraftFromFile(
			repoRootPath,
			importFilePath,
		);

		expect(importedDraft.facts.design_preset_id).toBe("notion");
		expect(importedDraft.facts.theme_preset).toBe(
			buildDesignPresetFactSeed("notion").theme_preset,
		);
		expect(importedDraft.facts.design_references).toEqual([
			"https://getdesign.md/notion/design-md",
		]);
	});

	it("rejects an invalid import without replacing the existing draft", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const existingDraft = createCanonicalProjectDefinitionDraft({
			clerkUserId: "local-cli-user",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Existing draft",
			},
		});
		await saveLocalDraft(repoRootPath, existingDraft);

		const invalidImportFilePath = path.join(repoRootPath, "invalid.json");
		await writeFile(
			invalidImportFilePath,
			JSON.stringify({ facts: { nope: true } }),
		);

		await expect(
			importDraftFromFile(repoRootPath, invalidImportFilePath),
		).rejects.toThrow();
		expect((await loadLocalDraft(repoRootPath))?.facts.product_name).toBe(
			"Existing draft",
		);
		expect(getDraftFilePath(repoRootPath)).toContain(".ship-by-sunday");
	});

	it("recovers a valid temp draft when no final draft exists", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await mkdir(getDraftDirectoryPath(repoRootPath), { recursive: true });
		const draft = createCanonicalProjectDefinitionDraft({
			clerkUserId: "local-cli-user",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Recovered from temp",
			},
		});
		await writeFile(
			getDraftTempFilePath(repoRootPath),
			JSON.stringify(draft, null, 2),
		);

		const loadedDraft = await loadLocalDraft(repoRootPath);

		expect(loadedDraft?.facts.product_name).toBe("Recovered from temp");
		await expect(
			readFile(getDraftFilePath(repoRootPath), "utf8"),
		).resolves.toContain("Recovered from temp");
	});

	it("prefers the final draft when both final and temp files exist", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await mkdir(getDraftDirectoryPath(repoRootPath), { recursive: true });
		const finalDraft = createCanonicalProjectDefinitionDraft({
			clerkUserId: "local-cli-user",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Final draft wins",
			},
		});
		const tempDraft = createCanonicalProjectDefinitionDraft({
			clerkUserId: "local-cli-user",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Temporary draft loses",
			},
		});

		await writeFile(
			getDraftFilePath(repoRootPath),
			JSON.stringify(finalDraft, null, 2),
		);
		await writeFile(
			getDraftTempFilePath(repoRootPath),
			JSON.stringify(tempDraft, null, 2),
		);

		const loadedDraft = await loadLocalDraft(repoRootPath);

		expect(loadedDraft?.facts.product_name).toBe("Final draft wins");
		expect(
			JSON.parse(await readFile(getDraftFilePath(repoRootPath), "utf8")).facts
				.product_name,
		).toBe("Final draft wins");
	});

	it("fails with a stable invalid_state when a leftover temp draft is corrupt", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await mkdir(getDraftDirectoryPath(repoRootPath), { recursive: true });
		const tempFilePath = getDraftTempFilePath(repoRootPath);
		await writeFile(tempFilePath, "{ not valid json");

		await expect(loadLocalDraft(repoRootPath)).rejects.toMatchObject({
			code: "invalid_state",
			message: expect.stringContaining(tempFilePath),
		});
	});

	it("re-seeds coupled design fields when applying a stage patch with only design_preset_id", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await saveLocalDraft(
			repoRootPath,
			createCanonicalProjectDefinitionDraft({
				clerkUserId: "local-cli-user",
				productKey: "ship-by-sunday",
				facts: {},
			}),
		);
		const patchFilePath = path.join(repoRootPath, "design-patch.json");
		await writeFile(
			patchFilePath,
			JSON.stringify({
				design_preset_id: "notion",
			}),
		);

		const nextDraft = await applyDraftPatchFromFile(
			repoRootPath,
			getBlueprintStageDefinition("blueprint"),
			patchFilePath,
		);

		expect(nextDraft.facts.design_preset_id).toBe("notion");
		expect(nextDraft.facts.theme_preset).toBe(
			buildDesignPresetFactSeed("notion").theme_preset,
		);
		expect(nextDraft.facts.design_references).toEqual([
			"https://getdesign.md/notion/design-md",
		]);
	});
});
