import {
	buildRepoDownloadTraceExcludes,
	buildRepoDownloadTraceIncludes,
} from "@shipbysunday/codebase-compiler/server";
import {
	repoDownloadTraceExcludes,
	repoDownloadTraceIncludes,
} from "@/config/vercel-output-tracing";

describe("vercel output tracing", () => {
	it("keeps repo downloads scoped to customer-safe source inputs", () => {
		expect(repoDownloadTraceIncludes).toEqual(buildRepoDownloadTraceIncludes());
		expect(repoDownloadTraceExcludes).toEqual(buildRepoDownloadTraceExcludes());
		expect(repoDownloadTraceIncludes).not.toContain("./**/*");
		expect(repoDownloadTraceIncludes).not.toContain("./node_modules/**/*");
		expect(repoDownloadTraceIncludes).not.toContain("./.next/**/*");
		expect(repoDownloadTraceExcludes).toEqual(
			expect.arrayContaining([
				"../../templates/starter-app/source/node_modules/**/*",
				"../../templates/starter-app/source/.next/**/*",
			]),
		);
	});
});
