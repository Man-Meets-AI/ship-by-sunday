import { spawn } from "node:child_process";
import { createWriteStream, openAsBlob } from "node:fs";
import {
	copyFile,
	mkdir,
	readdir,
	readFile,
	rename,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const RAW_FOOTAGE_ROOT =
	"/Volumes/2TB SSD Video/Movies/Ship by Sunday Raw Footage";
export const READY_DIRECTORY = path.join(RAW_FOOTAGE_ROOT, "Ready");
export const COLOR_CORRECTION_DIRECTORY = path.join(
	RAW_FOOTAGE_ROOT,
	"Color Correction",
);
export const COLOR_GRADED_DIRECTORY = path.join(
	RAW_FOOTAGE_ROOT,
	"Color Graded",
);
export const BUNNY_UPLOADED_DIRECTORY = path.join(
	RAW_FOOTAGE_ROOT,
	"Bunny Uploaded",
);
export const PROCESSED_DIRECTORY = path.join(RAW_FOOTAGE_ROOT, "Processed");
export const REPORT_DIRECTORY = path.join(
	process.cwd(),
	"output",
	"video-pipeline",
);
export const VIDEO_CUT_VENV_PATH = path.join(process.cwd(), ".venv-video");
export const VIDEO_CUT_PYTHON_PATH = path.join(
	VIDEO_CUT_VENV_PATH,
	"bin",
	"python",
);
export const MEDIA_FILE_PATH = path.join(
	process.cwd(),
	"features",
	"course",
	"lesson",
	"model",
	"media.ts",
);
const VENDORED_VAD_SCRIPT_PATH = path.join(
	process.cwd(),
	"scripts",
	"vendor",
	"for_youtube",
	"execution",
	"jump_cut_vad_parallel.py",
);

const LESSON_SOURCE_FILES = [
	"lib/course/lesson/model/lessons/start-here.ts",
	"lib/course/lesson/model/lessons/ceo.ts",
	"lib/course/lesson/model/lessons/design.ts",
	"lib/course/lesson/content/build.ts",
	"lib/course/lesson/model/lessons/ship.ts",
];

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
	".avi",
	".m4v",
	".mkv",
	".mov",
	".mp4",
	".webm",
]);
const KNOWN_VIDEO_OUTPUT_EXTENSIONS = new Set([
	".avi",
	".m4v",
	".mkv",
	".mov",
	".mp4",
	".webm",
]);

function normalizeExtension(value) {
	const normalizedValue = String(value ?? "")
		.trim()
		.toLowerCase();
	if (!normalizedValue) {
		return "";
	}

	return normalizedValue.startsWith(".")
		? normalizedValue
		: `.${normalizedValue}`;
}

function createError(message, details) {
	const error = new Error(message);
	if (details) {
		error.details = details;
	}
	return error;
}

function toNumber(value) {
	const numericValue =
		typeof value === "number"
			? value
			: Number.parseInt(String(value ?? ""), 10);
	return Number.isFinite(numericValue) ? numericValue : 0;
}

export function compareLessonIds(left, right) {
	const [leftBlock = "0", leftStep = "0"] = left.split(".");
	const [rightBlock = "0", rightStep = "0"] = right.split(".");
	const blockDifference = toNumber(leftBlock) - toNumber(rightBlock);

	if (blockDifference !== 0) {
		return blockDifference;
	}

	return toNumber(leftStep) - toNumber(rightStep);
}

export function formatDurationLabel(totalSeconds) {
	const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
	if (seconds === 0) {
		return undefined;
	}

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}

	if (minutes > 0) {
		return remainingSeconds > 0
			? `${minutes}m ${remainingSeconds}s`
			: `${minutes} min`;
	}

	return `${remainingSeconds}s`;
}

export function parseLessonFilename(fileName) {
	const extension = path.extname(fileName).toLowerCase();
	if (!SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
		return null;
	}

	const baseName = path.basename(fileName, extension);
	const match = baseName.match(/^([A-Za-z0-9.-]+)--(.+)$/);
	if (!match) {
		return null;
	}

	return {
		fileName,
		sourceKey: match[1],
		slug: match[2],
		extension,
	};
}

