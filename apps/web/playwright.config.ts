import { defineConfig, devices } from "@playwright/test";

const localPort = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? "3100", 10);
const baseURL =
	process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${localPort}`;
const localServerHost = new URL(baseURL).hostname;
const appsWebDirectory = __dirname;
const shouldUseLocalServer = process.env.PLAYWRIGHT_USE_LOCAL_SERVER === "1";
const localhostHosts = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);
const smokeTestConvexUrl = "https://smoke-test.convex.cloud";
const localServerCommand = [
	"bun",
	"run",
	"--cwd",
	JSON.stringify(appsWebDirectory),
	"dev:web:raw",
	"--",
	"--hostname",
	localServerHost,
	"--port",
	String(localPort),
].join(" ");

function getDefinedProcessEnv(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(process.env).filter(
			(entry): entry is [string, string] => entry[1] !== undefined,
		),
	);
}

function getHostedConvexUrl() {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
	if (!convexUrl) {
		return smokeTestConvexUrl;
	}

	const hostname = new URL(convexUrl).hostname;
	if (localhostHosts.has(hostname)) {
		throw new Error(
			"NEXT_PUBLIC_CONVEX_URL must point to your hosted Convex dev deployment, not localhost. Run `bun run dev:convex` to refresh .env.local.",
		);
	}

	return convexUrl;
}

export default defineConfig({
	testDir: __dirname,
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
			testMatch: ["playwright/**/*.spec.ts"],
			use: {
				...devices["Desktop Chrome"],
			},
		},
	],
	webServer: shouldUseLocalServer
		? {
				command: localServerCommand,
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 900_000,
				env: {
					...getDefinedProcessEnv(),
					APP_BASE_URL: baseURL,
					DISABLE_CLERK_MIDDLEWARE: "1",
					ENABLE_OBSERVABILITY_TEST_TRIGGER: "1",
					NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
						process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
						"pk_test_Y2xlcmsuZXhhbXBsZS5jb20k",
					NEXT_PUBLIC_CONVEX_URL: getHostedConvexUrl(),
					CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "sk_test_dummy",
					CLERK_FRONTEND_API_URL:
						process.env.CLERK_FRONTEND_API_URL ?? "https://clerk.example.com",
				},
			}
		: undefined,
});
