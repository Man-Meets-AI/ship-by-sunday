import { existsSync } from "node:fs";
import {
	chmod,
	lstat,
	mkdir,
	readFile,
	readdir,
	unlink,
	writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
	LEGACY_WORKER_BUN_LOCK_CONTENT,
	LEGACY_WORKER_BUN_LOCK_REF,
	STARTER_CHILD_PLAN_REF,
	WORKER_DEFAULT_NPM_VERSION,
} from "./constants";
import {
	WORKER_FOUNDATIONS_INSTALL_BRANCH,
	WORKER_FOUNDATIONS_ROOT_SCRIPTS,
} from "./manifest";
import {
	buildManagedFiles,
	expectedScriptCommand,
	recognizeWorkerScriptCommand,
} from "./templates";
import type {
	ApplyResult,
	RootPackageManager,
	WorkerInstallContext,
	WorkerInstallBlocker,
} from "./types";
import {
	defaultRootPackageJson,
	detectJsonIndent,
	ensureJsonObjectProperty,
	extractManagedBlock,
	gitBranchExists,
	hasRootPackageManagerLockfile,
	inspectManagedBlockMarkers,
	isJsonObject,
	isRecognizedStarterChildPlan,
	normalizeManagedContent,
	parseJsonObject,
	readCurrentBranch,
	replaceOrAppendManagedBlock,
	runGit,
} from "./utils";

export async function prepareInstallBranch(
	context: WorkerInstallContext,
): Promise<{ status: "ready" } | { status: "blocked"; reason: string }> {
	if (
		(await readCurrentBranch(context.repositoryRoot)) ===
		WORKER_FOUNDATIONS_INSTALL_BRANCH
	) {
		return { status: "ready" };
	}
	if (!(await gitBranchExists(context.repositoryRoot))) {
		const createResult = await runGit(context.repositoryRoot, [
			"checkout",
			"-b",
			WORKER_FOUNDATIONS_INSTALL_BRANCH,
		]);
		return createResult.succeeded
			? { status: "ready" }
			: {
					status: "blocked",
					reason: "Could not create shipbysunday/install branch.",
				};
	}
	const ancestorResult = await runGit(context.repositoryRoot, [
		"merge-base",
		"--is-ancestor",
		WORKER_FOUNDATIONS_INSTALL_BRANCH,
		"HEAD",
	]);
	if (!ancestorResult.succeeded) {
		return {
			status: "blocked",
			reason:
				"Existing shipbysunday/install branch contains unmerged work. Review, merge, or delete it before rerunning.",
		};
	}
	const updateResult = await runGit(context.repositoryRoot, [
		"branch",
		"-f",
		WORKER_FOUNDATIONS_INSTALL_BRANCH,
		"HEAD",
	]);
	if (!updateResult.succeeded) {
		return {
			status: "blocked",
			reason: "Could not update shipbysunday/install branch.",
		};
	}
	const checkoutResult = await runGit(context.repositoryRoot, [
		"checkout",
		WORKER_FOUNDATIONS_INSTALL_BRANCH,
	]);
	if (!checkoutResult.succeeded) {
		return {
			status: "blocked",
			reason: "Could not check out shipbysunday/install branch.",
		};
	}
	return { status: "ready" };
}

export async function applyWorkerFoundations(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
): Promise<ApplyResult> {
	const applyResult: ApplyResult = { createdRefs: [], changedRefs: [] };
	await writePackageJsonScripts(context, applyResult);
	await writeManagedFileSet(context, applyResult, packageManager);
	await removeLegacyWorkerBunLock(context, applyResult, packageManager);
	await appendGitInfoExclude(context);
	return applyResult;
}

async function writePackageJsonScripts(
	context: WorkerInstallContext,
	applyResult: ApplyResult,
) {
	const packageJsonPath = path.join(context.repositoryRoot, "package.json");
	const packageJsonExists = existsSync(packageJsonPath);
	const packageJsonText = packageJsonExists
		? await readFile(packageJsonPath, "utf8")
		: "";
	const packageJson = packageJsonExists
		? parseJsonObject(packageJsonText)
		: defaultRootPackageJson();
	if (!packageJson || !isJsonObject(packageJson)) {
		throw new Error("Root package.json must parse before apply.");
	}
	const packageManagerIdentity = packageJson.packageManager;
	if (typeof packageManagerIdentity === "string") {
		if (packageManagerIdentity.startsWith("bun@")) {
			packageJson.packageManager = `npm@${WORKER_DEFAULT_NPM_VERSION}`;
		}
	} else if (!hasRootPackageManagerLockfile(context.repositoryRoot)) {
		packageJson.packageManager = `npm@${WORKER_DEFAULT_NPM_VERSION}`;
	}
	const scripts = ensureJsonObjectProperty(packageJson, "scripts");
	for (const scriptName of WORKER_FOUNDATIONS_ROOT_SCRIPTS) {
		const currentScript = scripts[scriptName];
		const expectedScript = expectedScriptCommand(scriptName);
		if (currentScript === undefined) {
			scripts[scriptName] = expectedScript;
			continue;
		}
		if (typeof currentScript !== "string") {
			throw new Error(
				`Refusing to overwrite unrecognized package script: ${scriptName}`,
			);
		}
		const recognition = recognizeWorkerScriptCommand(scriptName, currentScript);
		if (recognition === "update-managed") {
			scripts[scriptName] = expectedScript;
			continue;
		}
		if (recognition !== "keep") {
			throw new Error(
				`Refusing to overwrite unrecognized package script: ${scriptName}`,
			);
		}
	}
	await writeFile(
		packageJsonPath,
		`${JSON.stringify(packageJson, null, detectJsonIndent(packageJsonText))}\n`,
	);
	if (packageJsonExists) {
		applyResult.changedRefs.push("package.json");
	} else {
		applyResult.createdRefs.push("package.json");
	}
}

