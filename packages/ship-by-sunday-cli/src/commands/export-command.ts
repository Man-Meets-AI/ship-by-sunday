import { exportDraftToFile, readLocalDraftSource } from "../draft/draft-store";
import { writeJsonResult } from "../cli-json";
import type { CliIo } from "../run-cli";

export async function handleExportCommand({
	io,
	projectRootPath,
	outPath,
	json,
}: {
	io: CliIo;
	projectRootPath: string;
	outPath: string;
	json: boolean;
}) {
	if (outPath === "-") {
		io.write(await readLocalDraftSource(projectRootPath));
		return 0;
	}

	const exportedPath = await exportDraftToFile(projectRootPath, outPath);
	if (json) {
		writeJsonResult(io, "export", {
			outPath: exportedPath,
		});
		return 0;
	}
	io.write(`Exported draft to ${exportedPath}`);
	return 0;
}
