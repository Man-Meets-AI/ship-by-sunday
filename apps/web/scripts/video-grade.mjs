import { spawn } from "node:child_process";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

import {
	COLOR_CORRECTION_DIRECTORY,
	COLOR_GRADED_DIRECTORY,
	createRunId,
	parseOnlyFileNames,
	writeRunReport,
} from "./lib/lesson-video-pipeline.mjs";

const DEFAULT_LUT_PATH =
	"/Volumes/2TB SSD Video/Oliur - Video Creator Course/07-Bonus/LUT 01 by Oliur/Oliur 01.cube";
const DEFAULT_LUT_MIX = 0.15;
const SUPPORTED_VIDEO_EXTENSIONS = new Set([
	".avi",
	".m4v",
	".mkv",
	".mov",
	".mp4",
	".webm",
]);

function parseGradeOptions(argv) {
	const options = {
		lutPath: DEFAULT_LUT_PATH,
		lutMix: DEFAULT_LUT_MIX,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		if (!current) {
			continue;
		}

		if (current.startsWith("--lut-path=")) {
			options.lutPath = current.slice("--lut-path=".length).trim();
			continue;
		}

		if (current === "--lut-path") {
			options.lutPath = (argv[index + 1] ?? "").trim();
			index += 1;
			continue;
		}

		if (current.startsWith("--lut-mix=")) {
			options.lutMix = Number.parseFloat(current.slice("--lut-mix=".length));
			continue;
		}

		if (current === "--lut-mix") {
			options.lutMix = Number.parseFloat(argv[index + 1] ?? "");
			index += 1;
		}
	}

	if (!options.lutPath) {
		throw new Error("Missing LUT path.");
	}

	if (
		!Number.isFinite(options.lutMix) ||
		options.lutMix < 0 ||
		options.lutMix > 1
	) {
		throw new Error("LUT mix must be a number between 0 and 1.");
	}

	return options;
}

function escapeFilterPath(value) {
	return String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function buildFilterComplex(lutPath, lutMix) {
	const mix = Number(lutMix).toFixed(4);
	const originalMix = (1 - Number(lutMix)).toFixed(4);
	return [
		"[0:v]split=2[base][grade]",
		`[grade]lut3d=file='${escapeFilterPath(lutPath)}':interp=trilinear[lutted]`,
		`[lutted][base]blend=all_expr='A*${mix}+B*${originalMix}'[v]`,
	].join(";");
}

async function listColorCorrectionFileNames() {
	const entries = await readdir(COLOR_CORRECTION_DIRECTORY, {
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

async function getAvailableOutputPath(fileName, runId) {
	const directPath = path.join(COLOR_GRADED_DIRECTORY, fileName);
	try {
		await stat(directPath);
	} catch (error) {
		if (error?.code === "ENOENT") {
			return directPath;
		}
		throw error;
	}

	return path.join(COLOR_GRADED_DIRECTORY, `${runId}--${fileName}`);
}

async function runFfmpegGrade({ inputPath, outputPath, lutPath, lutMix }) {
	const filterComplex = buildFilterComplex(lutPath, lutMix);

	const hardwareArgs = [
		"-y",
		"-i",
		inputPath,
		"-filter_complex",
		filterComplex,
		"-map",
		"[v]",
		"-map",
		"0:a?",
		"-c:v",
		"h264_videotoolbox",
		"-b:v",
		"10M",
		"-c:a",
		"copy",
		outputPath,
	];

	try {
		await runCommand("ffmpeg", hardwareArgs);
		return "h264_videotoolbox";
	} catch {
		const softwareArgs = [
			"-y",
			"-i",
			inputPath,
			"-filter_complex",
			filterComplex,
			"-map",
			"[v]",
			"-map",
			"0:a?",
			"-c:v",
			"libx264",
			"-preset",
			"fast",
			"-crf",
			"18",
			"-c:a",
			"copy",
			outputPath,
		];
		await runCommand("ffmpeg", softwareArgs);
		return "libx264";
	}
}

async function runCommand(command, args) {
	await new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
			stdio: "inherit",
		});

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`${command} exited with code ${code ?? 1}.`));
		});
	});
}

async function main() {
	const runId = createRunId();
	const onlyFileNames = parseOnlyFileNames(process.argv.slice(2));
	const gradeOptions = parseGradeOptions(process.argv.slice(2));
	const allColorCorrectionFileNames = await listColorCorrectionFileNames();
	const inputFileNames =
		onlyFileNames.size > 0
			? allColorCorrectionFileNames.filter((fileName) =>
					onlyFileNames.has(fileName),
				)
			: allColorCorrectionFileNames;
	const report = {
		runId,
		startedAt: new Date().toISOString(),
		inputDirectory: COLOR_CORRECTION_DIRECTORY,
		outputDirectory: COLOR_GRADED_DIRECTORY,
		onlyFileNames: [...onlyFileNames].sort(),
		inputFileNames,
		gradeOptions,
		successes: [],
		failures: [],
		validationErrors: [],
	};

	if (onlyFileNames.size > 0) {
		const missingFileNames = [...onlyFileNames].filter(
			(fileName) => !allColorCorrectionFileNames.includes(fileName),
		);
		if (missingFileNames.length > 0) {
			const reportPath = await writeRunReport(runId, {
				...report,
				validationErrors: missingFileNames.map(
					(fileName) =>
						`${fileName}: not found in ${COLOR_CORRECTION_DIRECTORY}.`,
				),
				completedAt: new Date().toISOString(),
			});
			for (const fileName of missingFileNames) {
				console.error(
					`Validation error: ${fileName} not found in Color Correction.`,
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
		console.log(
			`No color-correction handoff videos found in ${COLOR_CORRECTION_DIRECTORY}.`,
		);
		console.log(`Run report: ${reportPath}`);
		return;
	}

	await mkdir(COLOR_GRADED_DIRECTORY, { recursive: true });

	for (const fileName of inputFileNames) {
		const inputPath = path.join(COLOR_CORRECTION_DIRECTORY, fileName);
		const outputPath = await getAvailableOutputPath(fileName, runId);
		console.log(
			`Grading ${fileName} with ${path.basename(gradeOptions.lutPath)} @ ${Math.round(
				gradeOptions.lutMix * 100,
			)}%`,
		);

		try {
			const encoder = await runFfmpegGrade({
				inputPath,
				outputPath,
				lutPath: gradeOptions.lutPath,
				lutMix: gradeOptions.lutMix,
			});
			report.successes.push({
				fileName,
				inputPath,
				outputPath,
				encoder,
			});
			console.log(`Graded ${fileName} -> ${outputPath}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			report.failures.push({
				fileName,
				inputPath,
				error: message,
			});
			console.error(`Failed ${fileName}: ${message}`);
		}
	}

	const reportPath = await writeRunReport(runId, {
		...report,
		completedAt: new Date().toISOString(),
	});

	console.log(
		`Video color grade complete: ${report.successes.length} succeeded, ${report.failures.length} failed.`,
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
