import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const DEFAULT_SOURCE_ROOTS = ["apps/web", "packages", "scripts"];
const IGNORED_DIRECTORY_NAMES = new Set([
	".next",
	"coverage",
	"dist",
	"node_modules",
	"vendor",
	"_generated",
]);
const SOURCE_FILE_PATTERN = /\.(cts|mts|ts|tsx)$/;
const TEST_FILE_PATTERN =
	/(^|\/)(tests?\/|__tests__\/)|\.test\.(cts|mts|ts|tsx)$/;

const ROUTE_HANDLER_PATTERNS = [
	/^apps\/web\/app\/api\/.*\/route\.ts$/,
	/^apps\/web\/convex\/http\.ts$/,
];

const DATABASE_LOADING_PATTERNS = [
	/^apps\/web\/convex\//,
	/^apps\/web\/lib\/course\/lesson\/model\//,
	/(^|\/)[^/]*read-model\.ts$/,
];

export type UnknownBoundaryViolation = {
	relativePath: string;
	line: number;
	column: number;
};

export function collectUnknownBoundaryViolations(
	rootDirectory: string,
	sourceRoots: readonly string[] = DEFAULT_SOURCE_ROOTS,
): UnknownBoundaryViolation[] {
	const violations: UnknownBoundaryViolation[] = [];

	for (const sourceRoot of sourceRoots) {
		const absoluteSourceRoot = path.join(rootDirectory, sourceRoot);

		for (const absolutePath of walkSourceFiles(
			rootDirectory,
			absoluteSourceRoot,
		)) {
			const relativePath = toPosixPath(
				path.relative(rootDirectory, absolutePath),
			);

			if (allowsUnknownBoundaryType(relativePath)) {
				continue;
			}

			violations.push(
				...collectFileUnknownTypeViolations(absolutePath, relativePath),
			);
		}
	}

	return violations;
}

export function allowsUnknownBoundaryType(relativePath: string) {
	const normalizedPath = toPosixPath(relativePath);

	return (
		ROUTE_HANDLER_PATTERNS.some((pattern) => pattern.test(normalizedPath)) ||
		DATABASE_LOADING_PATTERNS.some((pattern) => pattern.test(normalizedPath))
	);
}

export function formatUnknownBoundaryViolations(
	violations: readonly UnknownBoundaryViolation[],
) {
	const lines = [
		"Explicit `unknown` is only allowed in route handlers and DB-loading boundaries.",
		"Move validation to those boundaries, then pass typed values through the source tree.",
		"",
	];

	for (const violation of violations) {
		lines.push(
			`${violation.relativePath}:${violation.line}:${violation.column} uses \`unknown\` outside an allowed boundary.`,
		);
	}

	return lines.join("\n");
}

function collectFileUnknownTypeViolations(
	absolutePath: string,
	relativePath: string,
) {
	const sourceText = readFileSync(absolutePath, "utf8");
	const sourceFile = ts.createSourceFile(
		absolutePath,
		sourceText,
		ts.ScriptTarget.Latest,
		true,
		getScriptKind(absolutePath),
	);
	const violations: UnknownBoundaryViolation[] = [];

	function visit(node: ts.Node) {
		if (node.kind === ts.SyntaxKind.UnknownKeyword) {
			const location = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(sourceFile),
			);

			violations.push({
				relativePath,
				line: location.line + 1,
				column: location.character + 1,
			});
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	return violations;
}

function* walkSourceFiles(
	rootDirectory: string,
	currentDirectory: string,
): Generator<string> {
	for (const entryName of readdirSync(currentDirectory)) {
		const absolutePath = path.join(currentDirectory, entryName);
		const relativePath = toPosixPath(
			path.relative(rootDirectory, absolutePath),
		);

		if (shouldSkipPath(relativePath)) {
			continue;
		}

		const pathStats = statSync(absolutePath);

		if (pathStats.isDirectory()) {
			yield* walkSourceFiles(rootDirectory, absolutePath);
			continue;
		}

		if (isSourceFile(relativePath)) {
			yield absolutePath;
		}
	}
}

function shouldSkipPath(relativePath: string) {
	const pathParts = relativePath.split("/");

	return pathParts.some((part) => IGNORED_DIRECTORY_NAMES.has(part));
}

function isSourceFile(relativePath: string) {
	return (
		SOURCE_FILE_PATTERN.test(relativePath) &&
		!TEST_FILE_PATTERN.test(relativePath)
	);
}

function getScriptKind(filePath: string) {
	if (filePath.endsWith(".tsx")) {
		return ts.ScriptKind.TSX;
	}

	if (filePath.endsWith(".jsx")) {
		return ts.ScriptKind.JSX;
	}

	return ts.ScriptKind.TS;
}

function toPosixPath(filePath: string) {
	return filePath.split(path.sep).join("/");
}

if (import.meta.main) {
	const violations = collectUnknownBoundaryViolations(process.cwd());

	if (violations.length > 0) {
		console.error(formatUnknownBoundaryViolations(violations));
		process.exit(1);
	}

	console.log("unknown-boundary-lint: passed");
}
