import { spawn } from "node:child_process";
import {
	access,
	mkdir,
	readdir,
	readFile,
	stat,
	writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
	RAW_FOOTAGE_ROOT,
	PROCESSED_DIRECTORY,
	VIDEO_CUT_PYTHON_PATH,
	compareLessonIds,
	formatDurationLabel,
	getRepoLessons,
	parseLessonFilename,
	readExistingLessonMedia,
} from "./lesson-video-pipeline.mjs";

export const DEFAULT_TRANSCRIPTS_DIRECTORY = path.join(
	RAW_FOOTAGE_ROOT,
	"Transcripts",
	"Processed",
);
export const DEFAULT_REMAP_FILE_PATH = path.join(
	process.cwd(),
	"scripts",
	"data",
	"lesson-video-remap.json",
);

const EXPECTED_TRANSCRIPT_EXTENSIONS = ["txt", "srt", "json"];
const STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"build",
	"by",
	"ceo",
	"day",
	"design",
	"for",
	"how",
	"in",
	"lesson",
	"of",
	"on",
	"overview",
	"ship",
	"the",
	"to",
	"video",
	"with",
]);

function createError(message, details) {
	const error = new Error(message);
	if (details) {
		error.details = details;
	}
	return error;
}

function toNumber(value) {
	const numericValue = Number.parseInt(String(value ?? ""), 10);
	return Number.isFinite(numericValue) ? numericValue : 0;
}

function compareSourceKeys(left, right) {
	if (left === right) {
		return 0;
	}

	return compareLessonIds(left, right);
}

function normalizePath(value) {
	return path.resolve(String(value ?? "").trim());
}

function tokenize(value) {
	const tokens = String(value ?? "")
		.toLowerCase()
		.match(/[a-z0-9]+/g);

	if (!tokens) {
		return [];
	}

	return tokens.filter((token) => !STOP_WORDS.has(token));
}

function parseDurationLabelSeconds(value) {
	const source = String(value ?? "")
		.trim()
		.toLowerCase();
	if (!source) {
		return null;
	}

	let totalSeconds = 0;
	const hourMatch = source.match(/(\d+)\s*h/);
	const minuteMatch = source.match(/(\d+)\s*m/);
	const secondMatch = source.match(/(\d+)\s*s/);

	if (hourMatch) {
		totalSeconds += toNumber(hourMatch[1]) * 3600;
	}
	if (minuteMatch) {
		totalSeconds += toNumber(minuteMatch[1]) * 60;
	}
	if (secondMatch) {
		totalSeconds += toNumber(secondMatch[1]);
	}

	return totalSeconds > 0 ? totalSeconds : null;
}

function scoreTitleMatch(videoSlug, lessonTitle) {
	const videoTokens = tokenize(videoSlug);
	const lessonTokens = tokenize(lessonTitle);

	if (!videoTokens.length || !lessonTokens.length) {
		return { score: 0, reasons: [] };
	}

	const videoKey = videoTokens.join(" ");
	const lessonKey = lessonTokens.join(" ");

	if (videoKey === lessonKey) {
		return {
			score: 2.4,
			reasons: ["title_exact"],
		};
	}

	const lessonTokenSet = new Set(lessonTokens);
	const overlapCount = videoTokens.filter((token) =>
		lessonTokenSet.has(token),
	).length;
	if (overlapCount === 0) {
		return { score: 0, reasons: [] };
	}

	const precision = overlapCount / videoTokens.length;
	const recall = overlapCount / lessonTokens.length;
	const f1 =
		precision + recall > 0
			? (2 * precision * recall) / (precision + recall)
			: 0;

	let score = f1 + precision * 0.45;
	const reasons = ["title_overlap"];

	if (overlapCount === videoTokens.length) {
		score += 0.45;
		reasons.push("video_tokens_contained");
	}

	if (overlapCount >= 2) {
		score += 0.15;
		reasons.push("multi_token_overlap");
	}

	if (lessonKey.includes(videoKey) || videoKey.includes(lessonKey)) {
		score += 0.25;
		reasons.push("title_substring");
	}

	return {
		score,
		reasons,
	};
}