async function writeManagedFileSet(
	context: WorkerInstallContext,
	applyResult: ApplyResult,
	packageManager: RootPackageManager,
) {
	for (const file of buildManagedFiles(packageManager)) {
		if (file.managedSection) {
			await writeManagedSectionFile({
				context,
				applyResult,
				targetRef: file.targetRef,
				content: file.content,
			});
			continue;
		}
		await writeCreateOrManagedFile({
			context,
			applyResult,
			targetRef: file.targetRef,
			content: file.content,
			executable: file.executable,
			preserveIfExists: file.preserveIfExists,
		});
	}
	await chmod(
		path.join(context.repositoryRoot, "scripts/run-worker.sh"),
		0o755,
	);
}

async function removeLegacyWorkerBunLock(
	context: WorkerInstallContext,
	applyResult: ApplyResult,
	packageManager: RootPackageManager,
) {
	const absolutePath = path.join(
		context.repositoryRoot,
		LEGACY_WORKER_BUN_LOCK_REF,
	);
	if (!existsSync(absolutePath)) {
		return;
	}
	const currentContent = normalizeManagedContent(
		await readFile(absolutePath, "utf8"),
	);
	if (
		currentContent !== normalizeManagedContent(LEGACY_WORKER_BUN_LOCK_CONTENT)
	) {
		return;
	}
	if (!(await hasRecognizedWorkerAppManagedContent(context, packageManager))) {
		return;
	}
	await unlink(absolutePath);
	applyResult.changedRefs.push(LEGACY_WORKER_BUN_LOCK_REF);
}

export async function findManagedFileBlockers(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const blockers: WorkerInstallBlocker[] = [];
	for (const file of buildManagedFiles(packageManager)) {
		const absolutePath = path.join(context.repositoryRoot, file.targetRef);
		if (!existsSync(absolutePath)) {
			continue;
		}
		if (file.managedSection) {
			const markerStatus = inspectManagedBlockMarkers(
				await readFile(absolutePath, "utf8"),
			);
			if (markerStatus === "incomplete" || markerStatus === "duplicate") {
				blockers.push({
					blockerId: `file-conflict:${file.targetRef}`,
					targetRef: file.targetRef,
					reason: `Existing ${file.targetRef} has ${markerStatus} Worker managed markers.`,
				});
			}
			continue;
		}
		if (file.preserveIfExists) {
			continue;
		}
		const currentContent = normalizeManagedContent(
			await readFile(absolutePath, "utf8"),
		);
		const expectedContent = normalizeManagedContent(file.content);
		if (currentContent !== expectedContent) {
			blockers.push({
				blockerId: `file-conflict:${file.targetRef}`,
				targetRef: file.targetRef,
				reason: "Existing same-name file is not recognized as Worker-managed.",
			});
		}
	}
	blockers.push(...(await findWorkerAppFileBlockers(context, packageManager)));
	const childPlanPath = path.join(
		context.repositoryRoot,
		STARTER_CHILD_PLAN_REF,
	);
	if (existsSync(childPlanPath)) {
		const currentContent = await readFile(childPlanPath, "utf8");
		if (!isRecognizedStarterChildPlan(currentContent)) {
			blockers.push({
				blockerId: `file-conflict:${STARTER_CHILD_PLAN_REF}`,
				targetRef: STARTER_CHILD_PLAN_REF,
				reason:
					"Existing starter child ExecPlan is not recognized as Worker-managed.",
			});
		}
	}
	return blockers;
}

async function findWorkerAppFileBlockers(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const blockers: WorkerInstallBlocker[] = [];
	const workerAppRoot = path.join(context.repositoryRoot, "apps/worker");
	if (!existsSync(workerAppRoot)) {
		return blockers;
	}
	if (!(await lstat(workerAppRoot)).isDirectory()) {
		blockers.push({
			blockerId: "file-conflict:apps/worker",
			targetRef: "apps/worker",
			reason: "Existing apps/worker path is not a Worker-managed directory.",
		});
		return blockers;
	}
	const managedWorkerRefs = new Set(
		buildManagedFiles(packageManager)
			.filter((file) => file.targetRef.startsWith("apps/worker/"))
			.map((file) => file.targetRef),
	);
	for (const targetRef of await collectExistingFileRefs({
		absoluteRoot: workerAppRoot,
		repositoryRoot: context.repositoryRoot,
	})) {
		if (managedWorkerRefs.has(targetRef)) {
			continue;
		}
		if (
			(await isLegacyWorkerManagedFile(context, targetRef)) &&
			(await hasRecognizedWorkerAppManagedContent(context, packageManager))
		) {
			continue;
		}
		blockers.push({
			blockerId: `file-conflict:${targetRef}`,
			targetRef,
			reason: "Existing apps/worker file is not recognized as Worker-managed.",
		});
	}
	return blockers;
}

