import path from "node:path";
import { defineConfig, defineProject } from "vitest/config";

const alias = [
	{
		find: "@",
		replacement: path.resolve(__dirname, "."),
	},
	{
		find: /^react\/jsx-runtime$/,
		replacement: path.resolve(
			__dirname,
			"../../node_modules/react/jsx-runtime.js",
		),
	},
	{
		find: /^react\/jsx-dev-runtime$/,
		replacement: path.resolve(
			__dirname,
			"../../node_modules/react/jsx-dev-runtime.js",
		),
	},
	{
		find: /^react-dom\/client$/,
		replacement: path.resolve(
			__dirname,
			"../../node_modules/react-dom/client.js",
		),
	},
	{
		find: /^react-dom\/server$/,
		replacement: path.resolve(
			__dirname,
			"../../node_modules/react-dom/server.js",
		),
	},
	{
		find: /^react-dom\/test-utils$/,
		replacement: path.resolve(
			__dirname,
			"../../node_modules/react-dom/test-utils.js",
		),
	},
	{
		find: /^react$/,
		replacement: path.resolve(__dirname, "../../node_modules/react"),
	},
	{
		find: /^react-dom$/,
		replacement: path.resolve(__dirname, "../../node_modules/react-dom"),
	},
];

export default defineConfig({
	resolve: {
		alias,
		dedupe: ["react", "react-dom"],
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
				"platform/access/product-access.ts",
				"platform/billing/checkout/checkout-session.ts",
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