function scoreLessonCandidate(video, lesson) {
	const titleCandidates = [
		["published_title", lesson.publishedTitle],
		["repo_title", lesson.repoTitle],
	];

	let score = 0;
	let bestTitleLabel = null;
	let reasons = [];

	for (const [label, title] of titleCandidates) {
		if (!title) {
			continue;
		}

		const titleScore = scoreTitleMatch(video.slug, title);
		if (titleScore.score > score) {
			score = titleScore.score;
			bestTitleLabel = label;
			reasons = [...titleScore.reasons];
		}
	}

	if (score > 0 && bestTitleLabel) {
		reasons.unshift(bestTitleLabel);
	}

	if (
		lesson.publishedDurationSeconds !== null &&
		Number.isFinite(video.durationSeconds) &&
		video.durationSeconds > 0
	) {
		const durationDifference = Math.abs(
			lesson.publishedDurationSeconds - video.durationSeconds,
		);

		if (durationDifference <= 15) {
			score += 0.35;
			reasons.push("duration_close");
		} else if (durationDifference <= 45) {
			score += 0.2;
			reasons.push("duration_near");
		}
	}

	if (video.sourceKey === lesson.id) {
		score += 0.15;
		reasons.push("source_key_match");
	}

	return {
		id: lesson.id,
		score: Number(score.toFixed(2)),
		reasons,
		repoTitle: lesson.repoTitle,
		publishedTitle: lesson.publishedTitle,
	};
}

async function runCommand(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk) => {
			stdout += String(chunk);
		});
		child.stderr.on("data", (chunk) => {
			stderr += String(chunk);
		});

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve({ stdout, stderr });
				return;
			}

			reject(
				createError(`${command} exited with code ${code ?? 1}.`, {
					args,
					stdout,
					stderr,
				}),
			);
		});
	});
}

async function getDurationSeconds(filePath) {
	const result = await runCommand("ffprobe", [
		"-v",
		"error",
		"-show_entries",
		"format=duration",
		"-of",
		"default=noprint_wrappers=1:nokey=1",
		filePath,
	]);

	const seconds = Number.parseFloat(result.stdout.trim());
	return Number.isFinite(seconds) ? seconds : 0;
}

async function loadRemapFile(remapFilePath = DEFAULT_REMAP_FILE_PATH) {
	try {
		const raw = await readFile(remapFilePath, "utf8");
		const parsed = JSON.parse(raw);

		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			throw createError(
				`Expected ${remapFilePath} to contain a JSON object of video stem -> lesson IDs.`,
			);
		}

		return parsed;
	} catch (error) {
		if (error?.code === "ENOENT") {
			return {};
		}

		throw error;
	}
}

async function getLessonCatalog() {
	const [repoLessons, mediaMap] = await Promise.all([
		getRepoLessons(),
		readExistingLessonMedia(),
	]);

	const lessonsById = new Map();

	for (const lesson of repoLessons) {
		lessonsById.set(lesson.id, {
			id: lesson.id,
			repoTitle: lesson.title,
			publishedTitle: null,
			publishedDurationSeconds: null,
		});
	}

	for (const [lessonId, media] of Object.entries(mediaMap)) {
		const existing = lessonsById.get(lessonId) ?? {
			id: lessonId,
			repoTitle: null,
			publishedTitle: null,
			publishedDurationSeconds: null,
		};

		lessonsById.set(lessonId, {
			...existing,
			publishedTitle: media?.title ?? existing.publishedTitle,
			publishedDurationSeconds:
				parseDurationLabelSeconds(media?.durationLabel) ??
				existing.publishedDurationSeconds,
		});
	}

	return [...lessonsById.values()].sort((left, right) =>
		compareLessonIds(left.id, right.id),
	);
}

function normalizeLessonIds(value, lessonCatalog) {
	if (!Array.isArray(value)) {
		return [];
	}

	const knownIds = new Set(lessonCatalog.map((lesson) => lesson.id));

	return value
		.map((entry) => String(entry ?? "").trim())
		.filter((entry) => entry.length > 0 && knownIds.has(entry));
}

