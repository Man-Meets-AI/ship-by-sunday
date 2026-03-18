import { access } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const VENV_PATH = path.join(process.cwd(), ".venv-video");
const PYTHON_BIN = path.join(VENV_PATH, "bin", "python");
const REQUIREMENTS_PATH = path.join(
	process.cwd(),
	"scripts",
	"video-cut-requirements.txt",
);

function run(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
			stdio: "inherit",
		});

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve();
				return;
			}

			reject(new Error(`${command} exited with code ${code ?? 1}.`));
		});
	});
}

async function main() {
	await run("uv", ["venv", "--python", "python3.11", VENV_PATH]);
	await access(PYTHON_BIN);
	await run("uv", [
		"pip",
		"install",
		"--python",
		PYTHON_BIN,
		"-r",
		REQUIREMENTS_PATH,
	]);
	console.log(`Video cut environment ready at ${VENV_PATH}`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
