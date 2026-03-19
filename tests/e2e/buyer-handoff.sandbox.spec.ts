import { expect, test, type Page } from "@playwright/test";

const shouldRunSandbox =
	process.env.E2E_RUN_SANDBOX === "1" &&
	typeof process.env.PLAYWRIGHT_BASE_URL === "string" &&
	process.env.PLAYWRIGHT_BASE_URL.length > 0;
const nonEntitledEmail = process.env.E2E_NON_ENTITLED_EMAIL ?? "Test@test.com";
const entitledEmail =
	process.env.E2E_ENTITLED_EMAIL ?? "test-entitled@test.com";
const password = process.env.E2E_SHARED_PASSWORD ?? "SBS_QA_Codex_8Yv2!mN4#rL7";

test.describe.configure({ mode: "serial" });
test.skip(
	!shouldRunSandbox,
	"Set E2E_RUN_SANDBOX=1 and the sandbox base URL to run the real browser handoff checks.",
);

async function signIn(page: Page, email: string) {
	await page.goto("/sign-in");
	await page.getByLabel(/email address/i).fill(email);
	await page.getByLabel(/^password$/i).fill(password);
	await page.getByRole("button", { name: /continue|sign in/i }).click();
}

test("signed-in non-entitled users land on the access recovery surface", async ({
	page,
}) => {
	await signIn(page, nonEntitledEmail);
	await page.goto("/access-required");

	await expect(
		page.getByRole("heading", { name: "Access not attached to this account" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Buy access now" }),
	).toBeVisible();
});

test("entitled users can open the protected workspace surfaces", async ({
	page,
}) => {
	await signIn(page, entitledEmail);

	await page.goto("/mission");
	await expect(
		page.getByRole("heading", { name: /Current step/i }),
	).toBeVisible();

	await page.goto("/artifacts");
	await expect(
		page.getByRole("heading", { name: /Saved Work/i }),
	).toBeVisible();

	await page.goto("/settings");
	await expect(
		page.getByRole("heading", { name: /Manage your account/i }),
	).toBeVisible();
});

test("full paid handoff moves from checkout success into mission", async ({
	page,
}) => {
	await signIn(page, nonEntitledEmail);
	await page.goto("/");

	await page.getByRole("button", { name: "Get instant access" }).click();
	await page.waitForURL(/checkout\.stripe\.com/);

	await page.getByPlaceholder("1234 1234 1234 1234").fill("4242424242424242");
	await page.getByPlaceholder("MM / YY").fill("12 / 34");
	await page.getByPlaceholder("CVC").fill("123");
	await page.getByPlaceholder("ZIP").fill("10001");
	await page.getByRole("button", { name: /pay/i }).click();

	await page.waitForURL(/\/checkout\/success\?session_id=/, {
		timeout: 60_000,
	});
	await page.waitForURL(/\/mission/, {
		timeout: 60_000,
	});

	await expect(
		page.getByRole("heading", { name: /Current step/i }),
	).toBeVisible();
});
