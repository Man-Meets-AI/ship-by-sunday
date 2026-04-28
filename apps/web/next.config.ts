import path from "node:path";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { repoDownloadTraceIncludes } from "./config/vercel-output-tracing";

const withMDX = createMDX({
	options: {
		remarkPlugins: ["remark-frontmatter"],
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

export default withMDX(nextConfig);
