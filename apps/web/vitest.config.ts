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

const reactResolve = {
	alias,
	dedupe: ["react", "react-dom"],
};

const reactRenderingDependencies = [
	/@base-ui\//,
	/@clerk\/ui/,
	/@floating-ui\/react/,
	/@radix-ui\//,
	/@testing-library\/react/,
	/@tanstack\/react-store/,
	/cmdk/,
	/embla-carousel-react/,
	/framer-motion/,
	/input-otp/,
	/lucide-react/,
	/motion/,
	/next-themes/,
	/radix-ui/,
	/react-day-picker/,
	/react-remove-scroll/,
	/react-remove-scroll-bar/,
	/react-style-singleton/,
	/sonner/,
	/use-callback-ref/,
	/use-sidecar/,
	/vaul/,
];

export default defineConfig({
	resolve: reactResolve,
	test: {
		globals: true,
		coverage: {
			provider: "v8",
			include: [
				"app/_components/{error-boundary-screen,not-found-screen}.tsx",
				"lib/observability/**/*.{ts,tsx}",
				"platform/observability/**/*.{ts,tsx}",
				"app/api/codex/**/*.ts",
				"app/api/stripe/checkout/route.ts",
				"app/api/codex/_server/route-helpers.ts",
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
				resolve: reactResolve,
				test: {
					name: "unit",
					globals: true,
					environment: "node",
					include: ["tests/unit/**/*.test.{ts,tsx}"],
					setupFiles: ["./tests/setup/react-singleton.ts"],
					server: {
						deps: {
							inline: reactRenderingDependencies,
						},
					},
				},
			}),
			defineProject({
				resolve: reactResolve,
				test: {
					name: "contracts",
					globals: true,
					environment: "node",
					include: ["tests/contracts/**/*.test.{ts,tsx}"],
				},
			}),
			defineProject({
				resolve: reactResolve,
				test: {
					name: "integration",
					globals: true,
					environment: "node",
					include: ["tests/integration/**/*.test.{ts,tsx}"],
				},
			}),
			defineProject({
				resolve: reactResolve,
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
