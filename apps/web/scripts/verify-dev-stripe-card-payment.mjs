import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";
import Stripe from "stripe";

import {
	HOMEPAGE_CHECKOUT_PROOF_PATH,
	isExpressCheckoutRouteUrl,
} from "./lib/hosted-stripe-checkout-proof.mjs";

const stripeSecretKey = normalizeStripeSecretKey(
	process.env.STRIPE_SECRET_KEY ?? "",
);
const stripeApiVersion = "2026-02-25.clover";
const testCardNumber = "4242 4242 4242 4242";
const testCardExpiry = "12 / 34";
const testCardCvc = "123";
const checkoutEmail = `dev-checkout-${Date.now()}@example.com`;
const expectedCourseSlug = "ship-by-sunday";

function normalizeStripeSecretKey(secretKey) {
	return secretKey.replaceAll("\\n", "").replaceAll("\n", "").trim();
}

function parseArgs(argv) {
	let baseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim() ?? "";
	let vercelShareUrl = process.env.VERCEL_PROTECTION_SHARE_URL?.trim() ?? "";
	let timeoutMs = 120_000;

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current?.startsWith("--base-url=")) {
			baseUrl = current.slice("--base-url=".length);
			continue;
		}

		if (current === "--base-url") {
			baseUrl = argv[index + 1] ?? baseUrl;
			index += 1;
			continue;
		}

		if (current?.startsWith("--vercel-share-url=")) {
			vercelShareUrl = current.slice("--vercel-share-url=".length);
			continue;
		}

		if (current === "--vercel-share-url") {
			vercelShareUrl = argv[index + 1] ?? vercelShareUrl;
			index += 1;
			continue;
		}

		if (current?.startsWith("--timeout-ms=")) {
			timeoutMs = Number(current.slice("--timeout-ms=".length)) || timeoutMs;
			continue;
		}

		if (current === "--timeout-ms") {
			timeoutMs = Number(argv[index + 1]) || timeoutMs;
			index += 1;
		}
	}

	if (baseUrl.includes("_vercel_share=") && !vercelShareUrl) {
		vercelShareUrl = baseUrl;
		baseUrl = new URL(baseUrl).origin;
	}

	return {
		baseUrl,
		timeoutMs,
		vercelShareUrl,
	};
}

function getCheckoutSessionIdFromUrl(urlString) {
	return urlString.match(/cs_(?:live|test)_[A-Za-z0-9]+/)?.[0] ?? null;
}

async function primeVercelAccessCookie(page, { baseUrl, vercelShareUrl }) {
	if (vercelShareUrl) {
		await page.goto(vercelShareUrl, {
			waitUntil: "domcontentloaded",
		});

		return {
			enabled: true,
			source: "share-url",
		};
	}

	const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

	if (!bypassSecret) {
		return {
			enabled: false,
			source: "none",
		};
	}

	const bypassUrl = new URL("/", baseUrl);
	bypassUrl.searchParams.set("x-vercel-protection-bypass", bypassSecret);
	bypassUrl.searchParams.set("x-vercel-set-bypass-cookie", "true");

	await page.goto(bypassUrl.toString(), {
		waitUntil: "domcontentloaded",
	});

	return {
		enabled: true,
		source: "bypass-secret",
	};
}

