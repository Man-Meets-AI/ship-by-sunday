import { mkdtemp, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";

import { runSetupPairCommand } from "../src/commands/setup-pair";
import {
	createCodexHome,
	createFakeRunnerBin,
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

describe("setup pair", () => {
	const originalPath = process.env.PATH;
	const originalCodexHome = process.env.CODEX_HOME;
	const originalRunnerHome = process.env.SBS_RUNNER_HOME;

	afterEach(() => {
		process.env.PATH = originalPath;
		restoreEnvVar("CODEX_HOME", originalCodexHome);
		restoreEnvVar("SBS_RUNNER_HOME", originalRunnerHome);
	});

	it("refuses a different setup token unless repair is explicit", async () => {
		const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), "sbs-pair-"));
		const runnerHome = await createTemporaryDirectory("sbs-pair-home-");
		await initializeGitRepository(repositoryRoot);
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			'{"name":"pair-test"}\n',
		);
		const codexHome = await createCodexHome();
		const { binDirectory } = await createFakeRunnerBin();
		process.env.PATH = `${binDirectory}${path.delimiter}${originalPath}`;
		process.env.CODEX_HOME = codexHome;
		process.env.SBS_RUNNER_HOME = runnerHome;

		let pairRequestCount = 0;
		const server = createServer(async (request, response) => {
			if (
				request.url === "/api/workspace/runner/pair" &&
				request.method === "POST"
			) {
				pairRequestCount += 1;
				await readRequestBody(request);
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(
					JSON.stringify({
						projectId: `workspaceProjects_${pairRequestCount}`,
						runnerId: `workspaceRunnerBindings_${pairRequestCount}`,
						runnerMode: "daemon",
						pairingStatus: "paired",
						runnerToken: `sbs_run_${pairRequestCount}`,
						eventEndpoint: "/api/workspace/runner/events",
					}),
				);
				return;
			}

			if (
				request.url === "/api/workspace/runner/events" &&
				request.method === "POST"
			) {
				await readRequestBody(request);
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(JSON.stringify({ inserted: true }));
				return;
			}

			response.writeHead(404);
			response.end();
		});

		await new Promise<void>((resolve) =>
			server.listen(0, "127.0.0.1", resolve),
		);
		const address = server.address();
		if (!address || typeof address === "string") {
			throw new Error("Pairing test server did not expose a TCP port.");
		}
		const apiBaseUrl = `http://127.0.0.1:${address.port}`;

		try {
			await expect(
				runSetupPairCommand([
					"sbs_pair_first",
					"--repo",
					repositoryRoot,
					"--api-url",
					apiBaseUrl,
					"--json",
				]),
			).resolves.toBe(0);
			await expect(
				runSetupPairCommand([
					"sbs_pair_second",
					"--repo",
					repositoryRoot,
					"--api-url",
					apiBaseUrl,
					"--json",
				]),
			).rejects.toThrow("different setup token");
			expect(pairRequestCount).toBe(1);

			await expect(
				runSetupPairCommand([
					"sbs_pair_second",
					"--repo",
					repositoryRoot,
					"--api-url",
					apiBaseUrl,
					"--json",
					"--repair",
				]),
			).resolves.toBe(0);
			expect(pairRequestCount).toBe(2);
		} finally {
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	});
});

function restoreEnvVar(name: string, value: string | undefined) {
	if (value === undefined) {
		delete process.env[name];
	} else {
		process.env[name] = value;
	}
}

async function readRequestBody(request: NodeJS.ReadableStream) {
	let body = "";
	for await (const chunk of request) {
		body += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
	}
	return body;
}
