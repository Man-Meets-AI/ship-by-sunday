import { getRepoLessons } from "./lib/lesson-video-pipeline.mjs";

async function main() {
	const lessons = await getRepoLessons();

	for (const lesson of lessons) {
		console.log(`${lesson.id}\t${lesson.title}`);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
