import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { JsonValue } from "../json-value";
import { getLocalStateDirectory } from "../local-project-state";

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

export async function ensureDoctorPassReportDirectory({
	repositoryRoot,
	runId,
}: {
	repositoryRoot: string;
	runId: string;
}) {
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
	await mkdir(path.dirname(filePath), { recursive: true });
	const temporaryPath = `${filePath}.${process.pid}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
	await rename(temporaryPath, filePath);
}

export async function readJsonArtifact<T>(filePath: string): Promise<T> {
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
