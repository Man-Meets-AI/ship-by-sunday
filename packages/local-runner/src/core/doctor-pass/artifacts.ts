import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Context, Effect, Layer } from "effect";

import type { JsonValue } from "../json-value";
import { getLocalStateDirectory } from "../local-project-state";
import { runLocalRunnerEffect } from "../../effect/runtime";

export function createDoctorPassRunId(now = new Date()) {
	const timestamp = now
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}Z$/, "Z");
	return `${timestamp}-${randomUUID().slice(0, 8)}`;
}

export function getDoctorPassReportsDirectory(repositoryRoot: string) {
	return path.join(
		getLocalStateDirectory(repositoryRoot),
		"reports",
		"doctor-pass",
	);
}

export function getDoctorPassReportDirectory({
	repositoryRoot,
	runId,
}: {
	repositoryRoot: string;
	runId: string;
}) {
	return path.join(getDoctorPassReportsDirectory(repositoryRoot), runId);
}

export function getDoctorPassLocalReportRef(
	runId: string,
	artifactName: string,
) {
	return `.sbs/reports/doctor-pass/${runId}/${artifactName}`;
}

type EnsureDoctorPassReportDirectoryRequest = {
	repositoryRoot: string;
	runId: string;
};

type WriteJsonArtifactRequest = {
	filePath: string;
	value: JsonValue;
};

type ReadJsonArtifactRequest = {
	filePath: string;
};

export interface DoctorArtifactService {
	readonly ensureReportDirectory: (
		request: EnsureDoctorPassReportDirectoryRequest,
	) => Effect.Effect<string, unknown>;
	readonly writeJson: (
		request: WriteJsonArtifactRequest,
	) => Effect.Effect<void, unknown>;
	readonly readJson: <T>(
		request: ReadJsonArtifactRequest,
	) => Effect.Effect<T, unknown>;
}

export const DoctorArtifactService = Context.GenericTag<DoctorArtifactService>(
	"ship-by-sunday/DoctorArtifactService",
);

export const NodeDoctorArtifactServiceLive = Layer.succeed(
	DoctorArtifactService,
	DoctorArtifactService.of({
		ensureReportDirectory: (request) =>
			Effect.tryPromise({
				try: () => ensureDoctorPassReportDirectoryNode(request),
				catch: (error) => error,
			}),
		writeJson: (request) =>
			Effect.tryPromise({
				try: () => writeJsonArtifactNode(request),
				catch: (error) => error,
			}),
		readJson: <T>(request: ReadJsonArtifactRequest) =>
			Effect.tryPromise({
				try: () => readJsonArtifactNode<T>(request),
				catch: (error) => error,
			}),
	}),
);

export async function ensureDoctorPassReportDirectory({
	repositoryRoot,
	runId,
}: {
	repositoryRoot: string;
	runId: string;
}) {
	return await runLocalRunnerEffect(
		ensureDoctorPassReportDirectoryEffect({
			repositoryRoot,
			runId,
		}).pipe(Effect.provide(NodeDoctorArtifactServiceLive)),
	);
}

export function ensureDoctorPassReportDirectoryEffect({
	repositoryRoot,
	runId,
}: {
	repositoryRoot: string;
	runId: string;
}): Effect.Effect<string, unknown, DoctorArtifactService> {
	return Effect.flatMap(DoctorArtifactService, (service) =>
		service.ensureReportDirectory({ repositoryRoot, runId }),
	);
}

async function ensureDoctorPassReportDirectoryNode({
	repositoryRoot,
	runId,
}: EnsureDoctorPassReportDirectoryRequest) {
	const reportDirectory = getDoctorPassReportDirectory({
		repositoryRoot,
		runId,
	});
	await mkdir(reportDirectory, { recursive: true });
	return reportDirectory;
}

export async function writeJsonArtifact({
	filePath,
	value,
}: {
	filePath: string;
	value: JsonValue;
}) {
	return await runLocalRunnerEffect(
		writeJsonArtifactEffect({ filePath, value }).pipe(
			Effect.provide(NodeDoctorArtifactServiceLive),
		),
	);
}

export function writeJsonArtifactEffect({
	filePath,
	value,
}: {
	filePath: string;
	value: JsonValue;
}): Effect.Effect<void, unknown, DoctorArtifactService> {
	return Effect.flatMap(DoctorArtifactService, (service) =>
		service.writeJson({ filePath, value }),
	);
}

async function writeJsonArtifactNode({
	filePath,
	value,
}: WriteJsonArtifactRequest) {
	await mkdir(path.dirname(filePath), { recursive: true });
	const temporaryPath = `${filePath}.${process.pid}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
	await rename(temporaryPath, filePath);
}

export async function readJsonArtifact<T>(filePath: string): Promise<T> {
	return await runLocalRunnerEffect(
		readJsonArtifactEffect<T>(filePath).pipe(
			Effect.provide(NodeDoctorArtifactServiceLive),
		),
	);
}

export function readJsonArtifactEffect<T>(
	filePath: string,
): Effect.Effect<T, unknown, DoctorArtifactService> {
	return Effect.flatMap(DoctorArtifactService, (service) =>
		service.readJson<T>({ filePath }),
	);
}

async function readJsonArtifactNode<T>({ filePath }: ReadJsonArtifactRequest) {
	return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export function sha256Digest(value: JsonValue) {
	return `sha256:${createHash("sha256")
		.update(JSON.stringify(value))
		.digest("hex")}`;
}

export function relativeArtifactRef({
	repositoryRoot,
	filePath,
}: {
	repositoryRoot: string;
	filePath: string;
}) {
	return path.relative(repositoryRoot, filePath).replace(/\\/g, "/");
}

export function assertExistingArtifact(filePath: string, label: string) {
	if (!existsSync(filePath)) {
		throw new Error(`${label} is missing at ${filePath}`);
	}
}
