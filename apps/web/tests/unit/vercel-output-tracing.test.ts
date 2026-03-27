import { repoDownloadTraceIncludes } from "@/config/vercel-output-tracing";

describe("vercel output tracing", () => {
	it("keeps repo downloads scoped to customer-safe source inputs", () => {
		expect(repoDownloadTraceIncludes).not.toContain("./**/*");
		expect(repoDownloadTraceIncludes).toEqual(
			expect.arrayContaining([
				"./app/**/*",
				"./features/**/*",
				"./public/**/*",
				"./scripts/**/*",
				"../../packages/packet-compiler/src/**/*",
				"../../packages/packet-compiler/tests/**/*",
				"../../docs/openai/**/*",
				"../../docs/prompts/**/*",
			]),
		);
		expect(repoDownloadTraceIncludes).not.toContain(
			"../../packages/packet-compiler/**/*",
		);
		expect(repoDownloadTraceIncludes).not.toContain("./node_modules/**/*");
		expect(repoDownloadTraceIncludes).not.toContain("./.next/**/*");
	});
});
