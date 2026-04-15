import path from "node:path";
import { defineConfig, defineProject } from "vitest/config";

const alias = [
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
					include: ["tests/**/*.test.{ts,tsx}"],
					exclude: [
						"tests/**/*.contract.test.{ts,tsx}",
						"tests/**/*.convex-contract.test.{ts,tsx}",
						"tests/**/*.integration.test.{ts,tsx}",
						"tests/**/*.ui.test.{ts,tsx}",
					],
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
					include: ["tests/**/*.contract.test.{ts,tsx}"],
				},
			}),
			defineProject({
				resolve: {
					alias,
				},
				test: {
					name: "convex-contracts",
					globals: true,
					environment: "edge-runtime",
					include: ["tests/**/*.convex-contract.test.{ts,tsx}"],
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
					include: ["tests/**/*.integration.test.{ts,tsx}"],
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
					include: ["tests/**/*.ui.test.{ts,tsx}"],
					setupFiles: ["./tests/setupTests.ts"],
				},
			}),
		],
	},
});
