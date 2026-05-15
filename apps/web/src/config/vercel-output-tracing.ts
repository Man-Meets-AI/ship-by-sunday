import {
	buildRepoDownloadTraceExcludes,
	buildRepoDownloadTraceIncludes,
} from "@shipbysunday/codebase-compiler/server";

export const repoDownloadTraceIncludes = buildRepoDownloadTraceIncludes();
export const repoDownloadTraceExcludes = buildRepoDownloadTraceExcludes();
