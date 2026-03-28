import { importDraftFromFile } from "../draft/draft-store";
import { writeJsonResult } from "../cli-json";
import type { CliIo } from "../run-cli";

export async function handleImportCommand({
	io,
	repoRootPath,
	filePath,
	json,
}: {
	io: CliIo;
	repoRootPath: string;
	filePath: string;
	json: boolean;
}) {
	const draft = await importDraftFromFile(repoRootPath, filePath);
	if (json) {
		writeJsonResult(io, "import", {
			filePath,
			productKey: draft.productKey,
			productName: draft.facts.product_name ?? null,
		});
		return 0;
	}
	io.write(`Imported draft from ${filePath}`);
	return 0;
}
