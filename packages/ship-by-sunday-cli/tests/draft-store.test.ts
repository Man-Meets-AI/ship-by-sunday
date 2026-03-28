import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	createCompleteProjectDefinition,
	createCanonicalProjectDefinitionDraft,
} from "@manmeetsai/packet-compiler";
import {
	exportDraftToFile,
	importDraftFromFile,
	saveLocalDraft,
	loadLocalDraft,
} from "../src/draft/draft-store";
import { getDraftFilePath } from "../src/draft/draft-paths";
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
});
