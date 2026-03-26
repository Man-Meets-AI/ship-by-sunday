import path from "node:path";
import { readdir, writeFile } from "node:fs/promises";

import {
	BUNNY_UPLOADED_DIRECTORY,
	buildBunnyEmbedUrl,
	createBunnyVideo,
	createRunId,
	getRequiredEnv,
	moveColorGradedFileToBunnyUploaded,
	parseOnlyFileNames,
	uploadBunnyVideo,
	waitForBunnyVideoReady,
	writeRunReport,
	COLOR_GRADED_DIRECTORY,
} from "./lib/lesson-video-pipeline.mjs";

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
	".avi",
	".m4v",
	".mkv",
	".mov",
	".mp4",
	".webm",
]);

function parseUploadItems(fileNames) {
	const errors = [];
	const uploadItems = [];

	for (const fileName of [...fileNames].sort()) {
		const extension = path.extname(fileName).toLowerCase();
		if (!SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
			errors.push(`${fileName}: unsupported video extension.`);
			continue;
		}

		const baseName = path.basename(fileName, extension);
		const match = baseName.match(/^([A-Za-z0-9.-]+)--(.+)$/);
		if (!match) {
			errors.push(
				`${fileName}: expected <sourceKey>--<slug>.<video extension>.`,
			);
			continue;
		}

		uploadItems.push({
			fileName,
			sourceKey: match[1],
			slug: match[2],
		});
	}

	return { uploadItems, errors };
}

function parseUploadOptions(argv) {
	const options = {
		replaceReportPath: null,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		if (!current) {
			continue;
		}

		if (current.startsWith("--replace-report=")) {
			options.replaceReportPath =
				current.slice("--replace-report=".length).trim() || null;
			continue;
		}

		if (current === "--replace-report") {
			options.replaceReportPath = (argv[index + 1] ?? "").trim() || null;
			index += 1;
		}
	}

	return options;
}

function renderBunnyLinksMarkdown(report) {
	const lines = [
		"# Bunny Upload Links",
		"",
		`Run ID: ${report.runId}`,
		`Library ID: ${report.bunnyLibraryId}`,
		report.replaceReportPath
			? `Replacement Source Report: ${report.replaceReportPath}`
			: "Replacement Source Report: none",
		"",
	];

	for (const item of report.successes) {
		lines.push(`- ${item.fileName}`);
		lines.push(`  - Bunny video ID: ${item.bunnyVideoId}`);
		lines.push(`  - Embed URL: ${item.embedUrl}`);
		lines.push(`  - Uploaded file: ${item.uploadedPath}`);
	}

	return `${lines.join("\n")}\n`;
}

async function listColorGradedFileNames() {
	const entries = await readdir(COLOR_GRADED_DIRECTORY, {
		withFileTypes: true,
	});
	return entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((fileName) =>
			SUPPORTED_VIDEO_EXTENSIONS.has(path.extname(fileName).toLowerCase()),
		)
		.sort();
}

async function main() {
	const runId = createRunId();
	const onlyFileNames = parseOnlyFileNames(process.argv.slice(2));
	const uploadOptions = parseUploadOptions(process.argv.slice(2));
	const bunnyApiKey = getRequiredEnv("BUNNY_STREAM_API_KEY");
	const bunnyLibraryId = Number.parseInt(
		getRequiredEnv("BUNNY_STREAM_LIBRARY_ID"),
		10,
	);

	if (!Number.isFinite(bunnyLibraryId)) {
		throw new Error("BUNNY_STREAM_LIBRARY_ID must be a number.");
	}

	const allColorGradedFileNames = await listColorGradedFileNames();
	const inputFileNames =
		onlyFileNames.size > 0
			? allColorGradedFileNames.filter((fileName) =>
					onlyFileNames.has(fileName),
				)
			: allColorGradedFileNames;
	const report = {
		runId,
		startedAt: new Date().toISOString(),
		inputDirectory: COLOR_GRADED_DIRECTORY,
		uploadedDirectory: BUNNY_UPLOADED_DIRECTORY,
		onlyFileNames: [...onlyFileNames].sort(),
		inputFileNames,
		bunnyLibraryId,
		replaceReportPath: uploadOptions.replaceReportPath,
		successes: [],
		failures: [],
		validationErrors: [],
	};

	if (uploadOptions.replaceReportPath) {
		throw new Error(
			"In-place Bunny replacement is not supported by this upload path. Upload the corrected set as a fresh run and delete the old Bunny video IDs from the previous report.",
		);
	}

	if (onlyFileNames.size > 0) {
		const missingFileNames = [...onlyFileNames].filter(
			(fileName) => !allColorGradedFileNames.includes(fileName),
		);
		if (missingFileNames.length > 0) {
			const reportPath = await writeRunReport(runId, {
				...report,
				validationErrors: missingFileNames.map(
					(fileName) => `${fileName}: not found in ${COLOR_GRADED_DIRECTORY}.`,
				),
				completedAt: new Date().toISOString(),
			});
			for (const fileName of missingFileNames) {
				console.error(
					`Validation error: ${fileName} not found in Color Graded.`,
				);
			}
			console.error(`Run report: ${reportPath}`);
			process.exit(1);
		}
	}

	if (inputFileNames.length === 0) {
		const reportPath = await writeRunReport(runId, {
			...report,
			completedAt: new Date().toISOString(),
		});
		console.log(`No graded videos found in ${COLOR_GRADED_DIRECTORY}.`);
		console.log(`Run report: ${reportPath}`);
		return;
	}

	const { uploadItems, errors } = parseUploadItems(inputFileNames);

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

	for (const item of uploadItems) {
		const inputPath = path.join(COLOR_GRADED_DIRECTORY, item.fileName);
		const title = `${item.sourceKey} — ${item.slug}`;

		console.log(`Uploading ${item.fileName} to Bunny...`);

		try {
			const bunnyVideoId = (
				await createBunnyVideo({
					apiKey: bunnyApiKey,
					libraryId: bunnyLibraryId,
					title,
				})
			).guid;
			await uploadBunnyVideo({
				apiKey: bunnyApiKey,
				libraryId: bunnyLibraryId,
				videoId: bunnyVideoId,
				filePath: inputPath,
			});
			await waitForBunnyVideoReady({
				apiKey: bunnyApiKey,
				libraryId: bunnyLibraryId,
				videoId: bunnyVideoId,
			});
			const uploadedPath = await moveColorGradedFileToBunnyUploaded(
				item.fileName,
				runId,
			);

			report.successes.push({
				fileName: item.fileName,
				sourceKey: item.sourceKey,
				bunnyVideoId,
				embedUrl: buildBunnyEmbedUrl(bunnyLibraryId, bunnyVideoId),
				uploadedPath,
			});
			console.log(`Uploaded ${item.fileName} -> Bunny ${bunnyVideoId}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			report.failures.push({
				fileName: item.fileName,
				sourceKey: item.sourceKey,
				error: message,
			});
			console.error(`Failed ${item.fileName}: ${message}`);
		}
	}

	const reportPath = await writeRunReport(runId, {
		...report,
		completedAt: new Date().toISOString(),
	});
	const linksPath = reportPath.replace(/\.json$/, ".links.md");
	await writeFile(linksPath, renderBunnyLinksMarkdown(report));

	console.log(
		`Video Bunny upload complete: ${report.successes.length} succeeded, ${report.failures.length} failed.`,
	);
	console.log(`Run report: ${reportPath}`);
	console.log(`Links manifest: ${linksPath}`);

	if (report.failures.length > 0) {
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
