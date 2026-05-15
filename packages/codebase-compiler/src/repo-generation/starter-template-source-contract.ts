import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { resolveRepoRootPath } from "../repo-root";

export const STARTER_TEMPLATE_SOURCE_SCHEMA_VERSION =
	"starter-template-source.v1";
export const STARTER_TEMPLATE_SOURCE_MANIFEST_PATH =
	"templates/starter-app/template-source.json";
export const STARTER_TEMPLATE_SOURCE_ROOT = "templates/starter-app/source";

export type StarterTemplateGeneratedOverlayPolicy = {
	description: string;
	allowedExactPaths: string[];
	allowedPathPrefixes: string[];
	blockedPathPrefixes: string[];
};

export type StarterTemplateSourceManifest = {
	schemaVersion: typeof STARTER_TEMPLATE_SOURCE_SCHEMA_VERSION;
	templateId: "starter-app";
	templateVersion: string;
	sourceRoot: typeof STARTER_TEMPLATE_SOURCE_ROOT;
	sourceLayout: "single-next-app-root";
	fileCount: number;
	contentDigest: string;
	provenance: {
		originKind: "local-directory-snapshot";
		originPathHint: string;
		originGitCommit: string | null;
		capturedAt: string;
		capturedByProgram: string;
		notes: string;
	};
	requiredFiles: string[];
	excludedPathSegments: string[];
	excludedFilePaths: string[];
	generatedOverlayPolicy: StarterTemplateGeneratedOverlayPolicy;
};

export type StarterTemplateSourceVerification = {
	contentDigest: string;
	fileCount: number;
	files: string[];
	manifest: StarterTemplateSourceManifest;
};

type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

type JsonRecord = { [key: string]: JsonValue };

function isRecord(value: JsonValue | undefined): value is JsonRecord {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value: JsonValue | undefined, label: string) {
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`Starter template manifest requires ${label}.`);
	}

	return value;
}

function requireNullableString(value: JsonValue | undefined, label: string) {
	if (value === null || typeof value === "string") {
		return value;
	}

	throw new Error(`Starter template manifest requires ${label}.`);
}

function requireStringArray(
	value: JsonValue | undefined,
	label: string,
): string[] {
	if (
		!Array.isArray(value) ||
		!value.every((item) => typeof item === "string")
	) {
		throw new Error(`Starter template manifest requires ${label}.`);
	}

	return value;
}

function requireNumber(value: JsonValue | undefined, label: string): number {
	if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
		throw new Error(`Starter template manifest requires ${label}.`);
	}

	return value;
}

function normalizeRelativeFilePath(filePath: string) {
	const normalizedPath = filePath.split(path.sep).join("/");
	if (
		normalizedPath.length === 0 ||
		normalizedPath.startsWith("/") ||
		normalizedPath === ".." ||
		normalizedPath.startsWith("../") ||
		normalizedPath.includes("/../")
	) {
		throw new Error(`Invalid starter template source path: ${filePath}`);
	}

	return normalizedPath;
}

function parseGeneratedOverlayPolicy(
	value: JsonValue | undefined,
): StarterTemplateGeneratedOverlayPolicy {
	if (!isRecord(value)) {
		throw new Error(
			"Starter template manifest requires generatedOverlayPolicy.",
		);
	}

	return {
		description: requireString(
			value.description,
			"generatedOverlayPolicy.description",
		),
		allowedExactPaths: requireStringArray(
			value.allowedExactPaths,
			"generatedOverlayPolicy.allowedExactPaths",
		),
		allowedPathPrefixes: requireStringArray(
			value.allowedPathPrefixes,
			"generatedOverlayPolicy.allowedPathPrefixes",
		),
		blockedPathPrefixes: requireStringArray(
			value.blockedPathPrefixes,
			"generatedOverlayPolicy.blockedPathPrefixes",
		),
	};
}