async function collectExistingFileRefs({
	absoluteRoot,
	repositoryRoot,
}: {
	absoluteRoot: string;
	repositoryRoot: string;
}) {
	const refs: string[] = [];
	await collectExistingFileRefsInto({
		absolutePath: absoluteRoot,
		repositoryRoot,
		refs,
	});
	return refs.sort();
}

async function collectExistingFileRefsInto({
	absolutePath,
	repositoryRoot,
	refs,
}: {
	absolutePath: string;
	repositoryRoot: string;
	refs: string[];
}) {
	for (const entry of await readdir(absolutePath, { withFileTypes: true })) {
		const childPath = path.join(absolutePath, entry.name);
		if (entry.isDirectory()) {
			await collectExistingFileRefsInto({
				absolutePath: childPath,
				repositoryRoot,
				refs,
			});
			continue;
		}
		if (entry.isFile() || entry.isSymbolicLink()) {
			refs.push(
				path.relative(repositoryRoot, childPath).split(path.sep).join("/"),
			);
		}
	}
}

async function isLegacyWorkerManagedFile(
	context: WorkerInstallContext,
	targetRef: string,
) {
	if (targetRef !== LEGACY_WORKER_BUN_LOCK_REF) {
		return false;
	}
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	return (
		normalizeManagedContent(await readFile(absolutePath, "utf8")) ===
		normalizeManagedContent(LEGACY_WORKER_BUN_LOCK_CONTENT)
	);
}

async function hasRecognizedWorkerAppManagedContent(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	let recognizedManagedFileCount = 0;
	for (const file of buildManagedFiles(packageManager)) {
		if (!file.targetRef.startsWith("apps/worker/")) {
			continue;
		}
		const absolutePath = path.join(context.repositoryRoot, file.targetRef);
		if (!existsSync(absolutePath)) {
			continue;
		}
		const currentContent = normalizeManagedContent(
			await readFile(absolutePath, "utf8"),
		);
		if (currentContent !== normalizeManagedContent(file.content)) {
			return false;
		}
		recognizedManagedFileCount += 1;
	}
	return recognizedManagedFileCount > 0;
}

async function writeManagedSectionFile({
	context,
	applyResult,
	targetRef,
	content,
}: {
	context: WorkerInstallContext;
	applyResult: ApplyResult;
	targetRef: string;
	content: string;
}) {
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	if (!existsSync(absolutePath)) {
		await mkdir(path.dirname(absolutePath), { recursive: true });
		await writeFile(absolutePath, normalizeManagedContent(content));
		applyResult.createdRefs.push(targetRef);
		return;
	}
	const currentContent = await readFile(absolutePath, "utf8");
	const nextContent = replaceOrAppendManagedBlock({
		currentContent,
		managedBlock: extractManagedBlock(content),
	});
	if (
		normalizeManagedContent(currentContent) !==
		normalizeManagedContent(nextContent)
	) {
		await writeFile(absolutePath, normalizeManagedContent(nextContent));
		applyResult.changedRefs.push(targetRef);
	}
}

async function writeCreateOrManagedFile({
	context,
	applyResult,
	targetRef,
	content,
	executable = false,
	preserveIfExists = false,
}: {
	context: WorkerInstallContext;
	applyResult: ApplyResult;
	targetRef: string;
	content: string;
	executable?: boolean;
	preserveIfExists?: boolean;
}) {
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	const normalizedContent = normalizeManagedContent(content);
	if (existsSync(absolutePath)) {
		if (preserveIfExists) {
			return;
		}
		const currentContent = normalizeManagedContent(
			await readFile(absolutePath, "utf8"),
		);
		if (currentContent !== normalizedContent) {
			throw new Error(
				`Refusing to overwrite owner-authored file: ${targetRef}`,
			);
		}
		applyResult.changedRefs.push(targetRef);
		return;
	}
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, normalizedContent);
	if (executable) {
		await chmod(absolutePath, 0o755);
	}
	applyResult.createdRefs.push(targetRef);
}

async function appendGitInfoExclude(context: WorkerInstallContext) {
	const excludePath = path.join(
		context.repositoryRoot,
		".git",
		"info",
		"exclude",
	);
	const current = existsSync(excludePath)
		? await readFile(excludePath, "utf8")
		: "";
	const lines = current.split(/\r?\n/).map((line) => line.trim());
	if (!lines.includes(".worker/")) {
		await mkdir(path.dirname(excludePath), { recursive: true });
		await writeFile(
			excludePath,
			`${current.trimEnd()}${current.trim().length > 0 ? "\n" : ""}.worker/\n`,
		);
	}
}
