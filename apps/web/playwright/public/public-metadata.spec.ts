import { expect, test } from "@playwright/test";

import {
	expectCanonicalPath,
	expectNoIndex,
	expectStructuredData,
} from "./document-metadata";

test("marketing and editorial pages ship the public metadata contract", async ({
	page,
}) => {
	const homePageResponse = await page.goto("/?marketing=1");

	expect(homePageResponse?.ok()).toBe(true);
	await expectStructuredData(page, "FAQPage");
	await expectStructuredData(page, "Product");

	const blogIndexResponse = await page.goto("/blog");

	expect(blogIndexResponse?.ok()).toBe(true);
	await expect(page.getByText("Build the operating system")).toBeVisible();
	await expect(
		page.getByText("The operating system beats the prompt"),
	).toBeVisible();
	await expectCanonicalPath(page, "/blog");
	await expectStructuredData(page, "Blog");

	const blogArticleResponse = await page.goto(
		"/blog/the-operating-system-beats-the-prompt",
	);

	expect(blogArticleResponse?.ok()).toBe(true);
	await expect(
		page.getByText("The operating system beats the prompt"),
	).toBeVisible();
	await expect(page.getByText("Contents", { exact: true })).toBeVisible();
	await expectCanonicalPath(
		page,
		"/blog/the-operating-system-beats-the-prompt",
	);
	await expectStructuredData(page, "BlogPosting");

	const docsResponse = await page.goto("/docs/local-setup");

	expect(docsResponse?.ok()).toBe(true);
	await expectCanonicalPath(page, "/docs/local-setup");
});

test("auth routes stay noindex while still rendering the recovery copy", async ({
	page,
}) => {
	const signInResponse = await page.goto("/sign-in");

	expect(signInResponse?.ok()).toBe(true);
	await expect(
		page.getByText("Reconnect the workspace tied to your checkout."),
	).toBeVisible();
	await expectNoIndex(page);

	const resetPasswordResponse = await page.goto(
		"/session-tasks/reset-password",
	);

	expect(resetPasswordResponse?.ok()).toBe(true);
	await expect(
		page.getByRole("heading", { name: "Reset your password" }),
	).toBeVisible();
	await expectNoIndex(page);

	const ssoCallbackResponse = await page.goto("/sso-callback");

	expect(ssoCallbackResponse?.ok()).toBe(true);
	await expect(
		page.getByRole("heading", { name: "Completing Google sign-in" }),
	).toBeVisible();
	await expectNoIndex(page);
});
