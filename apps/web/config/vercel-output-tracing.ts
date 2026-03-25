const openAiTemplateTraceIncludes = ["../../docs/openai/**/*"] as const;

const packetCompilerRuntimeTraceIncludes = [
	"../../packages/packet-compiler/package.json",
	"../../packages/packet-compiler/src/**/*",
] as const;

const repoDownloadPacketCompilerTraceIncludes = [
	...packetCompilerRuntimeTraceIncludes,
	"../../packages/packet-compiler/AGENTS.md",
	"../../packages/packet-compiler/tsconfig.json",
	"../../packages/packet-compiler/vitest.config.ts",
] as const;

const repoDownloadRootFileTraceIncludes = [
	"../../.gitignore",
	"../../.oxfmtrc.json",
	"../../.oxlintrc.json",
	"../../bun.lock",
	"../../package.json",
] as const;

const repoDownloadAppTraceIncludes = [
	"./.env.local.example",
	"./.env.production",
	"./.gitignore",
	"./AGENTS.md",
	"./components.json",
	"./instrumentation-client.ts",
	"./instrumentation.ts",
	"./mdx-components.tsx",
	"./next-env.d.ts",
	"./next.config.ts",
	"./package.json",
	"./playwright.config.ts",
	"./postcss.config.mjs",
	"./proxy.ts",
	"./tsconfig.json",
	"./vitest.config.ts",
	"./app/**/*",
	"./components/**/*",
	"./config/**/*",
	"./content/**/*",
	"./convex/**/*",
	"./data/**/*",
	"./features/**/*",
	"./hooks/**/*",
	"./lib/**/*",
	"./platform/**/*",
	"./public/**/*",
	"./scripts/*.mjs",
	"./scripts/*.txt",
	"./scripts/data/**/*",
	"./scripts/lib/**/*",
] as const;

export const packetDownloadTraceIncludes = [
	...openAiTemplateTraceIncludes,
	...packetCompilerRuntimeTraceIncludes,
] as const;

export const repoDownloadTraceIncludes = [
	...repoDownloadAppTraceIncludes,
	...repoDownloadRootFileTraceIncludes,
	...openAiTemplateTraceIncludes,
	...repoDownloadPacketCompilerTraceIncludes,
] as const;
