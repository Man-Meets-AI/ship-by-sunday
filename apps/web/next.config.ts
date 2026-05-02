import path from "node:path";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";
import { repoDownloadTraceIncludes } from "./config/vercel-output-tracing";

const withMDX = createMDX({
	options: {
		remarkPlugins: ["remark-frontmatter", "remark-gfm"],
	},
});

const nextConfig: NextConfig = {
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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
				path: "**/platform/codex/app-server.ts",
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

export default withSentryConfig(withMDX(nextConfig), {
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,
	authToken: process.env.SENTRY_AUTH_TOKEN,
	silent: !process.env.CI,
	widenClientFileUpload: true,
	webpack: {
		treeshake: {
			removeDebugLogging: true,
		},
	},
});
