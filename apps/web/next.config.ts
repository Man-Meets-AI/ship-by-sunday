import path from "node:path";
import type { NextConfig } from "next";
import nextra from "nextra";

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
		"/api/download/packet/[stage]": [
			"./**/*",
			"../../docs/openai/**/*",
			"../../packages/packet-compiler/**/*",
		],
		"/api/download/repo": [
			"./**/*",
			"../../.gitignore",
			"../../.oxfmtrc.json",
			"../../.oxlintrc.json",
			"../../bun.lock",
			"../../docs/openai/**/*",
			"../../package.json",
			"../../packages/packet-compiler/**/*",
		],
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