function buildVideoMatch(video, lessonCatalog, remapConfig) {
	const manualLessonIds = normalizeLessonIds(
		remapConfig[video.stem],
		lessonCatalog,
	);
	if (manualLessonIds.length > 0) {
		return {
			lessonIds: manualLessonIds,
			mappingSource: "manual",
			candidates: manualLessonIds.map((lessonId) => ({
				id: lessonId,
				score: 999,
				reasons: ["manual_override"],
			})),
		};
	}

	const candidates = lessonCatalog
		.map((lesson) => scoreLessonCandidate(video, lesson))
		.filter((candidate) => candidate.score > 0)
		.sort(
			(left, right) =>
				right.score - left.score || compareLessonIds(left.id, right.id),
		)
		.slice(0, 5);

	const [primary, secondary] = candidates;

	if (!primary || primary.score < 1.5) {
		return {
			lessonIds: [],
			mappingSource: "unresolved",
			candidates,
		};
	}

	if (secondary && primary.score - secondary.score < 0.2) {
		return {
			lessonIds: [],
			mappingSource: "needs_review",
			candidates,
		};
	}

	return {
		lessonIds: [primary.id],
		mappingSource: "auto",
		candidates,
	};
}

function createExpectedFiles(outputDirectory, stem) {
	const files = {};

	for (const extension of EXPECTED_TRANSCRIPT_EXTENSIONS) {
		files[extension] = path.join(outputDirectory, `${stem}.${extension}`);
	}

	return files;
}

async function outputsExist(expectedFiles) {
	for (const filePath of Object.values(expectedFiles)) {
		try {
			await access(filePath);
		} catch {
			return false;
		}
	}

	return true;
}

async function writeRootManifest(manifestPath, payload) {
	await mkdir(path.dirname(manifestPath), { recursive: true });
	await writeFile(manifestPath, `${JSON.stringify(payload, null, 2)}\n`);
}

async function writeVideoManifest(outputDirectory, payload) {
	await mkdir(outputDirectory, { recursive: true });
	await writeFile(
		path.join(outputDirectory, "manifest.json"),
		`${JSON.stringify(payload, null, 2)}\n`,
	);
}

async function transcribeVideo(video, options) {
	const outputDirectory = path.join(options.outputRoot, video.stem);
	const expectedFiles = createExpectedFiles(outputDirectory, video.stem);
	const logPath = path.join(outputDirectory, "whisper.log");

	await mkdir(outputDirectory, { recursive: true });

	if (!options.force && (await outputsExist(expectedFiles))) {
		return {
			status: "skipped",
			outputDirectory,
			expectedFiles,
			logPath,
		};
	}

	const args = [
		"-I",
		"-m",
		"whisper",
		video.path,
		"--model",
		options.model,
		"--task",
		"transcribe",
		"--output_dir",
		outputDirectory,
		"--output_format",
		"all",
		"--fp16",
		"False",
		"--verbose",
		"False",
	];

	if (options.wordTimestamps) {
		args.push("--word_timestamps", "True");
	}

	if (options.language && options.language !== "auto") {
		args.push("--language", options.language);
	}
	if (options.device) {
		args.push("--device", options.device);
	}

	const startedAt = new Date().toISOString();

	try {
		const result = await runCommand(options.pythonBin, args);
		await writeFile(
			logPath,
			[
				`Started: ${startedAt}`,
				`Command: ${options.pythonBin} ${args.join(" ")}`,
				"",
				"STDOUT",
				result.stdout.trim(),
				"",
				"STDERR",
				result.stderr.trim(),
				"",
			].join("\n"),
		);

		return {
			status: "completed",
			outputDirectory,
			expectedFiles,
			logPath,
		};
	} catch (error) {
		const stdout = error?.details?.stdout ?? "";
		const stderr = error?.details?.stderr ?? "";
		await writeFile(
			logPath,
			[
				`Started: ${startedAt}`,
				`Command: ${options.pythonBin} ${args.join(" ")}`,
				"",
				"STDOUT",
				stdout.trim(),
				"",
				"STDERR",
				stderr.trim(),
				"",
			].join("\n"),
		);
		throw createError(`Whisper failed for ${video.fileName}.`, {
			logPath,
			cause: error instanceof Error ? error.message : String(error),
		});
	}
}

