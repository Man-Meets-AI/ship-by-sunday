import { runCli } from "../src/cli";

describe("cli", () => {
	it("prints the supported local runner commands", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(runCli(["--help"])).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain("setup pair <token>");
		expect(logSpy.mock.calls.join("\n")).toContain("daemon start");
		logSpy.mockRestore();
	});
});
