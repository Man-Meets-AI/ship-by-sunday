import { resolveWorkspaceRunnerWorkflowRunFromRequest } from "../../_server/runner-bridge";

export async function POST(request: Request) {
	return await resolveWorkspaceRunnerWorkflowRunFromRequest(request);
}
