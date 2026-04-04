import path from "node:path";
import type { NextConfig } from "next";
import nextra from "nextra";
import { repoDownloadTraceIncludes } from "./config/vercel-output-tracing";

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
		"/api/download/repo": [...repoDownloadTraceIncludes],
	},
	turbopack: {
		ignoreIssue: [
			{
				path: "**/features/codex/server/app-server.ts",
			},
		],
	},
	transpilePackages: [
		"@shipbysunday/blueprint-compiler",
		"@shipbysunday/blueprint-presentation",
	],
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