function parseStarterTemplateSourceManifest(
	value: JsonValue,
): StarterTemplateSourceManifest {
	if (!isRecord(value)) {
		throw new Error("Starter template manifest must be a JSON object.");
	}
	if (value.schemaVersion !== STARTER_TEMPLATE_SOURCE_SCHEMA_VERSION) {
		throw new Error(
			`Unsupported starter template manifest schema: ${String(value.schemaVersion)}`,
		);
	}
	if (value.templateId !== "starter-app") {
		throw new Error(
			`Unsupported starter template id: ${String(value.templateId)}`,
		);
	}
	if (value.sourceRoot !== STARTER_TEMPLATE_SOURCE_ROOT) {
		throw new Error(
			`Starter template manifest sourceRoot must be ${STARTER_TEMPLATE_SOURCE_ROOT}.`,
		);
	}
	if (value.sourceLayout !== "single-next-app-root") {
		throw new Error("Starter template manifest sourceLayout is unsupported.");
	}
	if (!isRecord(value.provenance)) {
		throw new Error("Starter template manifest requires provenance.");
	}
	const provenance = value.provenance;
	if (provenance.originKind !== "local-directory-snapshot") {
		throw new Error(
			"Starter template manifest provenance originKind is unsupported.",
		);
	}

	return {
		schemaVersion: STARTER_TEMPLATE_SOURCE_SCHEMA_VERSION,
		templateId: "starter-app",
		templateVersion: requireString(value.templateVersion, "templateVersion"),
		sourceRoot: STARTER_TEMPLATE_SOURCE_ROOT,
		sourceLayout: "single-next-app-root",
		fileCount: requireNumber(value.fileCount, "fileCount"),
		contentDigest: requireString(value.contentDigest, "contentDigest"),
		provenance: {
			originKind: "local-directory-snapshot",
			originPathHint: requireString(
				provenance.originPathHint,
				"provenance.originPathHint",
			),
			originGitCommit: requireNullableString(
				provenance.originGitCommit,
				"provenance.originGitCommit",
			),
			capturedAt: requireString(provenance.capturedAt, "provenance.capturedAt"),
			capturedByProgram: requireString(
				provenance.capturedByProgram,
				"provenance.capturedByProgram",
			),
			notes: requireString(provenance.notes, "provenance.notes"),
		},
		requiredFiles: requireStringArray(value.requiredFiles, "requiredFiles"),
		excludedPathSegments: requireStringArray(
			value.excludedPathSegments,
			"excludedPathSegments",
		),
		excludedFilePaths: requireStringArray(
			value.excludedFilePaths,
			"excludedFilePaths",
		),
		generatedOverlayPolicy: parseGeneratedOverlayPolicy(
			value.generatedOverlayPolicy,
		),
	};
}

export async function loadStarterTemplateSourceManifest(
	repoRootPath = resolveRepoRootPath(),
) {
	const manifestPath = path.join(
		repoRootPath,
		STARTER_TEMPLATE_SOURCE_MANIFEST_PATH,
	);
	return parseStarterTemplateSourceManifest(
		JSON.parse(await readFile(manifestPath, "utf8")) as JsonValue,
	);
}

export function loadStarterTemplateSourceManifestSync(
	repoRootPath = resolveRepoRootPath(),
) {
	const manifestPath = path.join(
		repoRootPath,
		STARTER_TEMPLATE_SOURCE_MANIFEST_PATH,
	);
	return parseStarterTemplateSourceManifest(
		JSON.parse(readFileSync(manifestPath, "utf8")) as JsonValue,
	);
}

async function listFilesRecursive(
	rootPath: string,
	directoryPath: string,
	excludedPathSegments: readonly string[],
): Promise<string[]> {
	const entries = await readdir(directoryPath, { withFileTypes: true });
	const files: string[][] = await Promise.all(
		entries.map(async (entry): Promise<string[]> => {
			const absolutePath = path.join(directoryPath, entry.name);
			const relativePath = normalizeRelativeFilePath(
				path.relative(rootPath, absolutePath),
			);
			if (entry.isDirectory()) {
				if (hasExcludedPathSegment(relativePath, excludedPathSegments)) {
					return [];
				}

				return listFilesRecursive(rootPath, absolutePath, excludedPathSegments);
			}
			if (!entry.isFile()) {
				return [];
			}

			return [relativePath];
		}),
	);

	return files.flat();
}

function listFilesRecursiveSync(
	rootPath: string,
	directoryPath: string,
	excludedPathSegments: readonly string[],
): string[] {
	const entries = readdirSync(directoryPath, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const absolutePath = path.join(directoryPath, entry.name);
		const relativePath = normalizeRelativeFilePath(
			path.relative(rootPath, absolutePath),
		);

		if (entry.isDirectory()) {
			if (hasExcludedPathSegment(relativePath, excludedPathSegments)) {
				return [];
			}

			return listFilesRecursiveSync(
				rootPath,
				absolutePath,
				excludedPathSegments,
			);
		}
		if (!entry.isFile()) {
			return [];
		}

		return [relativePath];
	});
}

