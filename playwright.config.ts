import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const localPort = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? "3100", 10);
const baseURL =
	process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${localPort}`;
const shouldUseLocalServer = process.env.PLAYWRIGHT_USE_LOCAL_SERVER === "1";

export default defineConfig({
	testDir: path.join(__dirname, "tests"),
	timeout: 30_000,
	expect: {
		timeout: 10_000,
	},
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "browser-smoke",
			testMatch: ["browser-smoke/**/*.spec.ts"],
			use: {
				...devices["Desktop Chrome"],
			},
		},
		{
			name: "sandbox-e2e",
			testMatch: ["e2e/**/*.spec.ts"],
			use: {
				...devices["Desktop Chrome"],
			},
		},
	],
	webServer: shouldUseLocalServer
		? {
				command: `pnpm exec next build && pnpm exec next start --hostname 127.0.0.1 --port ${localPort}`,
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 240_000,
				env: {
					...process.env,
					APP_BASE_URL: baseURL,
					DISABLE_CLERK_MIDDLEWARE: "1",
					NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
						process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
						"pk_test_Y2xlcmsuZXhhbXBsZS5jb20k",
					NEXT_PUBLIC_CONVEX_URL:
						process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210",
					CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "sk_test_dummy",
					CLERK_FRONTEND_API_URL:
						process.env.CLERK_FRONTEND_API_URL ?? "https://clerk.example.com",
				},
			}
		: undefined,
});
