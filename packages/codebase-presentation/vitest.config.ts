import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@shipbysunday/codebase-compiler": new URL(
				"../codebase-compiler/src/index.ts",
				import.meta.url,
			).pathname,
		},
	},
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
	},
});
