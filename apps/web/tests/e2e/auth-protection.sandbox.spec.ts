import { expect, test } from "@playwright/test";

import {
	memberWithAccessStorageStatePath,
	memberWithoutAccessStorageStatePath,
	shouldRunSandboxAuth,
} from "./auth-state";

test.skip(
	!shouldRunSandboxAuth,
	"Set E2E_RUN_SANDBOX=1 and PLAYWRIGHT_BASE_URL to run auth protection checks.",
);

test.describe("protected routes", () => {
	test("@default_ship signed-out users are redirected away from the protected packet workspace", async ({
		page,
	}) => {
		await page.goto("/start");
		await expect(page).toHaveURL(/\/sign-in/);
	});

	test.describe("member without access", () => {
		test.use({ storageState: memberWithoutAccessStorageStatePath });

		test("@default_ship sees inline access recovery on the canonical packet entry", async ({
			page,
		}) => {
			await page.goto("/start");
			await expect(page).toHaveURL(/\/start/);
			await expect(page.getByText("Access Required")).toBeVisible();
			await expect(
				page.getByText("Access not attached to this account"),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Buy access now" }),
			).toBeVisible();
		});
	});

	test.describe("member with access", () => {
		test.use({ storageState: memberWithAccessStorageStatePath });

		test("@default_ship can render the canonical packet start page", async ({
			page,
		}) => {
			await page.goto("/start");
			await expect(page).toHaveURL(/\/start/);
			await expect(page.getByText("How this works")).toBeVisible();
			await expect(
				page.getByRole("link", { name: "Open the packet flow" }),
			).toBeVisible();
		});

		test("@extended renders the branded 404 for invalid lessons", async ({
			page,
		}) => {
			await page.goto("/lesson/not-a-real-lesson");
			await expect(
				page.getByRole("heading", { name: "Page not found" }),
			).toBeVisible();
		});

		test("@extended renders the protected shell error boundary when forced in the harness", async ({
			page,
		}) => {
			await page.goto("/start?__throwTestBoundary=protected-shell");
			await expect(
				page.getByRole("heading", { name: "Protected workspace error" }),
			).toBeVisible();
		});
	});
});
