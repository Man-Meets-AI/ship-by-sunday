import path from "node:path";

import {
	READY_DIRECTORY,
	buildCutOptionsFromArgv,
	createRunId,
	createTempCutPath,
	ensureVideoCutPythonReady,
	listReadyFileNames,
	parseOnlyFileNames,
	runVideoCutStage,
	writeRunReport,
} from "./lib/lesson-video-pipeline.mjs";

async function main() {
	const runId = createRunId();
	const onlyFileNames = parseOnlyFileNames(process.argv.slice(2));
	const cutOptions = buildCutOptionsFromArgv(process.argv.slice(2));
	const allReadyFileNames = await listReadyFileNames();
	const readyFileNames =
		onlyFileNames.size > 0
			? allReadyFileNames.filter((fileName) => onlyFileNames.has(fileName))
			: allReadyFileNames;

	const report = {
		runId,
		startedAt: new Date().toISOString(),
		readyDirectory: READY_DIRECTORY,
		onlyFileNames: [...onlyFileNames].sort(),
		readyFileNames,
		cutOptions,
		successes: [],
		failures: [],
	};

	if (onlyFileNames.size > 0) {
		const missingFileNames = [...onlyFileNames].filter(
			(fileName) => !allReadyFileNames.includes(fileName),
		);
		if (missingFileNames.length > 0) {
			const reportPath = await writeRunReport(runId, {
				...report,
				failures: missingFileNames.map((fileName) => ({
					fileName,
					error: `${fileName}: not found in ${READY_DIRECTORY}.`,
				})),
				completedAt: new Date().toISOString(),
			});
			console.error(`Run report: ${reportPath}`);
			process.exit(1);
		}
	}

	if (readyFileNames.length === 0) {
		const reportPath = await writeRunReport(runId, {
			...report,
			completedAt: new Date().toISOString(),
		});
		console.log(`No lesson videos found in ${READY_DIRECTORY}.`);
		console.log(`Run report: ${reportPath}`);
		return;
	}

	await ensureVideoCutPythonReady(cutOptions);

	for (const fileName of readyFileNames) {
		const sourcePath = path.join(READY_DIRECTORY, fileName);
		const cutPath = await createTempCutPath(runId, fileName);

		try {
			const result = await runVideoCutStage({
				sourcePath,
				cutPath,
				options: cutOptions,
			});
			report.successes.push({
				fileName,
				sourcePath,
				cutPath,
				...result,
			});
			console.log(`Cut ${fileName} -> ${cutPath}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			report.failures.push({
				fileName,
				error: message,
			});
			console.error(`Failed ${fileName}: ${message}`);
		}
	}

	const reportPath = await writeRunReport(runId, {
		...report,
		completedAt: new Date().toISOString(),
	});
	console.log(`Run report: ${reportPath}`);

	if (report.failures.length > 0) {
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
