import { expect, test } from "@playwright/test";

test("homepage drives visitors into the buyer journey entry points", async ({
	page,
}) => {
	const response = await page.goto("/?marketing=1");

	expect(response?.ok()).toBe(true);
	await expect(
		page.getByText("Ship a real product", { exact: true }),
	).toBeVisible();
	await expect(
		page.locator("h1").getByText("by Sunday", { exact: true }),
	).toBeVisible();
	await expect(
		page.getByText(
			"The only system that teaches you how to ship a durable product from start to finish in one weekend.",
		),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Get the system" }).first(),
	).toBeVisible();
	await expect(page.locator("#system")).toBeVisible();
	await expect(page.locator("#pricing")).toBeVisible();

	await page.getByRole("link", { name: "Sign in", exact: true }).click();

	await expect(page).toHaveURL(/\/sign-in/);
	await expect(
		page.getByText("Reconnect the workspace tied to your checkout."),
	).toBeVisible();
	await expect(page.getByLabel("Email")).toBeVisible();
	await expect(page.getByLabel("Password")).toBeVisible();
});

test("checkout recovery and identity task screens stay actionable", async ({
	page,
}) => {
	const checkoutRecoveryResponse = await page.goto("/checkout/success");

	expect(checkoutRecoveryResponse?.ok()).toBe(true);
	await expect(page.getByText("Verify access", { exact: true })).toBeVisible();
	await expect(
		page.getByText("Missing checkout session", { exact: true }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Open workspace" }),
	).toBeVisible();

	const resetPasswordResponse = await page.goto(
		"/session-tasks/reset-password",
	);

	expect(resetPasswordResponse?.ok()).toBe(true);
	await expect(
		page.getByRole("heading", { name: "Reset your password" }),
	).toBeVisible();
	await expect(
		page.getByText("Finish the required recovery step."),
	).toBeVisible();

	const ssoCallbackResponse = await page.goto("/sso-callback");

	expect(ssoCallbackResponse?.ok()).toBe(true);
	await expect(
		page.getByRole("heading", { name: "Completing Google sign-in" }),
	).toBeVisible();
	await expect(
		page.getByText(
			"We are stitching the Google session back into your purchased account.",
		),
	).toBeVisible();
});
