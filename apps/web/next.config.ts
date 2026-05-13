import path from "node:path";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withPostHogConfig } from "@posthog/nextjs-config";
import { repoDownloadTraceIncludes } from "./src/config/vercel-output-tracing";

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
				path: "**/src/platform/codex/app-server.ts",
			},
		],
	},
	transpilePackages: [
		"@shipbysunday/codebase-compiler",
		"@shipbysunday/codebase-presentation",
		"@shipbysunday/telegram-chat-widget",
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
const isPostHogSourceMapUploadDisabled =
	process.env.DISABLE_POSTHOG_SOURCE_MAP_UPLOAD === "1";
const shouldUploadPostHogSourceMaps =
	!isPostHogSourceMapUploadDisabled &&
	process.env.NODE_ENV === "production" &&
	Boolean(process.env.POSTHOG_API_KEY?.trim()) &&
	Boolean(process.env.POSTHOG_PROJECT_ID?.trim());

export default withPostHogConfig(nextConfigWithMdx, {
	personalApiKey: process.env.POSTHOG_API_KEY ?? "",
	projectId: process.env.POSTHOG_PROJECT_ID,
	host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
	sourcemaps: {
		enabled: shouldUploadPostHogSourceMaps,
		releaseName: "ship-by-sunday-web",
		deleteAfterUpload: true,
	},
});
