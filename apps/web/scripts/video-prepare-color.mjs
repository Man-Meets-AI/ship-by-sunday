import path from "node:path";

import {
	buildCutOptionsFromArgv,
	createRunId,
	ensureVideoCutPythonReady,
	getRepoLessons,
	getRequiredEnv,
	listReadyFileNames,
	moveDownloadedOutputToColorCorrection,
	moveFileToProcessed,
	parseOnlyFileNames,
	READY_DIRECTORY,
	runCutAndAuphonicDownloadStage,
	validateReadyVideoFiles,
	writeRunReport,
} from "./lib/lesson-video-pipeline.mjs";

async function main() {
	const runId = createRunId();
	const onlyFileNames = parseOnlyFileNames(process.argv.slice(2));
	const cutOptions = buildCutOptionsFromArgv(process.argv.slice(2));
	const auphonicApiKey = getRequiredEnv("AUPHONIC_API_KEY");
	const auphonicPresetId = getRequiredEnv("AUPHONIC_PRESET_ID");
	const lessons = await getRepoLessons();
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
		validationErrors: [],
	};

	if (onlyFileNames.size > 0) {
		const missingFileNames = [...onlyFileNames].filter(
			(fileName) => !allReadyFileNames.includes(fileName),
		);
		if (missingFileNames.length > 0) {
			const reportPath = await writeRunReport(runId, {
				...report,
				validationErrors: missingFileNames.map(
					(fileName) => `${fileName}: not found in ${READY_DIRECTORY}.`,
				),
				completedAt: new Date().toISOString(),
			});
			for (const fileName of missingFileNames) {
				console.error(`Validation error: ${fileName} not found in Ready.`);
			}
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

	const { readyItems, errors } = validateReadyVideoFiles({
		fileNames: readyFileNames,
		validLessons: lessons,
		existingMedia: {},
		replaceLessonIds: new Set(),
	});

	if (errors.length > 0) {
		const reportPath = await writeRunReport(runId, {
			...report,
			validationErrors: errors,
			completedAt: new Date().toISOString(),
		});
		for (const error of errors) {
			console.error(`Validation error: ${error}`);
		}
		console.error(`Run report: ${reportPath}`);
		process.exit(1);
	}

	if (!cutOptions.skipCut) {
		await ensureVideoCutPythonReady(cutOptions);
	}

	for (const item of readyItems) {
		const sourcePath = path.join(READY_DIRECTORY, item.fileName);

		console.log(
			item.attachmentMode === "lesson"
				? `Preparing ${item.fileName} -> lesson ${item.lessonId} for color correction`
				: `Preparing ${item.fileName} as unattached media for color correction`,
		);

		try {
			const stageResult = await runCutAndAuphonicDownloadStage({
				runId,
				item,
				sourcePath,
				cutOptions,
				auphonicApiKey,
				auphonicPresetId,
			});
			const colorCorrectionPath = await moveDownloadedOutputToColorCorrection({
				sourcePath: stageResult.downloadPath,
				fileName: item.fileName,
				runId,
				outputFile: stageResult.downloadedOutputFile,
			});
			const processedPath = await moveFileToProcessed(item.fileName, runId);

			report.successes.push({
				fileName: item.fileName,
				sourceKey: item.sourceKey,
				attachedToLesson:
					item.attachmentMode === "lesson" ? item.lessonId : null,
				cutPath: stageResult.cutPath,
				cutStats: stageResult.cutResult,
				auphonicProductionId: stageResult.completedProduction.uuid,
				auphonicOutputEnding: stageResult.downloadedOutputFile?.ending ?? null,
				colorCorrectionPath,
				processedPath,
			});
			console.log(`Prepared ${item.fileName} -> ${colorCorrectionPath}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			report.failures.push({
				fileName: item.fileName,
				sourceKey: item.sourceKey,
				attachedToLesson:
					item.attachmentMode === "lesson" ? item.lessonId : null,
				cutOptions,
				error: message,
			});
			console.error(`Failed ${item.fileName}: ${message}`);
		}
	}

	const reportPath = await writeRunReport(runId, {
		...report,
		completedAt: new Date().toISOString(),
	});

	console.log(
		`Video color prep complete: ${report.successes.length} succeeded, ${report.failures.length} failed.`,
	);
	console.log(`Run report: ${reportPath}`);

	if (report.failures.length > 0) {
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