export function parseTranscriptArgs(argv) {
	const options = {
		inputRoot: PROCESSED_DIRECTORY,
		outputRoot: DEFAULT_TRANSCRIPTS_DIRECTORY,
		remapFile: DEFAULT_REMAP_FILE_PATH,
		model: "small.en",
		language: "en",
		device: "cpu",
		wordTimestamps: false,
		workers: 2,
		limit: null,
		include: null,
		force: false,
		dryRun: false,
		pythonBin: VIDEO_CUT_PYTHON_PATH,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		const next = argv[index + 1];

		if (current === "--") {
			continue;
		}

		if (current === "--input-root" && next) {
			options.inputRoot = normalizePath(next);
			index += 1;
			continue;
		}
		if (current === "--output-root" && next) {
			options.outputRoot = normalizePath(next);
			index += 1;
			continue;
		}
		if (current === "--remap-file" && next) {
			options.remapFile = normalizePath(next);
			index += 1;
			continue;
		}
		if (current === "--model" && next) {
			options.model = String(next).trim();
			index += 1;
			continue;
		}
		if (current === "--language" && next) {
			options.language = String(next).trim();
			index += 1;
			continue;
		}
		if (current === "--device" && next) {
			options.device = String(next).trim();
			index += 1;
			continue;
		}
		if (current === "--word-timestamps") {
			options.wordTimestamps = true;
			continue;
		}
		if (current === "--python-bin" && next) {
			options.pythonBin = normalizePath(next);
			index += 1;
			continue;
		}
		if (current === "--workers" && next) {
			options.workers = Math.max(1, toNumber(next) || 1);
			index += 1;
			continue;
		}
		if (current === "--limit" && next) {
			const limit = toNumber(next);
			options.limit = limit > 0 ? limit : null;
			index += 1;
			continue;
		}
		if (current === "--include" && next) {
			options.include = String(next).trim().toLowerCase();
			index += 1;
			continue;
		}
		if (current === "--force") {
			options.force = true;
			continue;
		}
		if (current === "--dry-run") {
			options.dryRun = true;
			continue;
		}

		throw createError(`Unknown argument: ${current}`);
	}

	return options;
}

export async function ensureTranscriptPythonReady(
	pythonBin = VIDEO_CUT_PYTHON_PATH,
) {
	try {
		await access(pythonBin);
	} catch {
		throw createError(
			`Python environment not found at ${pythonBin}. Run \`bun run video:transcripts:setup\` first.`,
		);
	}

	try {
		await runCommand(pythonBin, ["-I", "-c", "import whisper"]);
	} catch {
		throw createError(
			`Whisper is not installed in ${pythonBin}. Run \`bun run video:transcripts:setup\` first.`,
		);
	}

	return pythonBin;
}

export async function discoverTranscriptVideos(options) {
	const lessonCatalog = await getLessonCatalog();
	const remapConfig = await loadRemapFile(options.remapFile);
	const entries = await readdir(options.inputRoot, { withFileTypes: true });
	const videos = [];

	for (const entry of entries) {
		if (!entry.isFile() || entry.name.startsWith(".")) {
			continue;
		}

		const parsed = parseLessonFilename(entry.name);
		if (!parsed) {
			continue;
		}

		const fullPath = path.join(options.inputRoot, entry.name);
		const [fileStats, durationSeconds] = await Promise.all([
			stat(fullPath),
			getDurationSeconds(fullPath),
		]);

		const stem = path.basename(entry.name, parsed.extension);
		const outputDirectory = path.join(options.outputRoot, stem);
		const expectedFiles = createExpectedFiles(outputDirectory, stem);
		const match = buildVideoMatch(
			{
				fileName: entry.name,
				stem,
				path: fullPath,
				sourceKey: parsed.sourceKey,
				slug: parsed.slug,
				durationSeconds,
			},
			lessonCatalog,
			remapConfig,
		);

		videos.push({
			fileName: entry.name,
			stem,
			path: fullPath,
			sourceKey: parsed.sourceKey,
			slug: parsed.slug,
			extension: parsed.extension,
			sizeBytes: fileStats.size,
			durationSeconds,
			durationLabel: formatDurationLabel(durationSeconds),
			outputDirectory,
			expectedFiles,
			lessonIds: match.lessonIds,
			mappingSource: match.mappingSource,
			candidateLessonIds: match.candidates,
		});
	}

	videos.sort(
		(left, right) =>
			compareSourceKeys(left.sourceKey, right.sourceKey) ||
			left.fileName.localeCompare(right.fileName),
	);

	let filteredVideos = videos;

	if (options.include) {
		filteredVideos = filteredVideos.filter((video) =>
			`${video.fileName} ${video.stem} ${video.lessonIds.join(" ")}`
				.toLowerCase()
				.includes(options.include),
		);
	}
	if (options.limit !== null) {
		filteredVideos = filteredVideos.slice(0, options.limit);
	}

	return filteredVideos;
}

