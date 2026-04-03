import { type CanonicalProjectDefinition } from "@manmeetsai/blueprint-compiler";
import {
	buildRepoGenerationManifest,
	buildReviewDownloadZip,
	materializeRepoSnapshot,
} from "@manmeetsai/blueprint-compiler/server";
import { mkdir, mkdtemp, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildCanonicalProjectDefinitionFromCliFacts } from "../blueprint-derivation";
import { createCliError } from "../cli-errors";
import { writeJsonResult } from "../cli-json";
import { deriveLocalDraftStatus, loadLocalDraft } from "../draft/draft-store";
import type { CliIo } from "../run-cli";
import { resolveProjectPath } from "../cli-paths";

function assertReviewReady(draft: Awaited<ReturnType<typeof loadLocalDraft>>) {
	if (!draft) {
		throw createCliError(
			"missing_draft",
			"No local Ship by Sunday draft exists yet.",
			4,
		);
	}

	const stageStatus = deriveLocalDraftStatus(draft.facts);
	if (!stageStatus.blueprintReadiness.review.isReady) {
		throw createCliError(
			"not_review_ready",
			`Draft is not review-ready. Missing: ${stageStatus.blueprintReadiness.review.missingFactKeys.join(", ")}`,
			5,
		);
	}
}

type OutputPathKind = "missing" | "file" | "directory";

async function getPathKind(filePath: string): Promise<OutputPathKind> {
	try {
		return (await stat(filePath)).isDirectory() ? "directory" : "file";
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			return "missing";
		}

		throw error;
	}
}

async function writeRepoDirectory({
	outputContainerPath,
	repoName,
	files,
}: {
	outputContainerPath: string;
	repoName: string;
	files: Awaited<ReturnType<typeof materializeRepoSnapshot>>;
}) {
	const finalRepoDirectoryPath = path.join(outputContainerPath, repoName);
	await mkdir(outputContainerPath, { recursive: true });
	const temporaryRepoDirectoryPath = await mkdtemp(
		path.join(outputContainerPath, "ship-by-sunday-cli-"),
	);

	try {
		for (const file of files) {
			const targetFilePath = path.join(temporaryRepoDirectoryPath, file.path);
			await mkdir(path.dirname(targetFilePath), { recursive: true });
			await writeFile(targetFilePath, file.content);
		}
		await rename(temporaryRepoDirectoryPath, finalRepoDirectoryPath);
	} catch (error) {
		await rm(temporaryRepoDirectoryPath, { recursive: true, force: true });
		throw error;
	}

	return finalRepoDirectoryPath;
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
			: path.join(absoluteOutPath, repoManifest.repoName),
		repoName: repoManifest.repoName,
		force,
	};
}

export async function handleGenerateCommand({
	io,
	projectRootPath,
	outPath,
	zip,
	force,
	json,
	dryRun,
}: {
	io: CliIo;
	projectRootPath: string;
	outPath: string;
	zip: boolean;
	force: boolean;
	json: boolean;
	dryRun: boolean;
}) {
	const absoluteOutPath = resolveProjectPath(projectRootPath, outPath);
	const draft = await loadLocalDraft(projectRootPath);
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

	const stageStatus = deriveLocalDraftStatus(draft.facts);
	if (dryRun) {
		if (!stageStatus.blueprintReadiness.review.isReady) {
			const dryRunBlockedResult = {
				reviewReady: false,
				mode: zip ? "zip" : "directory",
				outputPath: absoluteOutPath,
				blockers: stageStatus.blueprintReadiness.review.missingFactKeys,
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
					`Blockers: ${stageStatus.blueprintReadiness.review.missingFactKeys.join(", ")}`,
				].join("\n"),
			);
			return 0;
		}

		const projectDefinition = buildCanonicalProjectDefinitionFromCliFacts({
			clerkUserId: draft.clerkUserId,
			productKey: draft.productKey,
			facts: draft.facts,
			createdAt: draft.createdAt,
			updatedAt: draft.updatedAt,
			placeholdersInUse:
				draft.placeholdersInUse as CanonicalProjectDefinition["placeholdersInUse"],
		});
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
	const projectDefinition = buildCanonicalProjectDefinitionFromCliFacts({
		clerkUserId: draft.clerkUserId,
		productKey: draft.productKey,
		facts: draft.facts,
		createdAt: draft.createdAt,
		updatedAt: draft.updatedAt,
		placeholdersInUse:
			draft.placeholdersInUse as CanonicalProjectDefinition["placeholdersInUse"],
	});
	const repoManifest = buildRepoGenerationManifest(projectDefinition);
	const finalDirectoryPath = path.join(absoluteOutPath, repoManifest.repoName);

	if (!zip) {
		const containerKind = await getPathKind(absoluteOutPath);
		if (containerKind === "file") {
			throw createCliError(
				"invalid_state",
				`Output path ${absoluteOutPath} is a file. Use a directory path for directory generation.`,
				1,
			);
		}
	}

	const targetPath = zip ? absoluteOutPath : finalDirectoryPath;
	const targetPathKind = await getPathKind(targetPath);

	if (zip) {
		if (targetPathKind === "directory") {
			throw createCliError(
				"invalid_state",
				`Output path ${targetPath} is a directory. Use a file path for zip generation.`,
				1,
			);
		}
		if (targetPathKind === "file" && !force) {
			throw createCliError(
				"already_exists",
				`Output path ${targetPath} already exists. Re-run with --force to overwrite it.`,
				3,
			);
		}
	} else {
		if (targetPathKind === "file") {
			throw createCliError(
				"invalid_state",
				`Output path ${targetPath} is a file. Use a directory path for directory generation.`,
				1,
			);
		}
		if (targetPathKind === "directory" && !force) {
			throw createCliError(
				"already_exists",
				`Output path ${targetPath} already exists. Re-run with --force to overwrite it.`,
				3,
			);
		}
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
				repoName: repoManifest.repoName,
			});
			return 0;
		}
		io.write(`Generated repo zip at ${absoluteOutPath}`);
		return 0;
	}

	if (targetPathKind === "directory") {
		await rm(finalDirectoryPath, { recursive: true, force: true });
	}

	const repoFiles = await materializeRepoSnapshot(projectDefinition);
	const outputDirectoryPath = await writeRepoDirectory({
		outputContainerPath: absoluteOutPath,
		repoName: repoManifest.repoName,
		files: repoFiles,
	});
	if (json) {
		writeJsonResult(io, "generate", {
			mode: "directory",
			outputPath: outputDirectoryPath,
			repoName: repoManifest.repoName,
		});
		return 0;
	}
	io.write(`Generated repo directory at ${outputDirectoryPath}`);
	return 0;
}