export async function listStarterTemplateSourceFiles({
	manifest,
	repoRootPath = resolveRepoRootPath(),
}: {
	manifest: StarterTemplateSourceManifest;
	repoRootPath?: string;
}) {
	const sourceRootPath = path.join(repoRootPath, manifest.sourceRoot);
	return (
		await listFilesRecursive(
			sourceRootPath,
			sourceRootPath,
			manifest.excludedPathSegments,
		)
	)
		.filter(
			(file) =>
				!manifest.excludedFilePaths.includes(file) &&
				!hasExcludedPathSegment(file, manifest.excludedPathSegments),
		)
		.sort();
}

export function listStarterTemplateSourceFilesSync({
	manifest,
	repoRootPath = resolveRepoRootPath(),
}: {
	manifest: StarterTemplateSourceManifest;
	repoRootPath?: string;
}) {
	const sourceRootPath = path.join(repoRootPath, manifest.sourceRoot);
	return listFilesRecursiveSync(
		sourceRootPath,
		sourceRootPath,
		manifest.excludedPathSegments,
	)
		.filter(
			(file) =>
				!manifest.excludedFilePaths.includes(file) &&
				!hasExcludedPathSegment(file, manifest.excludedPathSegments),
		)
		.sort();
}

function hasExcludedPathSegment(
	relativePath: string,
	excludedPathSegments: readonly string[],
) {
	const segments = relativePath.split("/");
	return excludedPathSegments.some((segment) => segments.includes(segment));
}

function assertStarterTemplateSourceFilesAllowed(
	files: readonly string[],
	manifest: StarterTemplateSourceManifest,
) {
	const fileSet = new Set(files);
	const missingRequiredFiles = manifest.requiredFiles.filter(
		(file) => !fileSet.has(file),
	);
	if (missingRequiredFiles.length > 0) {
		throw new Error(
			`Starter template source is missing required files: ${missingRequiredFiles.join(", ")}`,
		);
	}
}

export async function computeStarterTemplateSourceDigest({
	files,
	manifest,
	repoRootPath = resolveRepoRootPath(),
}: {
	files?: readonly string[];
	manifest: StarterTemplateSourceManifest;
	repoRootPath?: string;
}) {
	const sourceFiles =
		files ??
		(await listStarterTemplateSourceFiles({
			manifest,
			repoRootPath,
		}));
	const sourceRootPath = path.join(repoRootPath, manifest.sourceRoot);
	const digest = createHash("sha256");

	for (const sourceFile of sourceFiles) {
		const fileContent = await readFile(path.join(sourceRootPath, sourceFile));
		const fileDigest = createHash("sha256").update(fileContent).digest("hex");
		digest.update(sourceFile);
		digest.update("\0");
		digest.update(fileDigest);
		digest.update("\0");
	}

	return `sha256-${digest.digest("hex")}`;
}

export function isStarterTemplateGeneratedOverlayAllowed(
	outputPath: string,
	manifest: StarterTemplateSourceManifest,
) {
	const normalizedPath = normalizeRelativeFilePath(outputPath);
	const policy = manifest.generatedOverlayPolicy;

	if (
		policy.blockedPathPrefixes.some((prefix) =>
			normalizedPath.startsWith(prefix),
		)
	) {
		return false;
	}

	return (
		policy.allowedExactPaths.includes(normalizedPath) ||
		policy.allowedPathPrefixes.some((prefix) =>
			normalizedPath.startsWith(prefix),
		)
	);
}

export async function verifyStarterTemplateSourceSnapshot(
	repoRootPath = resolveRepoRootPath(),
): Promise<StarterTemplateSourceVerification> {
	const manifest = await loadStarterTemplateSourceManifest(repoRootPath);
	const files = await listStarterTemplateSourceFiles({
		manifest,
		repoRootPath,
	});

	assertStarterTemplateSourceFilesAllowed(files, manifest);

	const contentDigest = await computeStarterTemplateSourceDigest({
		files,
		manifest,
		repoRootPath,
	});

	if (files.length !== manifest.fileCount) {
		throw new Error(
			`Starter template source file count changed. Manifest=${manifest.fileCount}; actual=${files.length}.`,
		);
	}

	if (contentDigest !== manifest.contentDigest) {
		throw new Error(
			`Starter template source digest changed. Manifest=${manifest.contentDigest}; actual=${contentDigest}.`,
		);
	}

	return {
		contentDigest,
		fileCount: files.length,
		files,
		manifest,
	};
}
