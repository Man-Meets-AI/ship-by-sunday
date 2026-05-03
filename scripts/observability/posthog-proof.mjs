import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const defaultDistDir = "apps/web/.next";
const defaultEnvFile = "apps/web/.env.local";

function parseArgs(argv) {
	const options = {
		dist: defaultDistDir,
		envFile: defaultEnvFile,
	};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = ""] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

function parseDotenv(source) {
	const values = {};

	for (const rawLine of source.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) {
			continue;
		}

		const equalsIndex = line.indexOf("=");
		if (equalsIndex === -1) {
			continue;
		}

		const key = line.slice(0, equalsIndex).trim();
		const rawValue = line.slice(equalsIndex + 1).trim();
		if (!key) {
			continue;
		}

		values[key] = normalizeDotenvValue(rawValue);
	}

	return values;
}

function normalizeDotenvValue(value) {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}

	return value;
}

async function loadEnvFile(envFile) {
	const source = await readFile(envFile, "utf8").catch(() => null);
	if (!source) {
		return {};
	}

	return parseDotenv(source);
}

function normalizeEnvValue(value) {
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: null;
}

function validateEnv(env) {
	const requiredKeys = [
		"NEXT_PUBLIC_POSTHOG_TOKEN",
		"NEXT_PUBLIC_POSTHOG_HOST",
		"POSTHOG_PROJECT_ID",
		"POSTHOG_API_KEY",
	];
	const missing = requiredKeys.filter((key) => !normalizeEnvValue(env[key]));
	const host = normalizeEnvValue(env.NEXT_PUBLIC_POSTHOG_HOST);

	if (host) {
		new URL(host);
	}

	return {
		ok: missing.length === 0,
		missing,
	};
}

async function listFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await listFiles(fullPath)));
			continue;
		}

		files.push(fullPath);
	}

	return files;
}

async function inspectBuildArtifacts(distDir) {
	const resolvedDistDir = path.resolve(distDir);
	const distStat = await stat(resolvedDistDir).catch(() => null);
	if (!distStat?.isDirectory()) {
		return {
			ok: false,
			distDir,
			error: `Missing build directory: ${distDir}`,
			sourceMapFileCount: 0,
			chunkIdFileCount: 0,
			sourceMapsRetained: false,
		};
	}

	const files = await listFiles(resolvedDistDir);
	const mapFiles = files.filter((filePath) => filePath.endsWith(".js.map"));
	const javascriptFiles = files.filter((filePath) => filePath.endsWith(".js"));
	let chunkIdFileCount = 0;

	for (const filePath of javascriptFiles) {
		const source = await readFile(filePath, "utf8").catch(() => "");
		if (source.includes("chunkId=")) {
			chunkIdFileCount += 1;
		}
	}

	return {
		ok: chunkIdFileCount > 0,
		distDir,
		sourceMapFileCount: mapFiles.length,
		chunkIdFileCount,
		sourceMapsRetained: mapFiles.length > 0,
	};
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	writeStdout = (value) => process.stdout.write(value),
} = {}) {
	const options = parseArgs(args);
	const fileEnv = await loadEnvFile(options.envFile);
	const mergedEnv = { ...fileEnv, ...env };
	const envCheck = validateEnv(mergedEnv);
	const artifactCheck = await inspectBuildArtifacts(options.dist);
	const document = {
		ok: envCheck.ok && artifactCheck.ok,
		env: envCheck,
		artifacts: artifactCheck,
		notes: [
			"This proof intentionally reports env presence only, never secret values.",
			"Source maps may be deleted locally after successful upload; injected chunk IDs are the local artifact proof.",
			"Confirm uploaded symbol sets in PostHog after the production build completes.",
		],
	};

	writeStdout(`${JSON.stringify(document, null, 2)}\n`);

	if (!document.ok) {
		process.exitCode = 1;
	}

	return document;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await runCli();
	} catch (error) {
		process.stderr.write(
			`${error instanceof Error ? error.message : String(error)}\n`,
		);
		process.exitCode = 1;
	}
}
