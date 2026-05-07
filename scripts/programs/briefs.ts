import { access, readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const PROGRAMS_ACTIVE_ROOT = "docs/programs/active";
export const PROGRAMS_COMPLETED_ROOT = "docs/programs/completed";
export const PROGRAMS_PACKET_ROOT = PROGRAMS_ACTIVE_ROOT;
export const CURRENT_PLANNING_BRIEF_POINTER_FILENAME =
	"current-planning-brief.txt";
export const PROGRAM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const BRIEF_STATUS_VALUES = new Set(["current", "superseded"]);
export const VERSIONED_BRIEF_PATH_PATTERN =
	/^docs\/programs\/(active|completed)\/(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\/planning-brief-(\d+)\.md$/;

export type ProgramBriefPathParts = {
	briefVersion: number;
	createdAt: string;
	programId: string;
	rootKind: "active" | "completed";
};

export function buildProgramPacketDirectoryName(params: {
	createdAt: string;
	programId: string;
}): string {
	return `${params.createdAt}-${params.programId}`;
}

export function getProgramsPacketRootPath(repoRootDir: string): string {
	return path.join(repoRootDir, PROGRAMS_ACTIVE_ROOT);
}

export function getProgramPacketPath(
	repoRootDir: string,
	params: {
		createdAt: string;
		programId: string;
	},
): string {
	return path.join(
		getProgramsPacketRootPath(repoRootDir),
		buildProgramPacketDirectoryName(params),
	);
}

export async function resolveProgramPacketPath(params: {
	programId: string;
	repoRootDir: string;
}): Promise<string> {
	const packetRootPath = getProgramsPacketRootPath(params.repoRootDir);
	let entries;
	try {
		entries = await readdir(packetRootPath, { withFileTypes: true });
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			throw new Error(
				`No Program packet directories exist under ${PROGRAMS_PACKET_ROOT}/.`,
			);
		}
		throw error;
	}
	const matches = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.filter((entryName) => {
			const parts = parseProgramPacketDirectoryName(entryName);
			return parts?.programId === params.programId;
		});

	if (matches.length === 0) {
		throw new Error(
			`No Program packet directory exists for ${params.programId} under ${PROGRAMS_PACKET_ROOT}/.`,
		);
	}

	if (matches.length > 1) {
		throw new Error(
			`Multiple Program packet directories exist for ${params.programId} under ${PROGRAMS_PACKET_ROOT}/.`,
		);
	}

	return path.join(packetRootPath, matches[0] ?? "");
}

export function getCurrentPlanningBriefPointerPath(
	repoRootDir: string,
	params: {
		createdAt: string;
		programId: string;
	},
): string {
	return path.join(
		getProgramPacketPath(repoRootDir, params),
		CURRENT_PLANNING_BRIEF_POINTER_FILENAME,
	);
}

export function isProgramId(
	value: string | number | boolean | object | null | undefined,
): value is string {
	return typeof value === "string" && PROGRAM_ID_PATTERN.test(value);
}

export function parseVersionedBriefRepoPath(
	repoRelativePath: string,
): ProgramBriefPathParts | null {
	const normalizedPath = repoRelativePath.replaceAll(path.sep, "/");
	const match = normalizedPath.match(VERSIONED_BRIEF_PATH_PATTERN);
	if (!match) {
		return null;
	}

	const briefVersion = Number.parseInt(match[4] ?? "", 10);
	const rootKind = match[1];
	if (!Number.isInteger(briefVersion) || briefVersion <= 0) {
		return null;
	}

	return {
		rootKind: rootKind === "completed" ? "completed" : "active",
		createdAt: match[2] ?? "",
		programId: match[3] ?? "",
		briefVersion,
	};
}

export function parseProgramPacketDirectoryName(
	directoryName: string,
): { createdAt: string; programId: string } | null {
	const match = directoryName.match(
		/^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/,
	);
	if (!match) {
		return null;
	}

	return {
		createdAt: match[1] ?? "",
		programId: match[2] ?? "",
	};
}

export function toRepoRelativePath(
	repoRootDir: string,
	absolutePath: string,
): string {
	return path.relative(repoRootDir, absolutePath).replaceAll(path.sep, "/");
}

export async function resolveCurrentPlanningBrief(params: {
	programId: string;
	repoRootDir: string;
}): Promise<{
	planningBriefPath: string;
	pointerPath: string;
}> {
	const packetPath = await resolveProgramPacketPath(params);
	const pointerPath = path.join(
		packetPath,
		CURRENT_PLANNING_BRIEF_POINTER_FILENAME,
	);
	const pointerContents = await readFile(pointerPath, "utf8");
	const lines = pointerContents
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line !== "");

	if (lines.length !== 1) {
		throw new Error(
			`${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} must contain exactly one non-empty planning brief filename.`,
		);
	}

	const planningBriefFilename = lines[0] ?? "";
	if (
		planningBriefFilename.includes("/") ||
		planningBriefFilename.includes("\\")
	) {
		throw new Error(
			`${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} must contain only a planning brief filename, not a path.`,
		);
	}

	const planningBriefPath = toRepoRelativePath(
		params.repoRootDir,
		path.join(packetPath, planningBriefFilename),
	);
	const parsedPath = parseVersionedBriefRepoPath(planningBriefPath);
	if (!parsedPath) {
		throw new Error(
			`${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} must point to planning-brief-<N>.md inside the Program packet directory.`,
		);
	}

	await access(path.join(params.repoRootDir, planningBriefPath));
	return {
		planningBriefPath,
		pointerPath: toRepoRelativePath(params.repoRootDir, pointerPath),
	};
}
