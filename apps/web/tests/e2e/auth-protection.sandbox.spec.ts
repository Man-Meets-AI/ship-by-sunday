import { expect, test } from "@playwright/test";

import {
	memberWithAccessEmail,
	memberWithAccessPassword,
	memberWithAccessStorageStatePath,
	memberWithoutAccessStorageStatePath,
	shouldRunAuthenticatedE2E,
} from "./auth-state";

test.skip(
	!shouldRunAuthenticatedE2E,
	"Set E2E_RUN_SANDBOX=1 or E2E_RUN_LOCAL_AUTH=1 and PLAYWRIGHT_BASE_URL to run authenticated auth-protection checks.",
);

test.describe("protected routes", () => {
	test("@default_ship signed-out users are redirected away from the protected blueprint workspace", async ({
		page,
	}) => {
		await page.goto("/blueprint");
		await expect(page).toHaveURL(/\/sign-in/);
	});

	test("@default_ship preserves redirect intent when an entitled user signs in", async ({
		page,
	}) => {
		await page.goto("/sign-in?redirect_url=%2Fblueprint");
		await page.getByLabel(/^email$/i).fill(memberWithAccessEmail);
		await page.getByLabel(/^password$/i).fill(memberWithAccessPassword);
		await page.getByRole("button", { name: /^sign in$/i }).click();

		await expect(page).toHaveURL(/\/blueprint$/);
		await expect(
			page.getByRole("heading", { name: "Blueprint" }),
		).toBeVisible();
	});

	test.describe("member without access", () => {
		test.use({ storageState: memberWithoutAccessStorageStatePath });

		test("@default_ship sees inline access recovery on the canonical blueprint entry", async ({
			page,
		}) => {
			await page.goto("/blueprint");
			await expect(page).toHaveURL(/\/blueprint/);
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

		test("@default_ship can render the canonical blueprint page", async ({
			page,
		}) => {
			await page.goto("/blueprint");
			await expect(page).toHaveURL(/\/blueprint/);
			await expect(
				page.getByRole("heading", { name: "Blueprint" }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Continue to Review" }),
			).toBeVisible();
		});

		test("@extended redirects legacy lesson routes back to the blueprint page", async ({
			page,
		}) => {
			await page.goto("/lesson/not-a-real-lesson");
			await expect(page).toHaveURL(/\/blueprint/);
			await expect(
				page.getByRole("heading", { name: "Blueprint" }),
			).toBeVisible();
		});
	});
});