async function clickVisibleLocator(locator, { timeoutMs = 10_000 } = {}) {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		const count = await locator.count();

		for (let index = 0; index < count; index += 1) {
			const candidate = locator.nth(index);
			const box = await candidate.boundingBox().catch(() => null);
			if (!box || box.width <= 0 || box.height <= 0) {
				continue;
			}

			await candidate
				.page()
				.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	throw new Error("Unable to click a visible Stripe Checkout element.");
}

async function selectCardPaymentMethod(page) {
	const cardRadio = page.getByRole("radio", { name: /card/i }).first();
	await cardRadio
		.waitFor({ state: "visible", timeout: 5_000 })
		.catch(() => null);

	if (await cardRadio.isVisible().catch(() => false)) {
		await cardRadio.check({ force: true });
	} else {
		await clickVisibleLocator(
			page.locator("[data-testid='card-accordion-item-button']"),
		);
	}

	await page
		.getByRole("textbox", { name: /card number/i })
		.first()
		.waitFor({ state: "visible", timeout: 10_000 });
}

async function uncheckLinkSaveInformation(page) {
	const saveInformationCheckboxes = [
		page.getByRole("checkbox", { name: /save my information/i }).first(),
		page.locator("input[type='checkbox']:checked").first(),
	];

	for (const saveInformationCheckbox of saveInformationCheckboxes) {
		await saveInformationCheckbox
			.waitFor({ state: "attached", timeout: 2_000 })
			.catch(() => null);

		if (!(await saveInformationCheckbox.isChecked().catch(() => false))) {
			continue;
		}

		await saveInformationCheckbox.uncheck({ force: true }).catch(() => null);

		if (!(await saveInformationCheckbox.isChecked().catch(() => false))) {
			return;
		}
	}
}

async function fillVisibleTextBox(page, name, value) {
	const field = page.getByRole("textbox", { name }).first();
	await field.waitFor({ state: "visible", timeout: 5_000 }).catch(() => null);

	if (await field.isVisible().catch(() => false)) {
		await field.fill(value);
	}
}

async function fillStripeCardPayment(page) {
	await selectCardPaymentMethod(page);
	await fillVisibleTextBox(page, /card number/i, testCardNumber);
	await fillVisibleTextBox(page, /expiration/i, testCardExpiry);
	await fillVisibleTextBox(page, /^cvc$/i, testCardCvc);
	await fillVisibleTextBox(
		page,
		/cardholder name|name on card|full name/i,
		"Ship by Sunday Dev QA",
	);
	await fillVisibleTextBox(page, /^zip$|postal/i, "10001");
	await uncheckLinkSaveInformation(page);
}

async function waitForHostedLinkSignal(page) {
	const linkSignal = page.getByText(/Link is accepted/i).first();

	await linkSignal.waitFor({ state: "visible", timeout: 10_000 });
	return await linkSignal.textContent();
}

async function captureFailureScreenshot(page) {
	const outputDirectory = path.join(process.cwd(), "test-results");
	await mkdir(outputDirectory, { recursive: true });
	const screenshotPath = path.join(
		outputDirectory,
		"dev-stripe-card-payment-failure.png",
	);
	await page
		.screenshot({ fullPage: true, path: screenshotPath })
		.catch(() => null);
	return screenshotPath;
}

function printCheck(label, passed, detail) {
	console.log(`- ${passed ? "PASS" : "FAIL"} ${label}: ${detail}`);
}

async function waitForPasswordlessCheckoutHandoff(
	page,
	{ baseUrl, timeoutMs },
) {
	const baseOrigin = new URL(baseUrl).origin;

	await page.waitForURL(
		(url) => url.origin === baseOrigin && url.pathname === "/sign-in",
		{
			timeout: timeoutMs,
		},
	);

	const finalUrl = new URL(page.url());
	const redirectUrl = finalUrl.searchParams.get("redirect_url");
	const emailField = page.getByLabel("Email").first();
	await emailField.waitFor({ state: "visible", timeout: timeoutMs });

	return {
		claimPageVisible:
			(await page
				.getByText(/Prove checkout email/i)
				.isVisible()
				.catch(() => false)) || page.url().includes("/checkout/email-handoff"),
		emailLocked: await emailField
			.isEditable()
			.then((isEditable) => !isEditable)
			.catch(() => false),
		emailValue: await emailField.inputValue(),
		finalUrl: page.url(),
		passwordVisible: await page
			.getByLabel("Password")
			.isVisible()
			.catch(() => false),
		redirectUrl,
	};
}

const { baseUrl, timeoutMs, vercelShareUrl } = parseArgs(process.argv.slice(2));

if (!baseUrl) {
	throw new Error(
		"Missing PLAYWRIGHT_BASE_URL or --base-url for dev Stripe card verification.",
	);
}

if (!stripeSecretKey) {
	throw new Error("Missing STRIPE_SECRET_KEY in environment.");
}

if (!stripeSecretKey.startsWith("sk_test_")) {
	throw new Error(
		"Dev Stripe card verification requires a test-mode secret key.",
	);
}

const stripe = new Stripe(stripeSecretKey, {
	apiVersion: stripeApiVersion,
});
const browser = await chromium.launch();
const context = await browser.newContext({
	baseURL: baseUrl,
	viewport: {
		height: 1000,
		width: 1280,
	},
});
const page = await context.newPage();
const expressCheckoutRequests = [];
const checkoutRouteResponses = [];
let checkoutSessionId = null;

page.on("request", (request) => {
	const requestUrl = request.url();

	if (isExpressCheckoutRouteUrl(requestUrl, baseUrl)) {
		expressCheckoutRequests.push(requestUrl);
	}
});

page.on("response", (response) => {
	try {
		const url = new URL(response.url());
		const targetOrigin = new URL(baseUrl).origin;

		if (
			url.origin === targetOrigin &&
			url.pathname === "/api/stripe/checkout" &&
			response.request().method() === "POST"
		) {
			checkoutRouteResponses.push({
				ok: response.ok(),
				status: response.status(),
			});
		}
	} catch {
		// Ignore non-URL responses from browser internals.
	}
});

try {
	const vercelAccess = await primeVercelAccessCookie(page, {
		baseUrl,
		vercelShareUrl,
	});
	await page.goto(new URL(HOMEPAGE_CHECKOUT_PROOF_PATH, baseUrl).toString(), {
		waitUntil: "domcontentloaded",
	});

	const checkoutButtons = page.locator(
		[
			"[data-testid='hero-primary-cta']",
			"[data-testid='codebase-demo-checkout-cta']",
			"[data-testid='codebase-demo-existing-checkout-cta']",
			"[data-testid='pricing-primary-cta']",
		].join(", "),
	);

	await checkoutButtons.first().waitFor({
		state: "visible",
		timeout: 20_000,
	});
	await page
		.waitForLoadState("networkidle", { timeout: 10_000 })
		.catch(() => null);

	const visibleCheckoutButtonCount = await checkoutButtons.count();
	const codebaseDemoCheckoutButton = page.getByTestId(
		"codebase-demo-checkout-cta",
	);
	await codebaseDemoCheckoutButton.scrollIntoViewIfNeeded();
	await codebaseDemoCheckoutButton.click();
	await page.waitForURL(/checkout\.stripe\.com/, {
		timeout: 30_000,
	});

	checkoutSessionId = getCheckoutSessionIdFromUrl(page.url());
	if (!checkoutSessionId) {
		throw new Error(
			"Unable to parse the Checkout Session ID from Stripe Checkout.",
		);
	}

	const hostedLinkSignalText = await waitForHostedLinkSignal(page);
	await fillVisibleTextBox(page, /^email$/i, checkoutEmail);
	await fillStripeCardPayment(page);
	await page.getByTestId("hosted-payment-submit-button").click();
	const checkoutHandoff = await waitForPasswordlessCheckoutHandoff(page, {
		baseUrl,
		timeoutMs,
	});

	const finalSession =
		await stripe.checkout.sessions.retrieve(checkoutSessionId);
	const paymentIntent =
		typeof finalSession.payment_intent === "string"
			? await stripe.paymentIntents.retrieve(finalSession.payment_intent)
			: null;
	const checkoutSuccessPath = finalSession.success_url
		? new URL(finalSession.success_url).pathname
		: null;
	const paymentIntentMetadataIsNeutral =
		paymentIntent?.metadata?.courseSlug === expectedCourseSlug &&
		paymentIntent?.metadata?.buyerStartingPoint === undefined &&
		paymentIntent?.metadata?.checkoutCtaId === undefined &&
		paymentIntent?.metadata?.fulfillmentTrack === undefined;

	printCheck(
		"Dev staging uses Stripe test mode",
		finalSession.livemode === false && paymentIntent?.livemode === false,
		`session_livemode=${finalSession.livemode}, payment_intent_livemode=${paymentIntent?.livemode ?? "missing"}`,
	);
	printCheck(
		"Homepage hosted checkout CTAs visible",
		visibleCheckoutButtonCount > 0,
		`count=${visibleCheckoutButtonCount}`,
	);
	printCheck(
		"Homepage does not precreate Express Checkout sessions",
		expressCheckoutRequests.length === 0,
		`express_requests=${expressCheckoutRequests.length}`,
	);
	printCheck(
		"App checkout route returned a hosted session",
		checkoutRouteResponses.some((response) => response.ok),
		`responses=${JSON.stringify(checkoutRouteResponses)}`,
	);
	printCheck(
		"Hosted Checkout has Link enabled",
		typeof hostedLinkSignalText === "string" &&
			/Link is accepted/i.test(hostedLinkSignalText),
		hostedLinkSignalText ?? "missing",
	);
	printCheck(
		"Checkout used neutral product metadata",
		finalSession.metadata?.courseSlug === expectedCourseSlug &&
			finalSession.metadata?.buyerStartingPoint === undefined &&
			finalSession.metadata?.checkoutCtaId === undefined &&
			finalSession.metadata?.fulfillmentTrack === undefined &&
			paymentIntentMetadataIsNeutral,
		`session_metadata=${JSON.stringify(finalSession.metadata)}, payment_intent_metadata=${JSON.stringify(paymentIntent?.metadata)}`,
	);
	printCheck(
		"Checkout returns through shared success route",
		checkoutSuccessPath === "/checkout/success",
		`success_url=${finalSession.success_url ?? "missing"}`,
	);
	printCheck(
		"Stripe Checkout session paid",
		finalSession.status === "complete" &&
			finalSession.payment_status === "paid" &&
			finalSession.amount_total === 25_000,
		`status=${finalSession.status}, payment_status=${finalSession.payment_status}, amount_total=${finalSession.amount_total}`,
	);
	printCheck(
		"Stripe PaymentIntent succeeded",
		paymentIntent?.status === "succeeded" && paymentIntent.amount === 25_000,
		`status=${paymentIntent?.status ?? "missing"}, amount=${paymentIntent?.amount ?? "missing"}`,
	);
	printCheck(
		"Checkout reached passwordless workspace handoff",
		checkoutHandoff.redirectUrl === "/workspace/choose?welcome=checkout" &&
			checkoutHandoff.emailValue === checkoutEmail &&
			checkoutHandoff.emailLocked &&
			!checkoutHandoff.passwordVisible &&
			!checkoutHandoff.claimPageVisible,
		`url=${checkoutHandoff.finalUrl}, redirect_url=${checkoutHandoff.redirectUrl}, email=${checkoutHandoff.emailValue}, email_locked=${checkoutHandoff.emailLocked}, password_visible=${checkoutHandoff.passwordVisible}, claim_page_visible=${checkoutHandoff.claimPageVisible}`,
	);

	console.log(
		JSON.stringify(
			{
				baseUrl,
				vercelAccess,
				checkoutRouteResponses,
				checkoutSession: {
					amountTotal: finalSession.amount_total,
					currency: finalSession.currency,
					id: finalSession.id,
					livemode: finalSession.livemode,
					paymentStatus: finalSession.payment_status,
					status: finalSession.status,
					successOrigin: finalSession.success_url
						? new URL(finalSession.success_url).origin
						: null,
					successPath: checkoutSuccessPath,
					metadata: finalSession.metadata,
					uiMode: finalSession.ui_mode ?? null,
				},
				expressCheckoutRequestCount: expressCheckoutRequests.length,
				finalPageUrl: checkoutHandoff.finalUrl,
				handoff: checkoutHandoff,
				hostedLinkSignalText,
				paymentIntent: paymentIntent
					? {
							amount: paymentIntent.amount,
							currency: paymentIntent.currency,
							id: paymentIntent.id,
							livemode: paymentIntent.livemode,
							metadata: paymentIntent.metadata,
							status: paymentIntent.status,
						}
					: null,
				visibleCheckoutButtonCount,
			},
			null,
			2,
		),
	);

	if (
		finalSession.livemode !== false ||
		paymentIntent?.livemode !== false ||
		visibleCheckoutButtonCount <= 0 ||
		expressCheckoutRequests.length !== 0 ||
		!checkoutRouteResponses.some((response) => response.ok) ||
		typeof hostedLinkSignalText !== "string" ||
		!/Link is accepted/i.test(hostedLinkSignalText) ||
		finalSession.metadata?.courseSlug !== expectedCourseSlug ||
		finalSession.metadata?.buyerStartingPoint !== undefined ||
		finalSession.metadata?.checkoutCtaId !== undefined ||
		finalSession.metadata?.fulfillmentTrack !== undefined ||
		!paymentIntentMetadataIsNeutral ||
		checkoutSuccessPath !== "/checkout/success" ||
		finalSession.status !== "complete" ||
		finalSession.payment_status !== "paid" ||
		finalSession.amount_total !== 25_000 ||
		paymentIntent?.status !== "succeeded" ||
		paymentIntent.amount !== 25_000 ||
		checkoutHandoff.redirectUrl !== "/workspace/choose?welcome=checkout" ||
		checkoutHandoff.emailValue !== checkoutEmail ||
		!checkoutHandoff.emailLocked ||
		checkoutHandoff.passwordVisible ||
		checkoutHandoff.claimPageVisible
	) {
		process.exitCode = 1;
	}
} catch (error) {
	const screenshotPath = await captureFailureScreenshot(page);

	if (checkoutSessionId) {
		const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
		if (session.status === "open") {
			await stripe.checkout.sessions
				.expire(checkoutSessionId)
				.catch(() => null);
		}
	}

	throw new Error(
		`${error instanceof Error ? error.message : "Unknown dev Stripe card verification failure."} Failure screenshot: ${screenshotPath}`,
	);
} finally {
	await browser.close();
}
