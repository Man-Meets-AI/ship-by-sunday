import { importDraftFromFile } from "../draft/draft-store";
import { writeJsonResult } from "../cli-json";
import type { CliIo } from "../run-cli";

export async function handleImportCommand({
	io,
	projectRootPath,
	filePath,
	json,
}: {
	io: CliIo;
	projectRootPath: string;
	filePath: string;
	json: boolean;
}) {
	const draft = await importDraftFromFile(projectRootPath, filePath);
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
