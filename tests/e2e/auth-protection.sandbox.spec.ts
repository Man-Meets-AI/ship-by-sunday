import { expect, test } from "@playwright/test";

import {
	entitledStorageStatePath,
	nonEntitledStorageStatePath,
	shouldRunSandboxAuth,
} from "./auth-state";

test.skip(
	!shouldRunSandboxAuth,
	"Set E2E_RUN_SANDBOX=1 and PLAYWRIGHT_BASE_URL to run auth protection checks.",
);

test.describe("protected routes", () => {
	test("signed-out users are redirected away from the protected workspace", async ({
		page,
	}) => {
		await page.goto("/mission");
		await expect(page).toHaveURL(/\/sign-in/);
	});

	test.describe("non-entitled user", () => {
		test.use({ storageState: nonEntitledStorageStatePath });

		test("sees inline access recovery on mission", async ({ page }) => {
			await page.goto("/mission");
			await expect(page).toHaveURL(/\/mission/);
			await expect(
				page.getByRole("heading", {
					name: "Access not attached to this account",
				}),
			).toBeVisible();
		});
	});

	test.describe("entitled user", () => {
		test.use({ storageState: entitledStorageStatePath });

		test("can render the mission page", async ({ page }) => {
			await page.goto("/mission");
			await expect(
				page.getByRole("heading", { name: /Current step/i }),
			).toBeVisible();
		});

		test("renders the branded 404 for invalid lessons", async ({ page }) => {
			await page.goto("/lesson/not-a-real-lesson");
			await expect(
				page.getByRole("heading", { name: "Page not found" }),
			).toBeVisible();
		});

		test("renders the protected shell error boundary when forced in the harness", async ({
			page,
		}) => {
			await page.goto("/mission?__throwTestBoundary=protected-shell");
			await expect(
				page.getByRole("heading", { name: "Protected workspace error" }),
			).toBeVisible();
		});
	});
});
