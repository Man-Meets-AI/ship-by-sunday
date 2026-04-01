import { mkdir, readFile, writeFile } from "node:fs/promises";
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
import {
	getDraftFilePath,
	getDraftDirectoryPath,
	getDraftTempFilePath,
} from "../src/draft/draft-paths";
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
});
