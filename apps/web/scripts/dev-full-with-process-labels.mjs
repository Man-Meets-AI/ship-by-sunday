import { spawn } from "node:child_process";
import path from "node:path";

const CONCURRENTLY_BIN_PATH = path.join(
	process.cwd(),
	"node_modules",
	".bin",
	process.platform === "win32" ? "concurrently.cmd" : "concurrently",
);

const PROCESS_COLORS = ["cyan.bold", "magenta.bold", "green.bold"];
const PROCESS_PREFIX_TEMPLATE = "[{name}]\n";
const DEV_COMMANDS = [
	"bun run dev:web",
	"bun run dev:convex",
	"bun run dev:stripe",
];
const PROCESS_NAMES = ["nextjs", "convex", "stripe"];

function printProcessConfig(processNames) {
	process.stdout.write(
		`${JSON.stringify(
			{
				processNames,
				processColors: PROCESS_COLORS,
			},
			null,
			2,
		)}\n`,
	);
}

async function main() {
	const processNames = PROCESS_NAMES;

	if (process.argv.includes("--print-config")) {
		printProcessConfig(processNames);
		return;
	}

	const concurrentlyProcess = spawn(
		CONCURRENTLY_BIN_PATH,
		[
			"-k",
			"-p",
			PROCESS_PREFIX_TEMPLATE,
			"-n",
			processNames.join(","),
			"-c",
			PROCESS_COLORS.join(","),
			...DEV_COMMANDS,
		],
		{
			cwd: process.cwd(),
			env: process.env,
			stdio: "inherit",
		},
	);

	const forwardSignal = (signal) => {
		if (!concurrentlyProcess.killed) {
			concurrentlyProcess.kill(signal);
		}
	};

	process.on("SIGINT", () => forwardSignal("SIGINT"));
	process.on("SIGTERM", () => forwardSignal("SIGTERM"));

	concurrentlyProcess.on("exit", (code, signal) => {
		if (signal) {
			process.exit(1);
		}

		process.exit(code ?? 1);
	});
}

await main();
