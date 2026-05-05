import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
	type DoctorProbeResult,
} from "./types";
import { writeJsonArtifact } from "./artifacts";

type PackageScript = {
	packagePath: string;
	scriptName: string;
	command: string;
	proofRole:
		| "dev"
		| "test"
		| "typecheck"
		| "lint"
		| "format"
		| "build"
		| "other";
};

export type CommandProofMap = {
	schemaVersion: typeof DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION;
	generatedAt: number;
	packageScripts: PackageScript[];
	likelyProofCommands: PackageScript[];
	blockedReason?: string;
};

const PROOF_SCRIPT_PRIORITY = [
	"test",
	"typecheck",
	"lint",
	"format",
	"build",
] as const;

export async function writeCommandProofMap({
	repositoryRoot,
	outputPath,
}: {
	repositoryRoot: string;
	outputPath: string;
}): Promise<{ artifact: CommandProofMap; probe: DoctorProbeResult }> {
	const startedAt = Date.now();
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		const artifact: CommandProofMap = {
			schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
			generatedAt: Date.now(),
			packageScripts: [],
			likelyProofCommands: [],
			blockedReason: "No root package.json was found.",
		};
		await writeJsonArtifact({ filePath: outputPath, value: artifact });
		return {
			artifact,
			probe: {
				probeId: "command-proof-map",
				status: "blocked",
				durationMs: Date.now() - startedAt,
				sensitivity: "sync_safe",
				summary: "No root package.json was found.",
				blockedReason: artifact.blockedReason,
				artifactRefs: [outputPath],
			},
		};
	}

	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
		scripts?: Record<string, unknown>;
	};
	const scripts = packageJson.scripts ?? {};
	const packageScripts = Object.entries(scripts)
		.filter((entry): entry is [string, string] => typeof entry[1] === "string")
		.map(([scriptName, command]) => ({
			packagePath: "package.json",
			scriptName,
			command,
			proofRole: classifyScript(scriptName),
		}));
	const likelyProofCommands = packageScripts
		.filter(
			(script) => script.proofRole !== "dev" && script.proofRole !== "other",
		)
		.sort(
			(first, second) => roleRank(first.proofRole) - roleRank(second.proofRole),
		);
	const artifact: CommandProofMap = {
		schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
		generatedAt: Date.now(),
		packageScripts,
		likelyProofCommands,
	};
	await writeJsonArtifact({ filePath: outputPath, value: artifact });
	return {
		artifact,
		probe: {
			probeId: "command-proof-map",
			status: "completed",
			durationMs: Date.now() - startedAt,
			sensitivity: "sync_safe",
			summary: `Mapped ${likelyProofCommands.length} likely proof command(s).`,
			artifactRefs: [outputPath],
		},
	};
}

function roleRank(role: PackageScript["proofRole"]) {
	const index = PROOF_SCRIPT_PRIORITY.findIndex(
		(candidate) => candidate === role,
	);
	return index === -1 ? PROOF_SCRIPT_PRIORITY.length : index;
}

function classifyScript(scriptName: string): PackageScript["proofRole"] {
	const normalized = scriptName.toLowerCase();
	if (["dev", "start", "serve"].includes(normalized)) {
		return "dev";
	}
	if (normalized.includes("test")) {
		return "test";
	}
	if (normalized.includes("typecheck") || normalized.includes("check-types")) {
		return "typecheck";
	}
	if (normalized.includes("lint")) {
		return "lint";
	}
	if (normalized.includes("format") || normalized === "fmt") {
		return "format";
	}
	if (normalized.includes("build")) {
		return "build";
	}
	return "other";
}
