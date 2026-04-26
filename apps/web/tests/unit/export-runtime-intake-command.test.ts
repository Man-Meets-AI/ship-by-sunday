import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCli } from "@/scripts/export-runtime-intake.mjs";

const temporaryDirectories: string[] = [];

function createOutputPath() {
	const tempDirectory = mkdtempSync(
		path.join(tmpdir(), "runtime-intake-export-"),
	);
	temporaryDirectories.push(tempDirectory);
	return path.join(tempDirectory, "runtime-intake.v1.json");
}

describe("export-runtime-intake command", () => {
	afterEach(() => {
		for (const tempDirectory of temporaryDirectories.splice(0)) {
			rmSync(tempDirectory, { force: true, recursive: true });
		}
	});

	it("fails fast when hosted Convex env is missing", async () => {
		await expect(
			runCli({
				args: [],
				env: {},
				loadQaEnvImpl: async () => null,
			}),
		).rejects.toThrow(
			"Missing NEXT_PUBLIC_CONVEX_URL in the active env file. Run `bun run dev:convex` or set QA_ENV_FILE before exporting runtime intake.",
		);
	});

	it("writes the runtime export to disk when --output is provided", async () => {
		const outputPath = createOutputPath();
		const writeFileMock = vi.fn(async (filePath, contents) => {
			writeFileSync(filePath, contents, "utf8");
		});

		const result = await runCli({
			args: ["--output", outputPath],
			env: {
				CONVEX_DEPLOYMENT: "prod:solid-dragon-123",
				NEXT_PUBLIC_CONVEX_URL: "https://solid-dragon-123.convex.cloud",
			},
			loadQaEnvImpl: async () => null,
			queryRuntimeIncidentsImpl: async () => [
				{
					_id: "incident_1",
					_creationTime: 0,
					product: "ship-by-sunday",
					fingerprint: "incident_1",
					fingerprintKey: "ship-by-sunday:prod:incident_1",
					source: "stripe",
					surface: "webhook",
					severity: "critical",
					status: "firing",
					title: "Stripe webhook failed",
					summary: "Stripe webhook summary",
					code: "StripeSignatureVerificationFailed",
					requestId: null,
					pathname: "/api/stripe/webhook?_rsc=test",
					userId: null,
					externalEventId: null,
					deploymentId: null,
					nativeUrl:
						"https://www.man-meets-ai.com/observability/incidents/default",
					logsUrl: "https://vercel.com/acme/ship-by-sunday/logs/default",
					nextAction:
						"Check Stripe and replay the event after the secret matches.",
					environment: "prod",
					stack: null,
					details: null,
					occurrenceCount: 3,
					firstSeenAt: Date.parse("2026-04-19T14:45:00.000Z"),
					lastSeenAt: Date.parse("2026-04-19T14:58:44.000Z"),
					deliveryStatus: "pending",
					deliveryCount: 0,
					lastDeliveryAt: undefined,
					telegramMessageId: undefined,
					telegramThreadId: undefined,
					lastDeliveryError: undefined,
				},
			],
			writeFileImpl: writeFileMock,
		});

		expect(result.outputPath).toBe(outputPath);
		expect(result.document.items).toHaveLength(1);
		expect(result.document.items[0]).toMatchObject({
			occurrenceCount: 3,
			sourceContext: {
				runtime: {
					canonicalPath: "/api/stripe/webhook",
				},
			},
		});
		expect(writeFileMock).toHaveBeenCalledOnce();
	});
});
