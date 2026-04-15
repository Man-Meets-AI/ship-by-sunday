import { cp, mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

function execGit({
	args,
	cwd,
	allowFailure = false,
}) {
	return new Promise((resolve, reject) => {
		const child = spawn("git", args, {
			cwd,
			env: process.env,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk) => {
			stdout += String(chunk);
		});
		child.stderr.on("data", (chunk) => {
			stderr += String(chunk);
		});
		child.on("close", (code) => {
			const result = {
				code: code ?? 1,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
			};

			if (!allowFailure && result.code !== 0) {
				reject(
					new Error(
						`git ${args.join(" ")} failed in ${cwd}.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
					),
				);
				return;
			}

			resolve(result);
		});
	});
}

async function pathExists(candidatePath) {
	try {
		await stat(candidatePath);
		return true;
	} catch {
		return false;
	}
}

export async function resolveRepoRoot(repoDir) {
	const result = await execGit({
		args: ["rev-parse", "--show-toplevel"],
		cwd: repoDir,
	});
	return result.stdout;
}

export async function assertNoGitOperationInProgress(repoRoot) {
	const gitDir = path.join(repoRoot, ".git");
	const blockingPaths = [
		path.join(gitDir, "MERGE_HEAD"),
		path.join(gitDir, "CHERRY_PICK_HEAD"),
		path.join(gitDir, "REBASE_HEAD"),
		path.join(gitDir, "rebase-merge"),
		path.join(gitDir, "rebase-apply"),
	];

	for (const blockingPath of blockingPaths) {
		if (await pathExists(blockingPath)) {
			throw new Error(
				`Git operation already in progress at ${blockingPath}. Finish or abort it before creating a release snapshot.`,
			);
		}
	}
}

export function buildReleaseSnapshotBranchName({
	now = new Date(),
	sourceRef,
}) {
	const sourceName = sourceRef.replace(/^origin\//, "").replaceAll("/", "-");
	const isoStamp = now.toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
	return `release/snapshot-${sourceName}-${isoStamp.toLowerCase()}`;
}

export function buildReleaseSnapshotCommitMessage({
	baseRef,
	sourceRef,
}) {
	const baseName = baseRef.replace(/^origin\//, "");
	const sourceName = sourceRef.replace(/^origin\//, "");
	return `release: promote ${sourceName} snapshot to ${baseName}`;
}

async function ensureBranchDoesNotExist({
	branchName,
	repoRoot,
}) {
	const localCheck = await execGit({
		args: ["show-ref", "--verify", `refs/heads/${branchName}`],
		allowFailure: true,
		cwd: repoRoot,
	});

	if (localCheck.code === 0) {
		throw new Error(
			`Local branch ${branchName} already exists. Pick another branch name or delete it first.`,
		);
	}

	const remoteCheck = await execGit({
		args: ["ls-remote", "--heads", "origin", branchName],
		allowFailure: true,
		cwd: repoRoot,
	});

	if (remoteCheck.stdout.length > 0) {
		throw new Error(
			`Remote branch ${branchName} already exists on origin. Pick another branch name or delete it first.`,
		);
	}
}

async function hasOriginRemote(repoRoot) {
	const result = await execGit({
		args: ["remote", "get-url", "origin"],
		allowFailure: true,
		cwd: repoRoot,
	});

	return result.code === 0;
}

async function cleanSnapshotWorktree(snapshotDir) {
	const entries = await readdir(snapshotDir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name === ".git") {
			continue;
		}

		await rm(path.join(snapshotDir, entry.name), {
			force: true,
			recursive: true,
		});
	}
}

async function syncWorktreeContents({
	destinationDir,
	sourceDir,
}) {
	await cleanSnapshotWorktree(destinationDir);
	const entries = await readdir(sourceDir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name === ".git") {
			continue;
		}

		await cp(
			path.join(sourceDir, entry.name),
			path.join(destinationDir, entry.name),
			{
				force: true,
				preserveTimestamps: true,
				recursive: true,
			},
		);
	}
}

async function worktreeRemove({
	cwd,
	worktreePath,
}) {
	await execGit({
		args: ["worktree", "remove", "--force", worktreePath],
		allowFailure: true,
		cwd,
	});
}

export async function createReleaseSnapshotBranch({
	baseRef = "origin/main",
	branchName,
	commitMessage,
	push = false,
	repoDir = process.cwd(),
	sourceRef = "origin/dev",
}) {
	const repoRoot = await resolveRepoRoot(repoDir);
	await assertNoGitOperationInProgress(repoRoot);
	await ensureBranchDoesNotExist({
		branchName,
		repoRoot,
	});

	const tempRoot = await mkdtemp(
		path.join(os.tmpdir(), "ship-by-sunday-release-snapshot-"),
	);
	const sourceDir = path.join(tempRoot, "source");
	const snapshotDir = path.join(tempRoot, "snapshot");
	let createdBranch = false;
	let committedSha = null;

	try {
		if (await hasOriginRemote(repoRoot)) {
			await execGit({
				args: ["fetch", "origin", "--prune"],
				cwd: repoRoot,
			});
		}
		await execGit({
			args: ["worktree", "add", "--detach", sourceDir, sourceRef],
			cwd: repoRoot,
		});
		await execGit({
			args: ["worktree", "add", "--detach", snapshotDir, baseRef],
			cwd: repoRoot,
		});
		await execGit({
			args: ["checkout", "-b", branchName],
			cwd: snapshotDir,
		});
		createdBranch = true;

		await syncWorktreeContents({
			destinationDir: snapshotDir,
			sourceDir,
		});

		await execGit({
			args: ["add", "-A"],
			cwd: snapshotDir,
		});

		const diffResult = await execGit({
			args: ["diff", "--cached", "--quiet"],
			allowFailure: true,
			cwd: snapshotDir,
		});

		if (diffResult.code === 0) {
			throw new Error(
				`No differences between ${sourceRef} and ${baseRef}; release snapshot ${branchName} is not needed.`,
			);
		}

		await execGit({
			args: ["commit", "-m", commitMessage],
			cwd: snapshotDir,
		});
		committedSha = (
			await execGit({
				args: ["rev-parse", "HEAD"],
				cwd: snapshotDir,
			})
		).stdout;

		if (push) {
			await execGit({
				args: ["push", "-u", "origin", branchName],
				cwd: snapshotDir,
			});
		}

		return {
			baseRef,
			branchName,
			commitMessage,
			commitSha: committedSha,
			repoRoot,
			sourceRef,
		};
	} finally {
		await worktreeRemove({
			cwd: repoRoot,
			worktreePath: sourceDir,
		});
		await worktreeRemove({
			cwd: repoRoot,
			worktreePath: snapshotDir,
		});
		if (createdBranch && !committedSha) {
			await execGit({
				args: ["branch", "-D", branchName],
				allowFailure: true,
				cwd: repoRoot,
			});
		}
		await rm(tempRoot, { force: true, recursive: true });
	}
}

export async function readTrackedTree(repoDir, ref) {
	const result = await execGit({
		args: ["ls-tree", "-r", ref],
		cwd: repoDir,
	});
	return result.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

export async function readHeadParent(repoDir, ref) {
	return (
		await execGit({
			args: ["rev-parse", `${ref}^`],
			cwd: repoDir,
		})
	).stdout;
}

export async function readFileIfExists(filePath) {
	if (!(await pathExists(filePath))) {
		return null;
	}
	return readFile(filePath, "utf8");
}
