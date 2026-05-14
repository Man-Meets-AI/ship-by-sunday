import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { runBoundedProcess } from "../../core/bounded-process";
import { rollbackShipbysundayWorkerCodexConfigPatch } from "../../core/codex-config-manager";
import type { JsonObject, JsonValue } from "../../core/json-value";
import {
	ROOT_AGENT_END,
	ROOT_AGENT_START,
	STARTER_PROGRAM_ROOT,
	WORKER_DEFAULT_NPM_VERSION,
} from "./constants";
import { WORKER_FOUNDATIONS_INSTALL_BRANCH } from "./manifest";
import type { RootPackageManager, WorkerInstallContext } from "./types";

export function parseJsonObject(text: string): JsonObject | null {
	try {
		const value = JSON.parse(text) as JsonValue;
		return isJsonObject(value) ? value : null;
	} catch {
		return null;
	}
}

export function defaultRootPackageJson(): JsonObject {
	return {
		name: "shipbysunday-worker-project",
		private: true,
		packageManager: `npm@${WORKER_DEFAULT_NPM_VERSION}`,
		scripts: {},
	};
}

export function ensureJsonObjectProperty(object: JsonObject, key: string) {
	const value = object[key];
	if (isJsonObject(value)) {
		return value;
	}
	if (value !== undefined) {
		throw new Error(`package.json#${key} must be an object.`);
	}
	const nextValue: JsonObject = {};
	object[key] = nextValue;
	return nextValue;
}

export function isJsonObject(
	value: JsonValue | undefined,
): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function detectJsonIndent(text: string) {
	return text.match(/\n([ \t]+)"/u)?.[1] ?? "\t";
}

export function detectRootPackageManager({
	packageJson,
	repositoryRoot,
}: {
	packageJson: JsonObject;
	repositoryRoot: string;
}): RootPackageManager {
	const packageManager = packageJson.packageManager;
	if (typeof packageManager === "string") {
		if (packageManager.startsWith("bun@")) return "npm";
		if (packageManager.startsWith("pnpm@")) return "pnpm";
		if (packageManager.startsWith("yarn@")) return "yarn";
		if (packageManager.startsWith("npm@")) return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "pnpm-lock.yaml"))) return "pnpm";
	if (existsSync(path.join(repositoryRoot, "yarn.lock"))) return "yarn";
	if (existsSync(path.join(repositoryRoot, "npm-shrinkwrap.json")))
		return "npm";
	if (existsSync(path.join(repositoryRoot, "package-lock.json"))) return "npm";
	return "npm";
}

export function hasRootPackageManagerLockfile(repositoryRoot: string) {
	return (
		existsSync(path.join(repositoryRoot, "pnpm-lock.yaml")) ||
		existsSync(path.join(repositoryRoot, "yarn.lock")) ||
		existsSync(path.join(repositoryRoot, "npm-shrinkwrap.json")) ||
		existsSync(path.join(repositoryRoot, "package-lock.json"))
	);
}

export async function isGitWorktreeClean(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, ["status", "--porcelain"]);
	return result.succeeded && result.stdout.trim() === "";
}

export async function readCurrentBranch(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD",
	]);
	return result.succeeded ? result.stdout.trim() : null;
}

export async function gitBranchExists(repositoryRoot: string) {
	return (
		await runGit(repositoryRoot, [
			"rev-parse",
			"--verify",
			`refs/heads/${WORKER_FOUNDATIONS_INSTALL_BRANCH}`,
		])
	).succeeded;
}

export async function isGitTrackedRef(repositoryRoot: string, ref: string) {
	return (
		await runGit(repositoryRoot, ["ls-files", "--error-unmatch", "--", ref])
	).succeeded;
}

export async function runGit(repositoryRoot: string, args: string[]) {
	return await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
		timeoutMs: 30_000,
	});
}

export async function rollbackWorkerCodexConfig({
	env,
	backupPath,
}: {
	env: NodeJS.ProcessEnv;
	backupPath: string | null;
}) {
	if (!backupPath) {
		return;
	}
	try {
		await rollbackShipbysundayWorkerCodexConfigPatch({ env, backupPath });
	} catch {
		// Keep the install failure path focused on the original failure.
	}
}

export async function writeRepoFile(
	context: WorkerInstallContext,
	targetRef: string,
	content: string,
) {
	const absolutePath = path.join(context.repositoryRoot, targetRef);
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, normalizeManagedContent(content));
}

export function normalizeManagedContent(content: string) {
	return `${content.replace(/\r\n/g, "\n").trimEnd()}\n`;
}

export function extractManagedBlock(content: string) {
	const normalized = normalizeManagedContent(content);
	const startIndex = normalized.indexOf(ROOT_AGENT_START);
	const endIndex = normalized.indexOf(ROOT_AGENT_END);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error("Worker managed template is missing managed markers.");
	}
	return normalized.slice(startIndex, endIndex + ROOT_AGENT_END.length);
}

export function inspectManagedBlockMarkers(content: string) {
	const normalized = normalizeManagedContent(content);
	const startIndexes = markerIndexes(normalized, ROOT_AGENT_START);
	const endIndexes = markerIndexes(normalized, ROOT_AGENT_END);
	if (startIndexes.length === 0 && endIndexes.length === 0) {
		return "none" as const;
	}
	if (startIndexes.length === 0 || endIndexes.length === 0) {
		return "incomplete" as const;
	}
	if (startIndexes.length !== 1 || endIndexes.length !== 1) {
		return "duplicate" as const;
	}
	return endIndexes[0] < startIndexes[0]
		? ("incomplete" as const)
		: ("single" as const);
}

function markerIndexes(content: string, marker: string) {
	const indexes: number[] = [];
	let searchIndex = 0;
	while (searchIndex < content.length) {
		const index = content.indexOf(marker, searchIndex);
		if (index === -1) {
			break;
		}
		indexes.push(index);
		searchIndex = index + marker.length;
	}
	return indexes;
}

export function replaceOrAppendManagedBlock({
	currentContent,
	managedBlock,
}: {
	currentContent: string;
	managedBlock: string;
}) {
	const normalized = normalizeManagedContent(currentContent);
	const markerStatus = inspectManagedBlockMarkers(normalized);
	if (markerStatus === "duplicate") {
		throw new Error("Existing file has duplicate Worker managed markers.");
	}
	const startIndex = normalized.indexOf(ROOT_AGENT_START);
	const endIndex = normalized.indexOf(ROOT_AGENT_END);
	if (startIndex === -1 && endIndex === -1) {
		return `${normalized.trimEnd()}\n\n${managedBlock}\n`;
	}
	if (markerStatus === "incomplete") {
		throw new Error("Existing file has incomplete Worker managed markers.");
	}
	return `${normalized.slice(0, startIndex).trimEnd()}\n\n${managedBlock}\n\n${normalized.slice(endIndex + ROOT_AGENT_END.length).trimStart()}`;
}

export function isRecognizedStarterChildPlan(content: string) {
	return (
		content.includes("program_id: worker-foundations-adoption") &&
		content.includes(
			`planning_brief: ${STARTER_PROGRAM_ROOT}/planning-brief-1.md`,
		) &&
		content.includes("# Continue Worker Foundations Adoption")
	);
}

export function uniqueRefs(refs: string[]) {
	return [...new Set(refs)].sort();
}

export function isTrackedInstallRef(ref: string) {
	return ref !== ".worker" && !ref.startsWith(".worker/");
}
