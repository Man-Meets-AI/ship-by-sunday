import path from "node:path";

import {
	READY_DIRECTORY,
	buildCutOptionsFromArgv,
	buildLessonMediaEntry,
	createAuphonicProduction,
	createTempCutPath,
	createBunnyVideo,
	createRunId,
	createTempDownloadPath,
	downloadAuphonicVideoOutput,
	ensureVideoCutPythonReady,
	getVideoOutputCandidate,
	getRepoLessons,
	getRequiredEnv,
	listReadyFileNames,
	moveFileToProcessed,
	parseOnlyFileNames,
	parseReplaceLessonIds,
	readExistingLessonMedia,
	runVideoCutStage,
	validateReadyVideoFiles,
	waitForAuphonicProduction,
	waitForBunnyVideoReady,
	writeLessonMediaModule,
	writeRunReport,
	uploadBunnyVideo,
} from "./lib/lesson-video-pipeline.mjs";

async function main() {
	const runId = createRunId();
	const replaceLessonIds = parseReplaceLessonIds(process.argv.slice(2));
	const onlyFileNames = parseOnlyFileNames(process.argv.slice(2));
	const cutOptions = buildCutOptionsFromArgv(process.argv.slice(2));
	const auphonicApiKey = getRequiredEnv("AUPHONIC_API_KEY");
	const auphonicPresetId = getRequiredEnv("AUPHONIC_PRESET_ID");
	const bunnyApiKey = getRequiredEnv("BUNNY_STREAM_API_KEY");
	const bunnyLibraryId = Number.parseInt(
		getRequiredEnv("BUNNY_STREAM_LIBRARY_ID"),
		10,
	);

	if (!Number.isFinite(bunnyLibraryId)) {
		throw new Error("BUNNY_STREAM_LIBRARY_ID must be a number.");
	}

	const lessons = await getRepoLessons();
	const existingMedia = await readExistingLessonMedia();
	const allReadyFileNames = await listReadyFileNames();
	const readyFileNames =
		onlyFileNames.size > 0
			? allReadyFileNames.filter((fileName) => onlyFileNames.has(fileName))
			: allReadyFileNames;
	const report = {
		runId,
		startedAt: new Date().toISOString(),
		readyDirectory: READY_DIRECTORY,
		replaceLessonIds: [...replaceLessonIds].sort(),
		onlyFileNames: [...onlyFileNames].sort(),
		allReadyFileNames,
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
		existingMedia,
		replaceLessonIds,
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

	const nextMedia = { ...existingMedia };

	if (!cutOptions.skipCut) {
		await ensureVideoCutPythonReady(cutOptions);
	}

	for (const item of readyItems) {
		const sourcePath = path.join(READY_DIRECTORY, item.fileName);
		let auphonicInputPath = sourcePath;
		const bunnyTitle =
			item.attachmentMode === "lesson"
				? `${item.lessonId} — ${item.lessonTitle}`
				: `${item.sourceKey} — ${item.slug}`;

		console.log(
			item.attachmentMode === "lesson"
				? `Publishing ${item.fileName} -> lesson ${item.lessonId}`
				: `Publishing ${item.fileName} as unattached media`,
		);

		try {
			let cutResult = null;
			let cutPath = null;
			if (!cutOptions.skipCut) {
				cutPath = await createTempCutPath(runId, item.fileName);
				cutResult = await runVideoCutStage({
					sourcePath,
					cutPath,
					options: cutOptions,
				});
				auphonicInputPath = cutPath;
			}

			const production = await createAuphonicProduction({
				apiKey: auphonicApiKey,
				presetId: auphonicPresetId,
				filePath: auphonicInputPath,
				title: bunnyTitle,
			});
			const completedProduction = await waitForAuphonicProduction({
				apiKey: auphonicApiKey,
				uuid: production.uuid,
			});
			const outputFile = getVideoOutputCandidate(
				completedProduction.output_files ?? [],
			);
			const tempDownloadPath = await createTempDownloadPath(
				runId,
				item.fileName,
				outputFile,
			);
			const { outputFile: downloadedOutputFile } =
				await downloadAuphonicVideoOutput({
					apiKey: auphonicApiKey,
					production: completedProduction,
					destinationPath: tempDownloadPath,
				});
			const bunnyVideo = await createBunnyVideo({
				apiKey: bunnyApiKey,
				libraryId: bunnyLibraryId,
				title: bunnyTitle,
			});
			await uploadBunnyVideo({
				apiKey: bunnyApiKey,
				libraryId: bunnyLibraryId,
				videoId: bunnyVideo.guid,
				filePath: tempDownloadPath,
			});
			const readyBunnyVideo = await waitForBunnyVideoReady({
				apiKey: bunnyApiKey,
				libraryId: bunnyLibraryId,
				videoId: bunnyVideo.guid,
			});

			if (item.attachmentMode === "lesson") {
				nextMedia[item.lessonId] = buildLessonMediaEntry({
					libraryId: bunnyLibraryId,
					videoId: bunnyVideo.guid,
					lessonTitle: item.lessonTitle,
					bunnyVideo: readyBunnyVideo,
				});
				await writeLessonMediaModule(nextMedia);
			}
			const processedPath = await moveFileToProcessed(item.fileName, runId);

			report.successes.push({
				fileName: item.fileName,
				sourceKey: item.sourceKey,
				attachedToLesson:
					item.attachmentMode === "lesson" ? item.lessonId : null,
				cutPath,
				cutStats: cutResult,
				auphonicProductionId: completedProduction.uuid,
				auphonicOutputEnding: downloadedOutputFile?.ending ?? null,
				bunnyVideoId: bunnyVideo.guid,
				processedPath,
			});
			console.log(`Published ${item.fileName} -> Bunny ${bunnyVideo.guid}`);
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
		`Video publish complete: ${report.successes.length} succeeded, ${report.failures.length} failed.`,
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
