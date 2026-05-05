import type { RunnerCredential } from "../local-runner-home";
import type { DoctorFinding } from "./types";

export const DOCTOR_PASS_START_ENDPOINT =
	"/api/workspace/runner/doctor-pass/start";
export const FINDINGS_UPLOAD_ENDPOINT = "/api/workspace/runner/findings";

type WorkspaceDoctorPassStartResult = {
	doctorPassRunId: string;
	startedAt: number;
};

type WorkspaceFindingsUploadResult = {
	syncedAt: number;
	insertedCount: number;
	patchedCount: number;
};

export async function startWorkspaceDoctorPassRun({
	credential,
	localRunId,
	runnerMode,
	fetchRunnerApi = fetch,
}: {
	credential: RunnerCredential;
	localRunId: string;
	runnerMode: "daemon" | "one_shot";
	fetchRunnerApi?: typeof fetch;
}): Promise<WorkspaceDoctorPassStartResult> {
	const response = await fetchRunnerApi(
		new URL(DOCTOR_PASS_START_ENDPOINT, credential.apiBaseUrl),
		{
			method: "POST",
			headers: createRunnerHeaders(credential),
			body: JSON.stringify({
				projectId: credential.projectId,
				runnerId: credential.runnerId,
				localRunId,
				runnerMode,
			}),
		},
	);
	return await readRunnerResponse(response, "start doctor pass run");
}

export async function uploadApprovedFindings({
	credential,
	doctorPassRunId,
	previewDigest,
	findings,
	fetchRunnerApi = fetch,
}: {
	credential: RunnerCredential;
	doctorPassRunId: string;
	previewDigest: string;
	findings: DoctorFinding[];
	fetchRunnerApi?: typeof fetch;
}): Promise<WorkspaceFindingsUploadResult> {
	const response = await fetchRunnerApi(
		new URL(FINDINGS_UPLOAD_ENDPOINT, credential.apiBaseUrl),
		{
			method: "POST",
			headers: createRunnerHeaders(credential),
			body: JSON.stringify({
				projectId: credential.projectId,
				runnerId: credential.runnerId,
				doctorPassRunId,
				previewDigest,
				findings,
			}),
		},
	);
	return await readRunnerResponse(response, "upload approved findings");
}

function createRunnerHeaders(credential: RunnerCredential) {
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${credential.runnerToken}`,
	};
}

async function readRunnerResponse<T>(
	response: Response,
	action: string,
): Promise<T> {
	const text = await response.text();
	const parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
	if (!response.ok) {
		const message =
			typeof parsed.error === "string" ? parsed.error : `Unable to ${action}.`;
		throw new Error(message);
	}
	return parsed as T;
}
