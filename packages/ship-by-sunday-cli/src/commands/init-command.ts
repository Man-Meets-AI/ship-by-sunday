import { getDraftFilePath } from "../draft/draft-paths";
import { initializeLocalDraft } from "../draft/draft-store";
import { writeJsonResult } from "../cli-json";
import type { CliFixtureName } from "../parse-cli-command";
import type { CliIo } from "../run-cli";

export async function handleInitCommand({
	io,
	repoRootPath,
	fixture,
	force,
	json,
}: {
	io: CliIo;
	repoRootPath: string;
	fixture: CliFixtureName;
	force: boolean;
	json: boolean;
}) {
	const draft = await initializeLocalDraft({
		repoRootPath,
		fixture,
		force,
	});
	const draftFilePath = getDraftFilePath(repoRootPath);

	if (json) {
		writeJsonResult(io, "init", {
			fixture,
			draftFilePath,
			productKey: draft.productKey,
			productName: draft.facts.product_name ?? null,
		});
		return 0;
	}

	io.write(`Initialized ${fixture} draft at ${draftFilePath}`);
	return 0;
}
