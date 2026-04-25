import process from "node:process";

import { runCli as runRuntimeIntakeCli } from "../../apps/web/scripts/export-runtime-intake.mjs";
import { buildEngineeringIntakeSnapshot } from "./lib/engineering-intake-contract.mjs";
import { runCli as runReleaseIntakeCli } from "./export-release-intake.mjs";

function parseArgs(argv) {
	const options = {
		generatedAt: null,
		outputPath: null,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current?.startsWith("--output=")) {
			options.outputPath = current.slice("--output=".length);
			continue;
		}

		if (current === "--output") {
			options.outputPath = argv[index + 1] ?? null;
			index += 1;
		}

		if (current?.startsWith("--generated-at=")) {
			options.generatedAt = current.slice("--generated-at=".length);
			continue;
		}

		if (current === "--generated-at") {
			options.generatedAt = argv[index + 1] ?? null;
			index += 1;
		}
	}

	return options;
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	runRuntimeCli = runRuntimeIntakeCli,
	runReleaseCli = runReleaseIntakeCli,
	writeFileImpl,
} = {}) {
	const { generatedAt, outputPath } = parseArgs(args);
	const runtimeArgs = generatedAt ? ["--generated-at", generatedAt] : [];
	const releaseArgs = generatedAt ? ["--generated-at", generatedAt] : [];
	const runtimeResult = await runRuntimeCli({ args: runtimeArgs, env });
	const releaseResult = await runReleaseCli({ args: releaseArgs, env });
	const document = buildEngineeringIntakeSnapshot({
		generatedAt: generatedAt ?? new Date().toISOString(),
		runtime: runtimeResult.document,
		release: releaseResult.document,
	});

	if (outputPath) {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const resolvedOutputPath = path.isAbsolute(outputPath)
			? outputPath
			: path.resolve(process.cwd(), outputPath);
		await fs.mkdir(path.dirname(resolvedOutputPath), { recursive: true });
		await (writeFileImpl ?? fs.writeFile)(
			resolvedOutputPath,
			`${JSON.stringify(document, null, 2)}\n`,
			"utf8",
		);
	}

	return {
		document,
		release: releaseResult.document,
		runtime: runtimeResult.document,
	};
}

const isEntrypoint =
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isEntrypoint) {
	try {
		const { document } = await runCli();
		process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : "Engineering intake snapshot export failed.");
		process.exitCode = 1;
	}
}