export async function runTranscriptBatch(rawOptions) {
	const options = {
		...rawOptions,
		inputRoot: normalizePath(rawOptions.inputRoot ?? PROCESSED_DIRECTORY),
		outputRoot: normalizePath(
			rawOptions.outputRoot ?? DEFAULT_TRANSCRIPTS_DIRECTORY,
		),
		remapFile: normalizePath(rawOptions.remapFile ?? DEFAULT_REMAP_FILE_PATH),
		pythonBin: normalizePath(rawOptions.pythonBin ?? VIDEO_CUT_PYTHON_PATH),
	};

	const pythonBin = options.dryRun
		? options.pythonBin
		: await ensureTranscriptPythonReady(options.pythonBin);
	const videos = await discoverTranscriptVideos(options);
	const manifestPath = path.join(options.outputRoot, "manifest.json");
	const runStartedAt = new Date().toISOString();
	const results = [];

	const writeManifest = async () => {
		await writeRootManifest(manifestPath, {
			generatedAt: new Date().toISOString(),
			runStartedAt,
			inputRoot: options.inputRoot,
			outputRoot: options.outputRoot,
			remapFile: options.remapFile,
			model: options.model,
			language: options.language,
			device: options.device,
			wordTimestamps: options.wordTimestamps,
			workers: options.workers,
			dryRun: options.dryRun,
			items: results,
		});
	};

	await writeManifest();

	if (videos.length === 0) {
		return {
			manifestPath,
			items: [],
			completed: 0,
			skipped: 0,
			failed: 0,
		};
	}

	let cursor = 0;
	const workers = Array.from(
		{ length: Math.min(options.workers, videos.length) },
		() =>
			(async () => {
				while (cursor < videos.length) {
					const currentIndex = cursor;
					cursor += 1;
					const video = videos[currentIndex];
					const startedAt = new Date().toISOString();

					try {
						const transcriptResult = options.dryRun
							? {
									status: "planned",
									outputDirectory: video.outputDirectory,
									expectedFiles: video.expectedFiles,
									logPath: path.join(video.outputDirectory, "whisper.log"),
								}
							: await transcribeVideo(video, {
									...options,
									pythonBin,
								});

						const item = {
							...video,
							status: transcriptResult.status,
							startedAt,
							finishedAt: new Date().toISOString(),
							files: transcriptResult.expectedFiles,
							logPath: transcriptResult.logPath,
						};

						results.push(item);
						await writeVideoManifest(video.outputDirectory, item);
						await writeManifest();
					} catch (error) {
						const item = {
							...video,
							status: "failed",
							startedAt,
							finishedAt: new Date().toISOString(),
							files: video.expectedFiles,
							error:
								error instanceof Error
									? {
											message: error.message,
											details: error.details ?? null,
										}
									: {
											message: String(error),
											details: null,
										},
						};

						results.push(item);
						await writeVideoManifest(video.outputDirectory, item);
						await writeManifest();
					}
				}
			})(),
	);

	await Promise.all(workers);

	const completed = results.filter(
		(item) => item.status === "completed",
	).length;
	const skipped = results.filter((item) => item.status === "skipped").length;
	const failed = results.filter((item) => item.status === "failed").length;
	const planned = results.filter((item) => item.status === "planned").length;

	return {
		manifestPath,
		items: results.sort(
			(left, right) =>
				compareSourceKeys(left.sourceKey, right.sourceKey) ||
				left.fileName.localeCompare(right.fileName),
		),
		completed,
		skipped,
		failed,
		planned,
	};
}
