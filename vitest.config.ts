import path from "node:path";
import { defineConfig, defineProject } from "vitest/config";

const alias = {
	"@": path.resolve(__dirname, "."),
};

export default defineConfig({
	resolve: {
		alias,
	},
	test: {
		globals: true,
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
