import { expect, test, type Page } from "@playwright/test";

import {
	memberWithAccessStorageStatePath,
	memberWithoutAccessStorageStatePath,
	shouldRunSandboxAuth,
} from "./auth-state";

test.describe.configure({ mode: "serial" });
test.skip(
	!shouldRunSandboxAuth,
	"Set E2E_RUN_SANDBOX=1 and the sandbox base URL to run the real browser handoff checks.",
);

const packetStageRoutes = [
	{ path: "/product", stageLabel: "Product" },
	{ path: "/design", stageLabel: "Design" },
	{ path: "/marketing", stageLabel: "Marketing" },
	{ path: "/build-plan", stageLabel: "Build Plan" },
] as const;

async function expectPacketStage(
	page: Page,
	route: (typeof packetStageRoutes)[number],
) {
	await page.goto(route.path);
	await expect(page).toHaveURL(
		new RegExp(`${route.path.replace("/", "\\/")}$`),
	);
	await expect(page.getByText(route.stageLabel).first()).toBeVisible();
	await expect(page.getByText("Stage status")).toBeVisible();
	await expect(page.getByRole("button", { name: "Save step" })).toBeVisible();
}

test.describe("member with access", () => {
	test.use({ storageState: memberWithAccessStorageStatePath });

	test("@default_ship can open the canonical packet funnel and settings", async ({
		page,
	}) => {
		await page.goto("/start");
		await expect(page).toHaveURL(/\/start$/);
		await expect(
			page.getByRole("link", { name: "Open the packet flow" }),
		).toBeVisible();

		for (const route of packetStageRoutes) {
			await expectPacketStage(page, route);
		}

		await page.goto("/review");
		await expect(page).toHaveURL(/\/review$/);
		await expect(page.getByText("Review").first()).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Download full repo snapshot" }),
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
		await page.waitForURL(/\/start/, {
			timeout: 60_000,
		});

		await expect(page.getByText("How this works")).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Open the packet flow" }),
		).toBeVisible();
	});
});
