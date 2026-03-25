import {
	packetDownloadTraceIncludes,
	repoDownloadTraceIncludes,
} from "@/config/vercel-output-tracing";

describe("vercel output tracing", () => {
	it("keeps packet downloads scoped to packet compiler inputs", () => {
		expect(packetDownloadTraceIncludes).not.toContain("./**/*");
		expect(packetDownloadTraceIncludes).toEqual(
			expect.arrayContaining([
				"../../docs/openai/**/*",
				"../../packages/packet-compiler/src/**/*",
			]),
		);
	});

	it("keeps repo downloads off build artifacts and node_modules globs", () => {
		expect(repoDownloadTraceIncludes).not.toContain("./**/*");
		expect(repoDownloadTraceIncludes).toEqual(
			expect.arrayContaining([
				"./app/**/*",
				"./features/**/*",
				"./public/**/*",
				"./scripts/lib/**/*",
				"../../packages/packet-compiler/src/**/*",
			]),
		);
		expect(repoDownloadTraceIncludes).not.toContain(
			"../../packages/packet-compiler/**/*",
		);
	});
});