export function extractLessonDefinitions(source) {
	const definitions = [];
	let pendingLessonId = null;

	for (const line of source.split("\n")) {
		const idMatch = line.match(/\bid:\s*"([0-9]+\.[0-9]+)"/);
		if (idMatch) {
			pendingLessonId = idMatch[1];
			continue;
		}

		if (!pendingLessonId) {
			continue;
		}

		const titleMatch = line.match(/\btitle:\s*"([^"]+)"/);
		if (!titleMatch) {
			continue;
		}

		definitions.push({
			id: pendingLessonId,
			title: titleMatch[1],
		});
		pendingLessonId = null;
	}

	return definitions.sort((left, right) => compareLessonIds(left.id, right.id));
}

export async function getRepoLessons(repoRoot = process.cwd()) {
	const lessonsById = new Map();

	for (const relativePath of LESSON_SOURCE_FILES) {
		const source = await readFile(path.join(repoRoot, relativePath), "utf8");
		for (const lesson of extractLessonDefinitions(source)) {
			lessonsById.set(lesson.id, lesson);
		}
	}

	return [...lessonsById.values()].sort((left, right) =>
		compareLessonIds(left.id, right.id),
	);
}

export function extractLessonMediaMap(source) {
	const match =
		source.match(/String\.raw`([\s\S]*)`;/) ?? source.match(/`([\s\S]*)`;/);
	if (!match) {
		throw createError(
			"Could not parse lib/course/lesson/model/media.ts JSON payload.",
		);
	}

	return JSON.parse(match[1]);
}

export async function readExistingLessonMedia(mediaFilePath = MEDIA_FILE_PATH) {
	try {
		const source = await readFile(mediaFilePath, "utf8");
		return extractLessonMediaMap(source);
	} catch (error) {
		if (error?.code === "ENOENT") {
			return {};
		}

		throw error;
	}
}

export function renderLessonMediaModule(mediaMap) {
	const orderedEntries = Object.fromEntries(
		Object.entries(mediaMap).sort(([leftId], [rightId]) =>
			compareLessonIds(leftId, rightId),
		),
	);
	const mediaJson = JSON.stringify(orderedEntries, null, 2);

	return `import type { LessonVideoContent } from "./contracts";

export type LessonMediaMap = Partial<Record<string, LessonVideoContent>>;

const LESSON_MEDIA_JSON = String.raw\`${mediaJson}\`;

export const lessonMedia = JSON.parse(LESSON_MEDIA_JSON) as LessonMediaMap;
`;
}

export async function writeLessonMediaModule(
	mediaMap,
	mediaFilePath = MEDIA_FILE_PATH,
) {
	await writeFile(mediaFilePath, renderLessonMediaModule(mediaMap));
}

export function validateReadyVideoFiles({
	fileNames,
	validLessons,
	existingMedia,
	replaceLessonIds,
}) {
	const validLessonsById = new Map(
		validLessons.map((lesson) => [lesson.id, lesson]),
	);
	const readyItems = [];
	const errors = [];
	const seenSourceKeys = new Set();

	for (const fileName of [...fileNames].sort()) {
		const parsed = parseLessonFilename(fileName);
		if (!parsed) {
			errors.push(
				`${fileName}: expected <lessonId>--<slug>.<video extension> with a supported video file extension.`,
			);
			continue;
		}

		if (seenSourceKeys.has(parsed.sourceKey)) {
			errors.push(
				`${fileName}: source key ${parsed.sourceKey} appears more than once in Ready.`,
			);
			continue;
		}

		const lesson = validLessonsById.get(parsed.sourceKey);
		if (
			lesson &&
			existingMedia[lesson.id] &&
			!replaceLessonIds.has(lesson.id)
		) {
			errors.push(
				`${fileName}: lesson ${lesson.id} already has generated media. Use --replace ${lesson.id} to overwrite the local media map entry.`,
			);
			continue;
		}

		seenSourceKeys.add(parsed.sourceKey);
		readyItems.push({
			...parsed,
			attachmentMode: lesson ? "lesson" : "unattached",
			lessonId: lesson?.id ?? null,
			lessonTitle: lesson?.title ?? null,
		});
	}

	return { readyItems, errors };
}

