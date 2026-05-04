import { buildRepoDownloadTraceIncludes } from "@shipbysunday/codebase-compiler/server";
import { repoDownloadTraceIncludes } from "@/config/vercel-output-tracing";

describe("vercel output tracing", () => {
	it("keeps repo downloads scoped to customer-safe source inputs", () => {
		expect(repoDownloadTraceIncludes).toEqual(buildRepoDownloadTraceIncludes());
		expect(repoDownloadTraceIncludes).not.toContain("./**/*");
		expect(repoDownloadTraceIncludes).not.toContain("./node_modules/**/*");
		expect(repoDownloadTraceIncludes).not.toContain("./.next/**/*");
	});
});
