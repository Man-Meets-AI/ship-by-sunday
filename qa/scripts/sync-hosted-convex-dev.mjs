import { spawn } from "node:child_process";

import { buildHostedConvexDevSyncCommand } from "./lib/convex-dev-sync.mjs";

function spawnCommand(command, args) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
			stdio: "inherit",
		});

		child.on("close", (code) => {
			resolve(code ?? 1);
		});
	});
}

async function main() {
	const { command, args } = buildHostedConvexDevSyncCommand();
	const exitCode = await spawnCommand(command, args);

	if (exitCode !== 0) {
		throw new Error(
			`Hosted Convex dev sync failed with exit code ${exitCode}.`,
		);
	}
}

await main();
