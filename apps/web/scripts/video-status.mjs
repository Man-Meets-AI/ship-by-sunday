import { execFile } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
	getRepoLessons,
	listReadyFileNames,
	PROCESSED_DIRECTORY,
	readExistingLessonMedia,
	validateReadyVideoFiles,
} from "./lib/lesson-video-pipeline.mjs";

const execFileAsync = promisify(execFile);

function printSection(title, lines) {
	console.log(`\n${title}`);
	for (const line of lines) {
		console.log(line);
	}
}

async function getProcessedFileNames() {
	try {
		const entries = await readdir(PROCESSED_DIRECTORY, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile() && !entry.name.startsWith("."))
			.map((entry) => entry.name)
			.sort();
	} catch {
		return [];
	}
}

async function getProcessSnapshot() {
	try {
		const { stdout } = await execFileAsync("ps", [
			"-axo",
			"pid,etime,%cpu,command",
		]);
		return stdout
			.split("\n")
			.filter(
				(line) =>
					line.includes("video-publish") ||
					line.includes("jump_cut_vad_parallel") ||
					line.includes("ffmpeg") ||
					line.includes("curl --fail"),
			)
			.filter(Boolean);
	} catch {
		return [];
	}
}

async function getAuphonicSnapshot() {
	const response = await fetch("https://auphonic.com/api/productions.json", {
		headers: {
			Authorization: `Bearer ${process.env.AUPHONIC_API_KEY}`,
		},
	});
	const payload = await response.json();
	return (payload.data ?? []).slice(0, 5).map((item) => ({
		uuid: item.uuid,
		title: item.title,
		status: item.status_string,
	}));
}

async function getBunnySnapshot() {
	const response = await fetch(
		"https://video.bunnycdn.com/library/619172/videos?page=1&itemsPerPage=10",
		{
			headers: {
				AccessKey: process.env.BUNNY_STREAM_API_KEY,
			},
		},
	);
	const payload = await response.json();
	return (payload.items ?? []).slice(0, 10).map((item) => ({
		guid: item.guid,
		title: item.title,
		status: item.status,
		length: item.length,
		encodeProgress: item.encodeProgress,
	}));
}

async function main() {
	const lessons = await getRepoLessons();
	const readyFileNames = await listReadyFileNames();
	const processedFileNames = await getProcessedFileNames();
	const existingMedia = await readExistingLessonMedia();
	const { readyItems, errors } = validateReadyVideoFiles({
		fileNames: readyFileNames,
		validLessons: lessons,
		existingMedia,
		replaceLessonIds: new Set(),
	});
	const processSnapshot = await getProcessSnapshot();
	const auphonic = await getAuphonicSnapshot();
	const bunny = await getBunnySnapshot();

	printSection("Queue", [
		`Ready: ${readyFileNames.length}`,
		`Processed: ${processedFileNames.length}`,
		`Ready lesson-mapped: ${
			readyItems.filter((item) => item.attachmentMode === "lesson").length
		}`,
		`Ready unattached: ${
			readyItems.filter((item) => item.attachmentMode === "unattached").length
		}`,
		`Ready validation errors: ${errors.length}`,
	]);

	printSection(
		"Active Process",
		processSnapshot.length > 0
			? processSnapshot
			: ["No active video publish/cut/upload process found."],
	);

	printSection(
		"Recently Processed",
		processedFileNames.length > 0
			? processedFileNames.slice(-8)
			: [`No files in ${path.basename(PROCESSED_DIRECTORY)} yet.`],
	);

	printSection(
		"Auphonic",
		auphonic.map(
			(item) => `${item.title ?? "(untitled)"} | ${item.status} | ${item.uuid}`,
		),
	);

	printSection(
		"Bunny",
		bunny.map(
			(item) =>
				`${item.title ?? "(untitled)"} | status ${item.status} | ${item.length}s | encode ${item.encodeProgress}% | ${item.guid}`,
		),
	);

	if (errors.length > 0) {
		printSection("Ready Errors", errors);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
