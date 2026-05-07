import { expect, test } from "@playwright/test";

import {
	memberWithAccessStorageStatePath,
	memberWithoutAccessStorageStatePath,
	shouldRunAuthenticatedE2E,
} from "./auth-state";

test.skip(
	!shouldRunAuthenticatedE2E,
	"Set E2E_RUN_SANDBOX=1 or E2E_RUN_LOCAL_AUTH=1 and PLAYWRIGHT_BASE_URL to run authenticated auth-protection checks.",
);

test.describe("protected routes", () => {
	test("@default_ship signed-out users are redirected away from the protected codebase workspace", async ({
		page,
	}) => {
		await page.goto("/codebase");
		await expect(page).toHaveURL(/\/sign-in/);
	});

	test("@default_ship signed-out sign-in stays passwordless", async ({
		page,
	}) => {
		await page.goto("/sign-in?redirect_url=%2Fcodebase");

		await expect(page.getByLabel(/^email$/i)).toBeVisible();
		await expect(page.getByLabel(/^password$/i)).toHaveCount(0);
		await expect(
			page.getByRole("button", { name: /^send email code$/i }),
		).toBeVisible();
	});

	test.describe("member without access", () => {
		test.use({ storageState: memberWithoutAccessStorageStatePath });

		test("@default_ship sees inline access recovery on the canonical codebase entry", async ({
			page,
		}) => {
			await page.goto("/codebase");
			await expect(page).toHaveURL(/\/codebase/);
			await expect(
				page.getByText("Access not attached to this account"),
			).toBeVisible();
			await expect(
				page.getByText(
					"This signed-in account does not have product access yet.",
				),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Buy access now" }),
			).toBeVisible();
		});
	});

	test.describe("member with access", () => {
		test.use({ storageState: memberWithAccessStorageStatePath });

		test("@default_ship can render the canonical codebase page", async ({
			page,
		}) => {
			await page.goto("/codebase");
			await expect(page).toHaveURL(/\/codebase/);
			await expect(
				page.getByRole("heading", { name: "Codebase" }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Continue to Review" }),
			).toBeVisible();
		});

		test("@extended redirects legacy lesson routes back to the codebase page", async ({
			page,
		}) => {
			await page.goto("/lesson/not-a-real-lesson");
			await expect(page).toHaveURL(/\/codebase/);
			await expect(
				page.getByRole("heading", { name: "Codebase" }),
			).toBeVisible();
		});
	});
});
