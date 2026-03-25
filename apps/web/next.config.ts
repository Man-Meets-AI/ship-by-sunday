import path from "node:path";
import type { NextConfig } from "next";
import nextra from "nextra";
import {
	packetDownloadTraceIncludes,
	repoDownloadTraceIncludes,
} from "./config/vercel-output-tracing";

const withNextra = nextra({
	defaultShowCopyCode: true,
	search: false,
});

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.join(
		/* turbopackIgnore: true */ __dirname,
		"../../",
	),
	outputFileTracingIncludes: {
		"/api/download/packet/[stage]": [...packetDownloadTraceIncludes],
		"/api/download/repo": [...repoDownloadTraceIncludes],
	},
	turbopack: {
		ignoreIssue: [
			{
				path: "**/features/codex/server/app-server.ts",
			},
		],
	},
	transpilePackages: ["@manmeetsai/packet-compiler"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.figma.com",
			},
		],
	},
};

export default withNextra(nextConfig);
