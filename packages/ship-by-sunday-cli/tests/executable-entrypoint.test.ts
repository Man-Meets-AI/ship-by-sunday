import { spawnSync } from "node:child_process";
import path from "node:path";

const repositoryRootPath = path.resolve(process.cwd(), "../..");
const launcherPath = path.join(repositoryRootPath, "bin", "sbs");

function runLauncher(args: string[]) {
	return spawnSync(launcherPath, args, {
		cwd: repositoryRootPath,
		encoding: "utf8",
		env: process.env,
	});
}

describe("repo-local CLI launcher", () => {
	it("prints help from the checked-in launcher", () => {
		const result = runLauncher(["--help"]);

		expect(result.status).toBe(0);
		expect(result.stderr).toBe("");
		expect(result.stdout).toContain("Ship by Sunday CLI");
		expect(result.stdout).toContain("./bin/sbs [command]");
	});

	it("prints the raw version string", () => {
		const result = runLauncher(["--version"]);

		expect(result.status).toBe(0);
		expect(result.stderr).toBe("");
		expect(result.stdout.trim()).toBe("0.1.0");
	});

	it("returns a clear error for an unknown command", () => {
		const result = runLauncher(["nope"]);

		expect(result.status).toBe(2);
		expect(result.stdout).toBe("");
		expect(result.stderr).toContain('Unknown command "nope".');
	});

	it("prints completion scripts to stdout", () => {
		const result = runLauncher(["completion", "zsh"]);

		expect(result.status).toBe(0);
		expect(result.stderr).toBe("");
		expect(result.stdout).toContain("#compdef sbs");
	});
});
