import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Path } from "@effect/platform";
import { Effect, Layer } from "effect";

import {
	BoundedProcessService,
	NodeBoundedProcessServiceLive,
	runBoundedProcess,
	runBoundedProcessEffect,
} from "../src/core/bounded-process";
import { runLocalRunnerNodePlatformEffect } from "../src/effect/node-platform-runtime";

describe("bounded process", () => {
	it("preserves missing executable failure codes", async () => {
		const result = await runBoundedProcess({
			command: "sbs-definitely-missing-command-enoent",
			args: [],
			timeoutMs: 1_000,
		});

		expect(result.succeeded).toBe(false);
		expect(result.failureCode).toBe("ENOENT");
	});

	it("preserves successful stdout and stderr capture", async () => {
		const result = await runBoundedProcess({
			command: process.execPath,
			args: [
				"-e",
				'process.stdout.write("ready"); process.stderr.write("diagnostic");',
			],
			timeoutMs: 1_000,
		});

		expect(result).toEqual({
			succeeded: true,
			stdout: "ready",
			stderr: "diagnostic",
			timedOut: false,
		});
	});

	it("preserves non-zero exit codes with captured output", async () => {
		const result = await runBoundedProcess({
			command: process.execPath,
			args: [
				"-e",
				'process.stdout.write("partial output"); process.stderr.write("failure detail"); process.exit(7);',
			],
			timeoutMs: 1_000,
		});

		expect(result).toEqual({
			succeeded: false,
			stdout: "partial output",
			stderr: "failure detail",
			timedOut: false,
			exitCode: 7,
		});
	});

	it("preserves timeout classification", async () => {
		const result = await runBoundedProcess({
			command: process.execPath,
			args: ["-e", "setTimeout(() => {}, 5_000);"],
			timeoutMs: 100,
		});

		expect(result.succeeded).toBe(false);
		expect(result.timedOut).toBe(true);
	});

	it("stops spawned processes when the Effect boundary is interrupted", async () => {
		const tempDir = await mkdtemp(join(tmpdir(), "sbs-bounded-process-"));
		const markerPath = join(tempDir, "marker.txt");

		try {
			await expect(
				Effect.runPromise(
					runBoundedProcessEffect({
						command: process.execPath,
						args: [
							"-e",
							[
								`setTimeout(() => require("node:fs").writeFileSync(${JSON.stringify(
									markerPath,
								)}, "written"), 500);`,
								"setTimeout(() => {}, 2_000);",
							].join(" "),
						],
						timeoutMs: 5_000,
					}).pipe(
						Effect.provide(NodeBoundedProcessServiceLive),
						Effect.timeout("50 millis"),
					),
				),
			).rejects.toBeDefined();

			await new Promise((resolve) => setTimeout(resolve, 900));
			await expect(readFile(markerPath, "utf8")).rejects.toMatchObject({
				code: "ENOENT",
			});
		} finally {
			await rm(tempDir, { recursive: true, force: true });
		}
	});

	it("supports injecting the Effect process service", async () => {
		const stubBoundedProcessService = Layer.succeed(
			BoundedProcessService,
			BoundedProcessService.of({
				run: (request) =>
					Effect.succeed({
						succeeded: true,
						stdout: `${request.command} ${request.args.join(" ")} ${
							request.timeoutMs
						}`,
						stderr: request.env.SBS_TEST_MARKER ?? "",
						timedOut: false,
					}),
			}),
		);

		const result = await Effect.runPromise(
			runBoundedProcessEffect({
				command: "stub-command",
				args: ["one", "two"],
				env: { SBS_TEST_MARKER: "marker" },
				timeoutMs: 123,
			}).pipe(Effect.provide(stubBoundedProcessService)),
		);

		expect(result).toEqual({
			succeeded: true,
			stdout: "stub-command one two 123",
			stderr: "marker",
			timedOut: false,
		});
	});

	it("runs effects with the Node platform scaffold", async () => {
		const separator = await runLocalRunnerNodePlatformEffect(
			Effect.map(Path.Path, (pathService) => pathService.sep),
		);

		expect(separator.length).toBeGreaterThan(0);
	});
});
