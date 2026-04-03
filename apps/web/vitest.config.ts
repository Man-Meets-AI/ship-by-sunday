import path from "node:path";
import { defineConfig, defineProject } from "vitest/config";

const alias = [
	{
		find: "@blueprint-compiler/server",
		replacement: path.resolve(
			__dirname,
			"../../packages/blueprint-compiler/src/server.ts",
		),
	},
	{
		find: "@blueprint-compiler",
		replacement: path.resolve(
			__dirname,
			"../../packages/blueprint-compiler/src/index.ts",
		),
	},
	{
		find: "@",
		replacement: path.resolve(__dirname, "."),
	},
];

export default defineConfig({
	resolve: {
		alias,
	},
	test: {
		globals: true,
		coverage: {
			provider: "v8",
			include: [
				"features/observability/**/*.{ts,tsx}",
				"app/api/codex/**/*.ts",
				"app/api/stripe/checkout/route.ts",
				"features/codex/server/route-helpers.ts",
				"features/product-access/server/product-access.ts",
				"features/checkout/server/checkout-session.ts",
			],
			thresholds: {
				perFile: true,
				statements: 90,
				functions: 90,
				lines: 90,
				branches: 80,
			},
		},
		projects: [
			defineProject({
				resolve: {
					alias,
				},
				test: {
					name: "unit",
					globals: true,
					environment: "node",
					include: ["tests/unit/**/*.test.{ts,tsx}"],
				},
			}),
			defineProject({
				resolve: {
					alias,
				},
				test: {
					name: "contracts",
					globals: true,
					environment: "node",
					include: ["tests/contracts/**/*.test.{ts,tsx}"],
				},
			}),
			defineProject({
				resolve: {
					alias,
				},
				test: {
					name: "integration",
					globals: true,
					environment: "node",
					include: ["tests/integration/**/*.test.{ts,tsx}"],
				},
			}),
			defineProject({
				resolve: {
					alias,
				},
				test: {
					name: "integration-ui",
					globals: true,
					environment: "jsdom",
					include: ["tests/integration-ui/**/*.test.{ts,tsx}"],
					setupFiles: ["./tests/setup/jsdom.ts"],
				},
			}),
		],
	},
});
