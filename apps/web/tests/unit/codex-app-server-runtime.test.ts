import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
	CodexAppServerRuntimeError,
	isCodexAppServerRuntimeError,
} from "@/features/codex/server/app-server";

describe("codex app-server runtime errors", () => {
	it("identifies typed runtime incidents", () => {
		const runtimeError = new CodexAppServerRuntimeError(
			"codex_app_server_request_timeout",
			"Timed out waiting for codex app-server response (thread/start).",
			{
				method: "thread/start",
			},
		);

		expect(isCodexAppServerRuntimeError(runtimeError)).toBe(true);
		expect(runtimeError.incidentCode).toBe("codex_app_server_request_timeout");
		expect(runtimeError.incidentDetails).toEqual({
			method: "thread/start",
		});
	});

	it("does not treat ordinary errors as runtime incidents", () => {
		expect(isCodexAppServerRuntimeError(new Error("plain"))).toBe(false);
		expect(isCodexAppServerRuntimeError("plain")).toBe(false);
	});
});
