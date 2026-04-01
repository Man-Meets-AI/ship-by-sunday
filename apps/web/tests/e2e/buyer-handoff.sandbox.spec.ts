import { expect, test, type Page } from "@playwright/test";

import {
	memberWithAccessStorageStatePath,
	memberWithoutAccessStorageStatePath,
	shouldRunAuthenticatedE2E,
} from "./auth-state";

test.describe.configure({ mode: "serial" });
test.skip(
	!shouldRunAuthenticatedE2E,
	"Set E2E_RUN_SANDBOX=1 or E2E_RUN_LOCAL_AUTH=1 plus PLAYWRIGHT_BASE_URL to run authenticated packet browser handoff checks.",
);

const packetStageRoutes = [
	{ path: "/product", stageLabel: "Product" },
	{ path: "/design", stageLabel: "Design" },
	{ path: "/marketing", stageLabel: "Marketing" },
	{ path: "/build-plan", stageLabel: "Build Plan" },
] as const;

function getStripePayButton(page: Page) {
	return page
		.getByTestId("hosted-payment-submit-button")
		.or(page.getByRole("button", { name: /^pay$/i }));
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

async function expectPacketStage(
	page: Page,
	route: (typeof packetStageRoutes)[number],
) {
	await page.goto(route.path);
	await expect(page).toHaveURL(
		new RegExp(`${route.path.replace("/", "\\/")}\\/[^/]+$`),
	);
	await expect(page.getByText(route.stageLabel).first()).toBeVisible();
	await expect(page.getByText("Stage progress")).toBeVisible();
	await expect(
		page.getByText(/All required answers are in place for this stage\./i),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
}

test.describe("member with access", () => {
	test.use({ storageState: memberWithAccessStorageStatePath });

	test("@default_ship can open the canonical packet funnel and settings", async ({
		page,
	}) => {
		await page.goto("/start");
		await expect(page).toHaveURL(/\/start$/);
		await expect(
			page.getByRole("link", { name: /^Continue with /i }),
		).toBeVisible();

		for (const route of packetStageRoutes) {
			await expectPacketStage(page, route);
		}

		await page.goto("/review");
		await expect(page).toHaveURL(/\/review$/);
		await expect(page.getByText("Review").first()).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Download Ship Kit" }),
		).toBeVisible();

		await page.goto("/settings");
		await expect(page).toHaveURL(/\/settings$/);
		await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
		await expect(page.getByText(/Manage your account/i)).toBeVisible();
	});
});

test.describe("member without access", () => {
	test.use({ storageState: memberWithoutAccessStorageStatePath });

	test("@billing_integration full paid handoff moves from checkout success into the packet entry", async ({
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
		await page.waitForURL(/\/start/, {
			timeout: 60_000,
		});

		await expect(
			page.getByText("Build the BRIEF before you build the app."),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /^Continue with /i }),
		).toBeVisible();
	});
});