export function parseReplaceLessonIds(argv) {
	const replaceLessonIds = new Set();

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		if (!current) {
			continue;
		}

		if (current.startsWith("--replace=")) {
			for (const lessonId of current.slice("--replace=".length).split(",")) {
				if (lessonId) {
					replaceLessonIds.add(lessonId.trim());
				}
			}
			continue;
		}

		if (current === "--replace") {
			for (const lessonId of (argv[index + 1] ?? "").split(",")) {
				if (lessonId) {
					replaceLessonIds.add(lessonId.trim());
				}
			}
			index += 1;
		}
	}

	return replaceLessonIds;
}

export function parseOnlyFileNames(argv) {
	const onlyFileNames = new Set();

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		if (!current) {
			continue;
		}

		if (current.startsWith("--only=")) {
			for (const fileName of current.slice("--only=".length).split(",")) {
				if (fileName) {
					onlyFileNames.add(fileName.trim());
				}
			}
			continue;
		}

		if (current === "--only") {
			for (const fileName of (argv[index + 1] ?? "").split(",")) {
				if (fileName) {
					onlyFileNames.add(fileName.trim());
				}
			}
			index += 1;
		}
	}

	return onlyFileNames;
}

export function buildCutOptionsFromArgv(argv) {
	const options = {
		skipCut: false,
		detectRestarts: false,
		minSilence: null,
		minSpeech: null,
		padding: null,
		mergeGap: null,
		keepStart: true,
		pythonBin: process.env.VIDEO_PIPELINE_PYTHON_BIN?.trim() || null,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		if (!current) {
			continue;
		}

		if (current === "--skip-cut") {
			options.skipCut = true;
			continue;
		}

		if (current === "--detect-restarts") {
			options.detectRestarts = true;
			continue;
		}

		if (current === "--no-keep-start") {
			options.keepStart = false;
			continue;
		}

		if (current.startsWith("--python-bin=")) {
			options.pythonBin = current.slice("--python-bin=".length).trim() || null;
			continue;
		}

		if (current === "--python-bin") {
			options.pythonBin = (argv[index + 1] ?? "").trim() || null;
			index += 1;
			continue;
		}

		assignNumericArg(options, argv, index, "minSilence", "--min-silence");
		assignNumericArg(options, argv, index, "minSpeech", "--min-speech");
		assignNumericArg(options, argv, index, "padding", "--padding");
		assignNumericArg(options, argv, index, "mergeGap", "--merge-gap");
	}

	return options;
}

export function buildPipelineVideoTitle(item) {
	return item.attachmentMode === "lesson"
		? `${item.lessonId} — ${item.lessonTitle}`
		: `${item.sourceKey} — ${item.slug}`;
}

export function buildBunnyEmbedUrl(libraryId, videoId) {
	return `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`;
}

export async function listReadyFileNames(readyDirectory = READY_DIRECTORY) {
	const entries = await readdir(readyDirectory, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isFile() && !entry.name.startsWith("."))
		.map((entry) => entry.name)
		.sort();
}

export async function createTempCutPath(runId, fileName) {
	const tempDirectory = path.join(REPORT_DIRECTORY, "tmp", runId);
	await mkdir(tempDirectory, { recursive: true });
	return path.join(
		tempDirectory,
		`${path.basename(fileName, path.extname(fileName))}.cut.mp4`,
	);
}

export async function ensureVideoCutPythonReady(options = {}) {
	if (options.skipCut) {
		return resolveVideoCutPythonBin(options.pythonBin);
	}

	const pythonBin = await resolveVideoCutPythonBin(options.pythonBin);
	const requiredModules = ["torch"];

	if (options.detectRestarts) {
		requiredModules.push("whisper");
	}

	for (const moduleName of requiredModules) {
		const available = await checkPythonModule(pythonBin, moduleName);
		if (!available) {
			throw createError(
				`Missing Python module ${moduleName} for the video cut stage. Run \`bun run video:cut:setup\` first.`,
			);
		}
	}

	return pythonBin;
}

