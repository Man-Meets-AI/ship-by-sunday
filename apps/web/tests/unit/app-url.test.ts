import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

async function getAppBaseUrlWithEnv(env: NodeJS.ProcessEnv) {
	vi.resetModules();
	process.env = { ...originalEnv, ...env };

	const { getAppBaseUrl } = await import("@/platform/next/app-url");
	return getAppBaseUrl;
}

afterEach(() => {
	process.env = { ...originalEnv };
	vi.resetModules();
});

describe("getAppBaseUrl", () => {
	it("uses request origin ahead of APP_BASE_URL for route handlers", async () => {
		const getAppBaseUrl = await getAppBaseUrlWithEnv({
			APP_BASE_URL: "https://www.man-meets-ai.com/",
			VERCEL_PROJECT_PRODUCTION_URL: "dev.man-meets-ai.com",
			VERCEL_URL: "preview.vercel.app",
		});

		expect(
			getAppBaseUrl(new Request("https://preview.vercel.app/api/stripe")),
		).toBe("https://preview.vercel.app");
	});

	it("uses the request origin before Vercel project URLs for route handlers", async () => {
		const getAppBaseUrl = await getAppBaseUrlWithEnv({
			APP_BASE_URL: "",
			VERCEL_PROJECT_PRODUCTION_URL: "dev.man-meets-ai.com",
			VERCEL_URL: "preview.vercel.app",
		});

		expect(
			getAppBaseUrl(new Request("https://preview.vercel.app/api/stripe")),
		).toBe("https://preview.vercel.app");
	});

	it("falls back to Vercel project URLs when no request is available", async () => {
		const getAppBaseUrl = await getAppBaseUrlWithEnv({
			APP_BASE_URL: "",
			VERCEL_PROJECT_PRODUCTION_URL: "dev.man-meets-ai.com",
			VERCEL_URL: "preview.vercel.app",
		});

		expect(getAppBaseUrl()).toBe("https://dev.man-meets-ai.com");
	});

	it("uses APP_BASE_URL before Vercel URLs when no request is available", async () => {
		const getAppBaseUrl = await getAppBaseUrlWithEnv({
			APP_BASE_URL: "https://www.man-meets-ai.com/",
			VERCEL_PROJECT_PRODUCTION_URL: "dev.man-meets-ai.com",
			VERCEL_URL: "preview.vercel.app",
		});

		expect(getAppBaseUrl()).toBe("https://www.man-meets-ai.com");
	});
});
