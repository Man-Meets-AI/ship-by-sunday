import {
	parseTranscriptArgs,
	runTranscriptBatch,
} from "./lib/video-transcript-pipeline.mjs";

async function main() {
	const options = parseTranscriptArgs(process.argv.slice(2));
	const result = await runTranscriptBatch(options);

	if (result.items.length === 0) {
		console.log(
			`No transcript candidate videos found in ${options.inputRoot}.`,
		);
		console.log(`Manifest: ${result.manifestPath}`);
		return;
	}

	console.log(`Manifest: ${result.manifestPath}`);
	console.log(`Items: ${result.items.length}`);

	if (options.dryRun) {
		console.log(`Planned: ${result.planned}`);
	} else {
		console.log(`Completed: ${result.completed}`);
		console.log(`Skipped: ${result.skipped}`);
		console.log(`Failed: ${result.failed}`);
	}

	for (const item of result.items) {
		const lessonLabel =
			item.lessonIds.length > 0 ? item.lessonIds.join(", ") : "unresolved";
		console.log(
			`${item.status}\t${item.fileName}\t${lessonLabel}\t${item.durationLabel ?? "unknown"}`,
		);
	}

	if (!options.dryRun && result.failed > 0) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