export async function runVideoCutStage({ sourcePath, cutPath, options }) {
	const pythonBin = await ensureVideoCutPythonReady(options);
	const rawDurationSeconds = await getMediaDurationSeconds(sourcePath);

	const args = [VENDORED_VAD_SCRIPT_PATH, sourcePath, cutPath];
	if (options.minSilence !== null) {
		args.push("--min-silence", String(options.minSilence));
	}
	if (options.minSpeech !== null) {
		args.push("--min-speech", String(options.minSpeech));
	}
	if (options.padding !== null) {
		args.push("--padding", String(options.padding));
	}
	if (options.mergeGap !== null) {
		args.push("--merge-gap", String(options.mergeGap));
	}
	if (!options.keepStart) {
		args.push("--no-keep-start");
	}
	if (options.detectRestarts) {
		args.push("--detect-restarts");
	}

	await runCommand(pythonBin, args, {
		captureOutput: false,
	});

	const cutDurationSeconds = await getMediaDurationSeconds(cutPath);

	return {
		rawDurationSeconds,
		cutDurationSeconds,
		secondsRemoved: Math.max(0, rawDurationSeconds - cutDurationSeconds),
		reductionPercent:
			rawDurationSeconds > 0
				? Number(
						(
							((rawDurationSeconds - cutDurationSeconds) / rawDurationSeconds) *
							100
						).toFixed(2),
					)
				: 0,
	};
}

export async function runCutAndAuphonicDownloadStage({
	runId,
	item,
	sourcePath,
	cutOptions,
	auphonicApiKey,
	auphonicPresetId,
}) {
	let auphonicInputPath = sourcePath;
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

	const title = buildPipelineVideoTitle(item);
	const production = await createAuphonicProduction({
		apiKey: auphonicApiKey,
		presetId: auphonicPresetId,
		filePath: auphonicInputPath,
		title,
	});
	const completedProduction = await waitForAuphonicProduction({
		apiKey: auphonicApiKey,
		uuid: production.uuid,
	});
	const outputFile = getVideoOutputCandidate(
		completedProduction.output_files ?? [],
	);
	const downloadPath = await createTempDownloadPath(
		runId,
		item.fileName,
		outputFile,
	);
	const { outputFile: downloadedOutputFile } =
		await downloadAuphonicVideoOutput({
			apiKey: auphonicApiKey,
			production: completedProduction,
			destinationPath: downloadPath,
		});

	return {
		title,
		cutPath,
		cutResult,
		completedProduction,
		downloadPath,
		downloadedOutputFile,
	};
}

async function requestJson(url, options = {}) {
	const response = await fetch(url, options);
	if (!response.ok) {
		const body = await response.text();
		throw createError(
			`${options.method ?? "GET"} ${url} failed with ${response.status}.`,
			body.slice(0, 400),
		);
	}

	return response.json();
}

function normalizeAuphonicPayload(payload) {
	return payload?.data ?? payload;
}

function normalizeRelativeUrl(url) {
	if (!url) {
		return null;
	}

	return url.startsWith("http") ? url : `https://auphonic.com${url}`;
}

export function getVideoOutputCandidate(outputFiles) {
	const explicitVideoOutput = outputFiles.find(
		(outputFile) => String(outputFile.format ?? "").toLowerCase() === "video",
	);
	if (explicitVideoOutput) {
		return explicitVideoOutput;
	}

	return outputFiles.find((outputFile) => {
		const ending = normalizeExtension(outputFile.ending);
		if (KNOWN_VIDEO_OUTPUT_EXTENSIONS.has(ending)) {
			return true;
		}

		const fileExtension = path
			.extname(String(outputFile.download_url ?? outputFile.filename ?? ""))
			.toLowerCase();
		return KNOWN_VIDEO_OUTPUT_EXTENSIONS.has(fileExtension);
	});
}

export async function createAuphonicProduction({
	apiKey,
	presetId,
	filePath,
	title,
}) {
	const formData = new FormData();
	formData.set("preset", presetId);
	formData.set("title", title);
	formData.set("action", "start");
	formData.set(
		"input_file",
		await openAsBlob(filePath),
		path.basename(filePath),
	);

	const payload = await requestJson(
		"https://auphonic.com/api/simple/productions.json",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			body: formData,
		},
	);

	const production = normalizeAuphonicPayload(payload);
	if (!production?.uuid) {
		throw createError("Auphonic did not return a production uuid.", payload);
	}

	return production;
}

