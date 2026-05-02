import path from "node:path";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withPostHogConfig } from "@posthog/nextjs-config";
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

const nextConfigWithMdx = withMDX(nextConfig);

export default withPostHogConfig(nextConfigWithMdx, {
	personalApiKey: process.env.POSTHOG_API_KEY ?? "",
	projectId: process.env.POSTHOG_PROJECT_ID,
	host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
	sourcemaps: {
		enabled: process.env.NODE_ENV === "production",
		releaseName: "ship-by-sunday-web",
		deleteAfterUpload: true,
	},
});
