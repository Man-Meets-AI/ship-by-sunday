import {
	canonicalProjectFactsSchema,
	createCanonicalProjectDefinition,
	deriveStageStatus,
	type CanonicalProjectDefinition,
	type CanonicalProjectDefinitionDraft,
} from "@manmeetsai/packet-compiler";
import {
	buildRepoGenerationManifest,
	buildReviewDownloadZip,
	materializeRepoSnapshot,
} from "@manmeetsai/packet-compiler/server";
import {
	access,
	mkdir,
	mkdtemp,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { createCliError } from "../cli-errors";
import { writeJsonResult } from "../cli-json";
import { loadLocalDraft } from "../draft/draft-store";
import type { CliIo } from "../run-cli";

function resolveCliPath(repoRootPath: string, targetPath: string) {
	return path.isAbsolute(targetPath)
		? targetPath
		: path.resolve(repoRootPath, targetPath);
}

function assertReviewReady(draft: CanonicalProjectDefinitionDraft) {
	const stageStatus = deriveStageStatus(draft.facts);
	if (!stageStatus.packetReadiness.review.isReady) {
		throw createCliError(
			"not_review_ready",
			`Draft is not review-ready. Missing: ${stageStatus.packetReadiness.review.missingFactKeys.join(", ")}`,
			5,
		);
	}
}

function toCompleteDefinition(draft: CanonicalProjectDefinitionDraft) {
	return createCanonicalProjectDefinition({
		clerkUserId: draft.clerkUserId,
		productKey: draft.productKey,
		facts: canonicalProjectFactsSchema.parse(draft.facts),
		placeholdersInUse: draft.placeholdersInUse,
		createdAt: draft.createdAt,
		updatedAt: draft.updatedAt,
	});
}

async function writeRepoDirectory({
	outPath,
	repoName,
	files,
}: {
	outPath: string;
	repoName: string;
	files: Awaited<ReturnType<typeof materializeRepoSnapshot>>;
}) {
	const absoluteOutPath = path.resolve(outPath);
	await mkdir(path.dirname(absoluteOutPath), { recursive: true });
	const temporaryOutPath = await mkdtemp(
		path.join(path.dirname(absoluteOutPath), "ship-by-sunday-cli-"),
	);

	try {
		for (const file of files) {
			const targetFilePath = path.join(temporaryOutPath, repoName, file.path);
			await mkdir(path.dirname(targetFilePath), { recursive: true });
			await writeFile(targetFilePath, file.content);
		}
		await rename(temporaryOutPath, absoluteOutPath);
	} catch (error) {
		await rm(temporaryOutPath, { recursive: true, force: true });
		throw error;
	}

	return absoluteOutPath;
}

async function outputPathExists(outPath: string) {
	try {
		await access(outPath);
		return true;
	} catch {
		return false;
	}
}

function buildDryRunResult({
	projectDefinition,
	absoluteOutPath,
	zip,
	force,
}: {
	projectDefinition: CanonicalProjectDefinition;
	absoluteOutPath: string;
	zip: boolean;
	force: boolean;
}) {
	const repoManifest = buildRepoGenerationManifest(projectDefinition);

	return {
		reviewReady: true,
		mode: zip ? "zip" : "directory",
		outputPath: zip
			? absoluteOutPath
			: `${absoluteOutPath}/${repoManifest.repoName}`,
		repoName: repoManifest.repoName,
		force,
	};
}

export async function handleGenerateCommand({
	io,
	repoRootPath,
	outPath,
	zip,
	force,
	json,
	dryRun,
}: {
	io: CliIo;
	repoRootPath: string;
	outPath: string;
	zip: boolean;
	force: boolean;
	json: boolean;
	dryRun: boolean;
}) {
	const absoluteOutPath = resolveCliPath(repoRootPath, outPath);
	const draft = await loadLocalDraft(repoRootPath);
	if (!draft) {
		if (dryRun) {
			const dryRunNoDraftResult = {
				reviewReady: false,
				mode: zip ? "zip" : "directory",
				outputPath: absoluteOutPath,
				blockers: ["missing_draft"],
			};
			if (json) {
				writeJsonResult(io, "generate", dryRunNoDraftResult);
				return 0;
			}
			io.write(
				[
					"Generate dry run",
					"",
					"No local draft exists yet.",
					"Blockers: missing_draft",
				].join("\n"),
			);
			return 0;
		}

		throw createCliError(
			"missing_draft",
			"No local Ship by Sunday draft exists yet.",
			4,
		);
	}

	const stageStatus = deriveStageStatus(draft.facts);
	if (dryRun) {
		if (!stageStatus.packetReadiness.review.isReady) {
			const dryRunBlockedResult = {
				reviewReady: false,
				mode: zip ? "zip" : "directory",
				outputPath: absoluteOutPath,
				blockers: stageStatus.packetReadiness.review.missingFactKeys,
			};
			if (json) {
				writeJsonResult(io, "generate", dryRunBlockedResult);
				return 0;
			}
			io.write(
				[
					"Generate dry run",
					"",
					"Draft is not review-ready.",
					`Blockers: ${stageStatus.packetReadiness.review.missingFactKeys.join(", ")}`,
				].join("\n"),
			);
			return 0;
		}

		const projectDefinition = toCompleteDefinition(draft);
		const dryRunResult = buildDryRunResult({
			projectDefinition,
			absoluteOutPath,
			zip,
			force,
		});
		if (json) {
			writeJsonResult(io, "generate", dryRunResult);
			return 0;
		}
		io.write(
			[
				"Generate dry run",
				"",
				`Mode: ${dryRunResult.mode}`,
				`Output path: ${dryRunResult.outputPath}`,
				`Repo name: ${dryRunResult.repoName}`,
			].join("\n"),
		);
		return 0;
	}

	assertReviewReady(draft);
	const projectDefinition = toCompleteDefinition(draft);

	if (!force && (await outputPathExists(absoluteOutPath))) {
		throw createCliError(
			"already_exists",
			`Output path ${absoluteOutPath} already exists. Re-run with --force to overwrite it.`,
			3,
		);
	}

	if (zip) {
		const zipBuffer = await buildReviewDownloadZip(projectDefinition);
		await mkdir(path.dirname(absoluteOutPath), { recursive: true });
		await writeFile(absoluteOutPath, zipBuffer, {
			flag: force ? "w" : "wx",
		});
		if (json) {
			writeJsonResult(io, "generate", {
				mode: "zip",
				outputPath: absoluteOutPath,
				repoName: buildRepoGenerationManifest(projectDefinition).repoName,
			});
			return 0;
		}
		io.write(`Generated repo zip at ${absoluteOutPath}`);
		return 0;
	}

	await rm(absoluteOutPath, { recursive: true, force: true });
	const repoFiles = await materializeRepoSnapshot(projectDefinition);
	const repoManifest = buildRepoGenerationManifest(projectDefinition);
	const outputDirectoryPath = await writeRepoDirectory({
		outPath: absoluteOutPath,
		repoName: repoManifest.repoName,
		files: repoFiles,
	});
	if (json) {
		writeJsonResult(io, "generate", {
			mode: "directory",
			outputPath: `${outputDirectoryPath}/${repoManifest.repoName}`,
			repoName: repoManifest.repoName,
		});
		return 0;
	}
	io.write(
		`Generated repo directory at ${outputDirectoryPath}/${repoManifest.repoName}`,
	);
	return 0;
}