export async function startAuphonicProduction({ apiKey, uuid }) {
	await requestJson(`https://auphonic.com/api/production/${uuid}/start.json`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});
}

export async function getAuphonicProduction({ apiKey, uuid }) {
	const endpoints = [
		`https://auphonic.com/api/production/${uuid}.json`,
		`https://auphonic.com/api/productions/${uuid}.json`,
	];

	let lastError = null;
	for (const endpoint of endpoints) {
		try {
			const payload = await requestJson(endpoint, {
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			});
			return normalizeAuphonicPayload(payload);
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError ?? createError("Could not load Auphonic production.");
}

export async function waitForAuphonicProduction({
	apiKey,
	uuid,
	pollIntervalMs = 15000,
	maxPolls = 120,
}) {
	let forcedStart = false;

	for (let attempt = 0; attempt < maxPolls; attempt += 1) {
		const production = await getAuphonicProduction({ apiKey, uuid });
		const status = String(production.status_string ?? "").toLowerCase();

		if (status === "done") {
			return production;
		}

		if (status.includes("not started yet") && !forcedStart) {
			await startAuphonicProduction({ apiKey, uuid });
			forcedStart = true;
			await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
			continue;
		}

		if (
			status.includes("error") ||
			status.includes("failed") ||
			status.includes("aborted")
		) {
			throw createError(
				`Auphonic production ${uuid} failed with status ${production.status_string ?? production.status}.`,
				production,
			);
		}

		await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
	}

	throw createError(
		`Timed out waiting for Auphonic production ${uuid} to finish.`,
	);
}

export async function downloadAuphonicVideoOutput({
	apiKey,
	production,
	destinationPath,
}) {
	const outputFile = getVideoOutputCandidate(production.output_files ?? []);
	const downloadUrl = normalizeRelativeUrl(outputFile?.download_url);

	if (!outputFile || !downloadUrl) {
		throw createError(
			`Auphonic production ${production.uuid} did not expose a downloadable video output.`,
			production.output_files ?? [],
		);
	}

	let response = await fetch(downloadUrl, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (response.status === 401 || response.status === 403) {
		const authenticatedUrl = new URL(downloadUrl);
		authenticatedUrl.searchParams.set("bearer_token", apiKey);
		response = await fetch(authenticatedUrl);
	}

	if (!response.ok || !response.body) {
		throw createError(
			`Failed to download processed Auphonic output for ${production.uuid}.`,
			`${response.status} ${response.statusText}`,
		);
	}

	await mkdir(path.dirname(destinationPath), { recursive: true });
	await pipeline(
		Readable.fromWeb(response.body),
		createWriteStream(destinationPath),
	);

	return {
		outputFile,
		destinationPath,
	};
}

export async function createBunnyVideo({ apiKey, libraryId, title }) {
	const payload = await requestJson(
		`https://video.bunnycdn.com/library/${libraryId}/videos`,
		{
			method: "POST",
			headers: {
				AccessKey: apiKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ title }),
		},
	);

	if (!payload?.guid) {
		throw createError("Bunny did not return a video guid.", payload);
	}

	return payload;
}

export async function uploadBunnyVideo({
	apiKey,
	libraryId,
	videoId,
	filePath,
}) {
	await runCurlUpload({
		apiKey,
		libraryId,
		videoId,
		filePath,
	});
}

export async function getBunnyVideo({ apiKey, libraryId, videoId }) {
	return requestJson(
		`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
		{
			headers: {
				AccessKey: apiKey,
			},
		},
	);
}

export async function waitForBunnyVideoReady({
	apiKey,
	libraryId,
	videoId,
	pollIntervalMs = 10000,
	maxPolls = 180,
}) {
	for (let attempt = 0; attempt < maxPolls; attempt += 1) {
		const bunnyVideo = await getBunnyVideo({ apiKey, libraryId, videoId });

		const encodeCompleted = Number(bunnyVideo.encodeProgress ?? 0) >= 100;
		const hasPlayableOutputs =
			typeof bunnyVideo.availableResolutions === "string" &&
			bunnyVideo.availableResolutions.trim().length > 0;

		if (
			bunnyVideo.status === 3 ||
			(bunnyVideo.status === 4 && encodeCompleted)
		) {
			return bunnyVideo;
		}

		if (bunnyVideo.status === 4 && hasPlayableOutputs) {
			return bunnyVideo;
		}

		if (bunnyVideo.status === 5 || bunnyVideo.status === 8) {
			throw createError(
				`Bunny video ${videoId} failed with status ${bunnyVideo.status}.`,
				bunnyVideo,
			);
		}

		await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
	}

	throw createError(`Timed out waiting for Bunny video ${videoId} to finish.`);
}

export function buildLessonMediaEntry({
	libraryId,
	videoId,
	lessonTitle,
	bunnyVideo,
}) {
	return {
		status: "ready",
		provider: "bunny",
		libraryId,
		videoId,
		title: lessonTitle,
		durationLabel: formatDurationLabel(bunnyVideo.length),
	};
}

export async function ensureReportDirectory() {
	await mkdir(REPORT_DIRECTORY, { recursive: true });
}

export async function writeRunReport(runId, report) {
	await ensureReportDirectory();
	const reportPath = path.join(REPORT_DIRECTORY, `run-${runId}.json`);
	await writeFile(reportPath, JSON.stringify(report, null, 2));
	return reportPath;
}

export async function moveFileToProcessed(fileName, runId) {
	await mkdir(PROCESSED_DIRECTORY, { recursive: true });

	const sourcePath = path.join(READY_DIRECTORY, fileName);
	const uniqueTargetPath = await getAvailableTargetPath(
		PROCESSED_DIRECTORY,
		fileName,
		runId,
	);
	await moveFileAcrossVolumes(sourcePath, uniqueTargetPath);
	return uniqueTargetPath;
}

export function createRunId(now = new Date()) {
	return now.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

export function getRequiredEnv(name) {
	const value = process.env[name]?.trim();
	if (!value) {
		throw createError(`Missing required environment variable ${name}.`);
	}

	return value;
}

export async function createTempDownloadPath(runId, fileName, outputFile) {
	const extension =
		normalizeExtension(outputFile?.ending) ||
		path.extname(String(outputFile?.download_url ?? fileName)) ||
		".mp4";
	const tempDirectory = path.join(REPORT_DIRECTORY, "tmp", runId);

	await mkdir(tempDirectory, { recursive: true });

	return path.join(
		tempDirectory,
		`${path.basename(fileName, path.extname(fileName))}${extension}`,
	);
}

export async function moveDownloadedOutputToColorCorrection({
	sourcePath,
	fileName,
	runId,
	outputFile,
}) {
	await mkdir(COLOR_CORRECTION_DIRECTORY, { recursive: true });

	const extension =
		normalizeExtension(outputFile?.ending) ||
		path.extname(String(outputFile?.download_url ?? fileName)) ||
		path.extname(fileName) ||
		".mp4";
	const targetFileName = `${path.basename(fileName, path.extname(fileName))}${extension}`;
	const targetPath = await getAvailableTargetPath(
		COLOR_CORRECTION_DIRECTORY,
		targetFileName,
		runId,
	);
	await moveFileAcrossVolumes(sourcePath, targetPath);
	return targetPath;
}

export async function moveColorGradedFileToBunnyUploaded(
	fileName,
	runId,
	sourceDirectory = COLOR_GRADED_DIRECTORY,
) {
	await mkdir(BUNNY_UPLOADED_DIRECTORY, { recursive: true });

	const sourcePath = path.join(sourceDirectory, fileName);
	const targetPath = await getAvailableTargetPath(
		BUNNY_UPLOADED_DIRECTORY,
		fileName,
		runId,
	);
	await moveFileAcrossVolumes(sourcePath, targetPath);
	return targetPath;
}

async function moveFileAcrossVolumes(sourcePath, targetPath) {
	try {
		await rename(sourcePath, targetPath);
	} catch (error) {
		if (error?.code !== "EXDEV") {
			throw error;
		}

		await copyFile(sourcePath, targetPath);
		await rm(sourcePath, { force: true });
	}
}

async function getAvailableTargetPath(targetDirectory, fileName, runId) {
	const directPath = path.join(targetDirectory, fileName);

	try {
		await stat(directPath);
	} catch (error) {
		if (error?.code === "ENOENT") {
			return directPath;
		}

		throw error;
	}

	return path.join(targetDirectory, `${runId}--${fileName}`);
}

async function runCurlUpload({ apiKey, libraryId, videoId, filePath }) {
	const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
	const fileStats = await stat(filePath);
	console.log(
		`Uploading ${path.basename(filePath)} to Bunny (${formatBytes(fileStats.size)})...`,
	);

	return await new Promise((resolve, reject) => {
		const child = spawn("curl", [
			"--fail",
			"--progress-bar",
			"--show-error",
			"--output",
			"/dev/null",
			"--write-out",
			"\\nBUNNY_UPLOAD http_code=%{http_code} size_upload=%{size_upload} speed_upload=%{speed_upload} time_total=%{time_total}\\n",
			"--request",
			"PUT",
			"--header",
			`AccessKey: ${apiKey}`,
			"--header",
			"Content-Type: application/octet-stream",
			"--upload-file",
			filePath,
			uploadUrl,
		]);

		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			const text = String(chunk);
			stdout += text;
			process.stdout.write(text);
		});
		child.stderr.on("data", (chunk) => {
			const text = String(chunk);
			stderr += text;
			process.stderr.write(text);
		});

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve({
					stdout: stdout.trim(),
					stderr: stderr.trim(),
				});
				return;
			}

			reject(
				createError(
					`Uploading ${path.basename(filePath)} to Bunny failed.`,
					stderr.trim() || stdout.trim(),
				),
			);
		});
	});
}

function assignNumericArg(options, argv, index, key, flag) {
	const current = argv[index];
	if (!current) {
		return false;
	}

	if (current.startsWith(`${flag}=`)) {
		options[key] = Number(current.slice(flag.length + 1));
		return true;
	}

	if (current === flag) {
		options[key] = Number(argv[index + 1]);
		return true;
	}

	return false;
}

function formatBytes(value) {
	if (!Number.isFinite(value) || value <= 0) {
		return "0 B";
	}

	const units = ["B", "KB", "MB", "GB", "TB"];
	let size = value;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}

	return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function resolveVideoCutPythonBin(explicitPythonBin) {
	const candidates = [
		explicitPythonBin,
		VIDEO_CUT_PYTHON_PATH,
		"python3.11",
		"python3",
	].filter(Boolean);

	for (const candidate of candidates) {
		const available = await commandExists(candidate);
		if (available) {
			return candidate;
		}
	}

	throw createError(
		"Could not find a usable Python binary for the video cut stage. Run `bun run video:cut:setup` first.",
	);
}

function commandExists(command) {
	return new Promise((resolve) => {
		const child = spawn(command, ["--version"], {
			cwd: process.cwd(),
			env: process.env,
			stdio: "ignore",
		});

		child.on("error", () => resolve(false));
		child.on("close", (code) => resolve(code === 0));
	});
}

function checkPythonModule(pythonBin, moduleName) {
	return new Promise((resolve) => {
		const child = spawn(
			pythonBin,
			[
				"-c",
				`import importlib.util; raise SystemExit(0 if importlib.util.find_spec('${moduleName}') else 1)`,
			],
			{
				cwd: process.cwd(),
				env: process.env,
				stdio: "ignore",
			},
		);

		child.on("error", () => resolve(false));
		child.on("close", (code) => resolve(code === 0));
	});
}

async function getMediaDurationSeconds(filePath) {
	const result = await runCommand(
		"ffprobe",
		[
			"-v",
			"error",
			"-show_entries",
			"format=duration",
			"-of",
			"default=noprint_wrappers=1:nokey=1",
			filePath,
		],
		{
			captureOutput: true,
		},
	);

	return Number.parseFloat(result.stdout.trim() || "0");
}

function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
			stdio: options.captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
		});

		let stdout = "";
		let stderr = "";

		if (options.captureOutput) {
			child.stdout.on("data", (chunk) => {
				stdout += String(chunk);
			});
			child.stderr.on("data", (chunk) => {
				stderr += String(chunk);
			});
		}

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve({ stdout, stderr });
				return;
			}

			reject(
				createError(
					`${command} exited with code ${code ?? 1}.`,
					stderr.trim() || stdout.trim(),
				),
			);
		});
	});
}
