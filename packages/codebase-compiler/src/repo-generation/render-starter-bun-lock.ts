const localRunnerWorkspaceBlockPattern =
	/\n    "packages\/local-runner": \{[\s\S]*?\n    \},\n/;
const localRunnerPackageEntryPattern =
	/\n    "ship-by-sunday(?=\/|")\S*": \[[^\n]+\],\n/g;

export function renderStarterBunLock(sourceBunLock: string) {
	return `${sourceBunLock
		.replace(localRunnerWorkspaceBlockPattern, "\n")
		.replace(localRunnerPackageEntryPattern, "\n")
		.trimEnd()}\n`;
}
