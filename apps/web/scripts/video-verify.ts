import { lessonMedia } from "../lib/course/lesson/model/media";
import { getCodebaseVideoInventory } from "../lib/codebase-flow/codebase-stage-videos";
import { verifyBunnyEmbedUrl } from "../lib/course/lesson/lib/video-verification";

type VideoInventoryEntry = {
	key: string;
	title: string;
	url: string;
};

function buildBunnyEmbedUrl(libraryId: number, videoId: string) {
	return `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`;
}

function getLessonVideoInventory(): VideoInventoryEntry[] {
	return Object.entries(lessonMedia).flatMap(([lessonId, video]) => {
		if (
			video?.status !== "ready" ||
			video.provider !== "bunny" ||
			!video.libraryId ||
			!video.videoId
		) {
			return [];
		}

		return [
			{
				key: `lesson:${lessonId}`,
				title: video.title ?? lessonId,
				url: video.url ?? buildBunnyEmbedUrl(video.libraryId, video.videoId),
			},
		];
	});
}

function getCodebaseStageVideoInventory(): VideoInventoryEntry[] {
	return getCodebaseVideoInventory().flatMap((entry) => {
		if (
			entry.video.status !== "ready" ||
			entry.video.provider !== "bunny" ||
			!entry.video.libraryId ||
			!entry.video.videoId
		) {
			return [];
		}

		return [
			{
				key: `codebase:${entry.key}`,
				title: entry.title,
				url:
					entry.video.url ??
					buildBunnyEmbedUrl(entry.video.libraryId, entry.video.videoId),
			},
		];
	});
}

async function main() {
	const inventory = [
		...getLessonVideoInventory(),
		...getCodebaseStageVideoInventory(),
	];
	const failures: string[] = [];

	for (const entry of inventory) {
		const availability = await verifyBunnyEmbedUrl(entry.url);
		const statusLabel = availability.httpStatus ?? "invalid";

		if (availability.kind === "ready") {
			console.log(`OK ${entry.key} | ${entry.title} | ${statusLabel}`);
			continue;
		}

		failures.push(
			`${entry.key} | ${entry.title} | ${statusLabel} | ${entry.url}`,
		);
		console.error(`FAIL ${entry.key} | ${entry.title} | ${statusLabel}`);
	}

	console.log(
		`\nVerified ${inventory.length} Bunny video references. Failures: ${failures.length}.`,
	);

	if (failures.length > 0) {
		console.error("\nUnavailable Bunny embeds:");
		for (const failure of failures) {
			console.error(failure);
		}

		process.exit(1);
	}
}

await main();
