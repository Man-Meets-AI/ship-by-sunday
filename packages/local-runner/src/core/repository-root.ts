import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type RepositoryRootResolution = {
	repositoryRoot: string;
	isGitRepository: boolean;
};

export async function resolveRepositoryRoot({
	explicitRoot,
	allowNonGit = false,
}: {
	explicitRoot?: string;
	allowNonGit?: boolean;
} = {}): Promise<RepositoryRootResolution> {
	const candidateRoot = path.resolve(explicitRoot ?? process.cwd());
	try {
		const { stdout } = await execFileAsync(
			"git",
			["rev-parse", "--show-toplevel"],
			{ cwd: candidateRoot },
		);
		return {
			repositoryRoot: path.resolve(stdout.trim()),
			isGitRepository: true,
		};
	} catch (error) {
		if (allowNonGit) {
			return {
				repositoryRoot: candidateRoot,
				isGitRepository: false,
			};
		}

		throw new Error(
			`Ship by Sunday must run from a Git repository. Pass --repo to point at one.`,
			{ cause: error },
		);
	}
}

export function getRepositoryDisplayName(repositoryRoot: string) {
	return path.basename(repositoryRoot);
}
