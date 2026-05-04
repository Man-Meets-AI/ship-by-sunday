import { runCodexReadinessChecks } from "./codex-readiness";
import {
	runGithubReadinessChecks,
	type SetupCheckResult,
} from "./github-readiness";

export type { SetupCheckResult };

export async function runMachineSetupChecks({
	repositoryRoot,
	env = process.env,
}: {
	repositoryRoot?: string;
	env?: NodeJS.ProcessEnv;
} = {}) {
	const [codexChecks, githubChecks] = await Promise.all([
		runCodexReadinessChecks({ repositoryRoot, env }),
		runGithubReadinessChecks(),
	]);

	return [...codexChecks, ...githubChecks];
}
