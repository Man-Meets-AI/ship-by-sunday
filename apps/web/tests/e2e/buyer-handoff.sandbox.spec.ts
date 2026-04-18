import { expect, test, type Page } from "@playwright/test";

import {
	memberWithAccessStorageStatePath,
	memberWithoutAccessStorageStatePath,
	shouldRunAuthenticatedE2E,
} from "./auth-state";

test.describe.configure({ mode: "serial" });
test.skip(
	!shouldRunAuthenticatedE2E,
	"Set E2E_RUN_SANDBOX=1 or E2E_RUN_LOCAL_AUTH=1 plus PLAYWRIGHT_BASE_URL to run authenticated blueprint browser handoff checks.",
);

function getStripePayButton(page: Page) {
	return page
		.getByTestId("hosted-payment-submit-button")
		.or(page.getByRole("button", { name: /^pay$/i }));
}

async function fillStripeSandboxCardDetails(page: Page) {
	const cardNumberInput = page.getByRole("textbox", { name: /card number/i });
	await cardNumberInput
		.waitFor({ state: "visible", timeout: 5_000 })
		.catch(() => null);

	if (!(await cardNumberInput.isVisible().catch(() => false))) {
		return;
	}

	await cardNumberInput.fill("4242 4242 4242 4242");
	await page.getByRole("textbox", { name: /expiration/i }).fill("12 / 34");
	await page.getByRole("textbox", { name: /^cvc$/i }).fill("123");
	await page
		.getByRole("textbox", { name: /cardholder name/i })
		.fill("Ship by Sunday QA");
	await page.getByRole("textbox", { name: /^zip$/i }).fill("10001");
}

async function selectStripeSandboxCardPaymentMethod(page: Page) {
	const payWithCardButton = page.getByRole("button", {
		name: /pay with card/i,
	});

	await payWithCardButton
		.waitFor({ state: "visible", timeout: 5_000 })
		.catch(() => null);

	if (await payWithCardButton.isVisible().catch(() => false)) {
		await payWithCardButton.click();
		return;
	}

	const cardRadio = page.getByRole("radio", { name: /^card$/i });
	await cardRadio
		.waitFor({ state: "visible", timeout: 5_000 })
		.catch(() => null);

	if (await cardRadio.isVisible().catch(() => false)) {
		await cardRadio.check({ force: true });
	}
}

async function completeStripeSandboxCheckout(page: Page) {
	await page.waitForURL(/checkout\.stripe\.com/, {
		timeout: 30_000,
	});
	const linkVerificationPrompt = page.getByText(/Enter 000000 to continue\./i);

	await linkVerificationPrompt
		.waitFor({ state: "visible", timeout: 5_000 })
		.catch(() => null);

	if (await linkVerificationPrompt.isVisible().catch(() => false)) {
		const textboxes = page.getByRole("textbox");
		const textboxCount = await textboxes.count();

		for (
			let index = Math.max(1, textboxCount - 6);
			index < textboxCount;
			index += 1
		) {
			await textboxes.nth(index).fill("0");
		}

		await linkVerificationPrompt
			.waitFor({ state: "hidden", timeout: 15_000 })
			.catch(() => null);
	}

	await selectStripeSandboxCardPaymentMethod(page);
	await fillStripeSandboxCardDetails(page);

	const payButton = getStripePayButton(page);

	await payButton
		.waitFor({ state: "visible", timeout: 10_000 })
		.catch(() => null);

	if (await payButton.isVisible().catch(() => false)) {
		await payButton.click();
		return;
	}

	if (
		await page
			.getByRole("button", { name: /pay without link/i })
			.isVisible()
			.catch(() => false)
	) {
		await page.getByRole("button", { name: /pay without link/i }).click();
	}

	await expect(payButton).toBeVisible({
		timeout: 15_000,
	});
	await payButton.click();
}

test.describe("member with access", () => {
	test.use({ storageState: memberWithAccessStorageStatePath });

	test("@default_ship can open the canonical blueprint flow and settings", async ({
		page,
	}) => {
		await page.goto("/blueprint");
		await expect(page).toHaveURL(/\/blueprint$/);
		await expect(
			page.getByRole("button", { name: "Continue to Review" }),
		).toBeVisible();
		await expect(page.getByRole("heading", { name: "Design" })).toBeVisible();

		await page.goto("/review");
		await expect(page).toHaveURL(/\/review$/);
		await expect(
			page.getByRole("heading", {
				name: "What you just got and where to go next",
			}),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Continue to Build Lessons" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", {
				name: "Need the Ship by Sunday Blueprint again? Download it here.",
			}),
		).toBeVisible();

		await page.goto("/settings");
		await expect(page).toHaveURL(/\/settings$/);
		await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
		await expect(page.getByText(/Manage your account/i)).toBeVisible();
	});
});

test.describe("member without access", () => {
	test.use({ storageState: memberWithoutAccessStorageStatePath });

	test("@billing_integration full paid handoff moves from checkout success into the blueprint entry", async ({
		page,
	}) => {
		test.setTimeout(120_000);

		await page.goto("/");
		await page.waitForFunction(
			() =>
				Boolean(window.Clerk?.user?.id) && Boolean(window.Clerk?.session?.id),
			{
				timeout: 15_000,
			},
		);

		await page.getByTestId("pricing-primary-cta").click();
		await completeStripeSandboxCheckout(page);

		await page.waitForURL(/\/checkout\/success\?session_id=/, {
			timeout: 60_000,
		});
		await page.waitForURL(/\/blueprint/, {
			timeout: 60_000,
		});

		await expect(
			page.getByRole("heading", { name: "Blueprint" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Continue to Review" }),
		).toBeVisible();
	});
});
