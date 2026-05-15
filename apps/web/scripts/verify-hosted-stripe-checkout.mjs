import path from "node:path";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { chromium } from "@playwright/test";
import Stripe from "stripe";

import {
	assertHostedProofCheckoutSessionSafe,
	buildHostedBillingProofCheckoutButtonSelector,
	buildHostedBillingProofOfferSelectorHelp,
	buildHostedBillingProofSuccessPathPattern,
	buildHostedProofAccessDebugArgs,
	buildHostedProofCheckoutSessionParams,
	buildHostedProofCouponParams,
	buildHostedProofSignInPath,
	getHostedBillingProofOffer,
	getHostedBillingProofStripePriceId,
	hostedProofAccessGrantMatchesOffer,
	hostedProofCheckoutLineItemMatchesOffer,
	isExpectedHostedProofCheckoutMetadata,
	isHostedProofCheckoutSessionFulfilled,
	isExpressCheckoutRouteUrl,
	isLiveStripeSecretKey,
	parseHostedBillingProofOfferId,
	shouldAllowHostedProofCardEntry,
} from "./lib/hosted-stripe-checkout-proof.mjs";
import { buildResetProductAccessCommand } from "./lib/convex-product-access-grant.mjs";
import { withConvexDeploymentEnv } from "./lib/convex-deployment-env.mjs";

const requireFromAppsWeb = createRequire(import.meta.url);
const convexManifestPath = requireFromAppsWeb.resolve("convex/package.json");
const convexBinPath = path.join(
	path.dirname(convexManifestPath),
	"bin/main.js",
);
const stripeSecretKey = normalizeStripeSecretKey(
	process.env.STRIPE_SECRET_KEY ?? "",
);
const releasePersonaLocalPath = path.resolve(
	import.meta.dirname,
	"../../..",
	process.env.RELEASE_PERSONAS_LOCAL_FILE ?? "tmp/release-personas.local.json",
);
const hostedCheckoutProofIdentity = JSON.stringify({
	tokenIdentifier: "release-proof:hosted-checkout-billing",
	subject: "release-proof",
	issuer: "ship-by-sunday-release-proof",
});

function normalizeStripeSecretKey(secretKey) {
	return secretKey.replaceAll("\\n", "").replaceAll("\n", "").trim();
}

function parseArgs(argv) {
	let baseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim() ?? "";
	let offerId = parseHostedBillingProofOfferId(
		process.env.QA_BILLING_PROOF_OFFER?.trim() || undefined,
	);
	let timeoutMs = 90_000;

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

		if (current?.startsWith("--offer=")) {
			offerId = parseHostedBillingProofOfferId(
				current.slice("--offer=".length),
			);
			continue;
		}

		if (current === "--offer") {
			offerId = parseHostedBillingProofOfferId(argv[index + 1]);
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

	return {
		baseUrl,
		offerId,
		timeoutMs,
	};
}

async function loadQaBuyerCredentials() {
	const raw = await readFile(releasePersonaLocalPath, "utf8");
	const parsed = JSON.parse(raw);
	const account = parsed.accounts?.["ship-by-sunday-clerk-instance"];

	if (!account?.email) {
		throw new Error(
			"Missing ship-by-sunday-clerk-instance email in tmp/release-personas.local.json or RELEASE_PERSONAS_LOCAL_FILE.",
		);
	}

	return {
		email: account.email,
	};
}

function spawnCommand(command, args, { timeoutMs = 15_000 } = {}) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk) => {
			stdout += String(chunk);
		});

		child.stderr.on("data", (chunk) => {
			stderr += String(chunk);
		});

		const timer = setTimeout(() => {
			stderr += `\nCommand timed out after ${timeoutMs}ms.`;
			child.kill("SIGKILL");
		}, timeoutMs);

		child.on("close", (code) => {
			clearTimeout(timer);
			resolve({
				code: code ?? 1,
				stderr: stderr.trim(),
				stdout: stdout.trim(),
			});
		});
	});
}

async function getProductAccessDebug({ clerkUserId, sessionId }) {
	const result = await spawnCommand(
		process.execPath,
		[
			convexBinPath,
			"run",
			"--prod",
			"entitlements:getProductAccessDebug",
			JSON.stringify(
				buildHostedProofAccessDebugArgs({
					clerkUserId,
					sessionId,
				}),
			),
		],
		{
			timeoutMs: 15_000,
		},
	);

	if (result.code !== 0) {
		throw new Error(
			result.stderr ||
				result.stdout ||
				"Convex product-access debug query failed.",
		);
	}

	return result.stdout ? JSON.parse(result.stdout) : null;
}

async function resetHostedProofProductAccess(clerkUserId) {
	const { command, args } = buildResetProductAccessCommand({ clerkUserId });
	const result = await spawnCommand(command, args, {
		timeoutMs: 15_000,
	});

	if (result.code !== 0) {
		throw new Error(
			result.stderr ||
				result.stdout ||
				"Convex product-access reset failed before hosted billing proof.",
		);
	}
}

async function createHostedProofCheckoutPurchaseIntent({
	checkoutEmail,
	clerkUserId,
	offer,
}) {
	const result = await spawnCommand(
		process.execPath,
		[
			convexBinPath,
			"run",
			"--prod",
			"--identity",
			hostedCheckoutProofIdentity,
			"checkoutClaims:createCheckoutPurchaseIntent",
			JSON.stringify({
				checkoutEmail,
				checkoutSurface: "hosted_checkout",
				offerId: offer.id,
				...(clerkUserId ? { clerkUserId } : {}),
			}),
		],
		{ timeoutMs: 15_000 },
	);

	if (result.code !== 0) {
		throw new Error(
			result.stderr ||
				result.stdout ||
				"Convex checkout purchase intent creation failed before hosted billing proof.",
		);
	}

	const parsed = result.stdout ? JSON.parse(result.stdout) : null;
	if (!parsed?.purchaseIntentId) {
		throw new Error("Convex did not return a checkout purchase intent id.");
	}

	return parsed.purchaseIntentId;
}

async function attachHostedProofCheckoutPurchaseIntent({
	purchaseIntentId,
	stripeCheckoutSessionId,
}) {
	const result = await spawnCommand(
		process.execPath,
		[
			convexBinPath,
			"run",
			"--prod",
			"--identity",
			hostedCheckoutProofIdentity,
			"checkoutClaims:attachStripeCheckoutSessionToPurchaseIntent",
			JSON.stringify({
				purchaseIntentId,
				stripeCheckoutSessionId,
			}),
		],
		{ timeoutMs: 15_000 },
	);

	if (result.code !== 0) {
		throw new Error(
			result.stderr ||
				result.stdout ||
				"Convex checkout purchase intent attach failed before hosted billing proof.",
		);
	}
}

function getHostedCheckoutSubmitButton(page) {
	return page.getByTestId("hosted-payment-submit-button").or(
		page.getByRole("button", {
			name: /(pay|complete order|place order|submit)/i,
		}),
	);
}

async function fillHostedSandboxCardDetails(page, { allowCardEntry }) {
	const cardNumberInput = page.getByRole("textbox", { name: /card number/i });
	await cardNumberInput
		.waitFor({ state: "visible", timeout: 5_000 })
		.catch(() => null);

	if (!(await cardNumberInput.isVisible().catch(() => false))) {
		return;
	}

	if (!allowCardEntry) {
		throw new Error(
			"Live hosted billing proof refused to enter card details. Production proof must use the restricted zero-cost Checkout Session.",
		);
	}

	await cardNumberInput.fill("4242 4242 4242 4242");
	await page.getByRole("textbox", { name: /expiration/i }).fill("12 / 34");
	await page.getByRole("textbox", { name: /^cvc$/i }).fill("123");
	await page
		.getByRole("textbox", { name: /cardholder name/i })
		.fill("Ship by Sunday QA");
	await page.getByRole("textbox", { name: /^zip$/i }).fill("10001");
}

async function selectHostedCardPaymentMethod(page) {
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

async function satisfyStripeLinkVerification(page) {
	const linkVerificationPrompt = page.getByText(/Enter 000000 to continue\./i);

	await linkVerificationPrompt
		.waitFor({ state: "visible", timeout: 5_000 })
		.catch(() => null);

	if (!(await linkVerificationPrompt.isVisible().catch(() => false))) {
		return;
	}

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

async function submitHostedCheckout(page, { allowCardEntry }) {
	await page.waitForURL(/checkout\.stripe\.com/, {
		timeout: 30_000,
	});
	await satisfyStripeLinkVerification(page);
	if (allowCardEntry) {
		await selectHostedCardPaymentMethod(page);
	}
	await fillHostedSandboxCardDetails(page, { allowCardEntry });

	const submitButton = getHostedCheckoutSubmitButton(page);
	await submitButton.waitFor({ state: "visible", timeout: 20_000 });
	await submitButton.click();
}

async function signInBuyer(page, { baseUrl, email }) {
	const signInUrl = `${baseUrl}${buildHostedProofSignInPath({
		redirectPath: "/",
	})}`;
	await assertPasswordlessOtpCanSend(page, { email, signInUrl });
	await page.goto(signInUrl, {
		waitUntil: "networkidle",
	});
	await waitForClerkLoaded(page);
	await clerk.signIn({ page, emailAddress: email });
	await page.goto(`${baseUrl}/`, {
		waitUntil: "networkidle",
	});
	await page.waitForURL((url) => url.pathname === "/", {
		timeout: 20_000,
	});
	await page.waitForFunction(
		() => Boolean(window.Clerk?.user?.id) && Boolean(window.Clerk?.session?.id),
		{
			timeout: 20_000,
		},
	);

	return await page.evaluate(() => window.Clerk?.user?.id ?? null);
}

async function waitForClerkLoaded(page) {
	await page.waitForFunction(
		() => {
			const runtimeWindow = window;
			return runtimeWindow.Clerk?.loaded === true;
		},
		{ timeout: 15_000 },
	);
}

async function assertPasswordlessOtpCanSend(page, { email, signInUrl }) {
	await page.goto(signInUrl, {
		waitUntil: "networkidle",
	});
	await waitForClerkLoaded(page);

	const passwordFieldCount = await page.getByLabel(/^password$/i).count();
	if (passwordFieldCount > 0) {
		throw new Error(
			`Hosted passwordless proof found ${passwordFieldCount} password field(s) on ${signInUrl} for ${email}.`,
		);
	}

	await page.getByLabel(/^email$/i).fill(email);
	await page.getByRole("button", { name: /^send email code$/i }).click();
	await page
		.getByLabel(/^email code$/i)
		.waitFor({ state: "visible", timeout: 20_000 });
}

async function createAppCheckoutSession(page, { offer }) {
	return await page.evaluate(async (offerId) => {
		const response = await fetch("/api/stripe/checkout", {
			body: JSON.stringify({ offerId }),
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		});
		const body = await response.json();
		return {
			ok: response.ok,
			sessionId: body.sessionId ?? null,
			url: body.url ?? null,
		};
	}, offer.id);
}

async function expireAppCheckoutSession(stripe, sessionId) {
	if (!sessionId) {
		return {
			expired: false,
			status: "missing",
		};
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId);

	if (session.status !== "open") {
		return {
			expired: false,
			status: session.status,
		};
	}

	const expiredSession = await stripe.checkout.sessions.expire(sessionId);

	return {
		expired: expiredSession.status === "expired",
		status: expiredSession.status,
	};
}

async function inspectAppCheckoutSession(stripe, { offer, sessionId }) {
	if (!sessionId) {
		return {
			amountMatches: false,
			lineItem: null,
			metadataMatches: false,
			sessionMetadata: null,
			status: "missing",
		};
	}

	const [session, lineItems] = await Promise.all([
		stripe.checkout.sessions.retrieve(sessionId),
		stripe.checkout.sessions.listLineItems(sessionId, {
			limit: 5,
		}),
	]);
	const lineItem = lineItems.data[0] ?? null;

	return {
		amountMatches: hostedProofCheckoutLineItemMatchesOffer(lineItem, offer.id),
		lineItem: lineItem
			? {
					amount_subtotal: lineItem.amount_subtotal,
					currency: lineItem.currency,
					description: lineItem.description,
					price: lineItem.price?.id ?? null,
				}
			: null,
		metadataMatches: isExpectedHostedProofCheckoutMetadata(
			session.metadata,
			offer.id,
		),
		sessionMetadata: session.metadata,
		status: session.status,
	};
}

async function verifyHomepageCheckoutContract(page, { baseUrl, offer }) {
	const expressCheckoutRequests = [];
	const checkoutButtonSelector = buildHostedBillingProofCheckoutButtonSelector(
		offer.id,
	);
	const trackRequest = (request) => {
		const requestUrl = request.url();

		if (isExpressCheckoutRouteUrl(requestUrl, baseUrl)) {
			expressCheckoutRequests.push(requestUrl);
		}
	};

	page.on("request", trackRequest);
	try {
		await page.goto(new URL(offer.publicPath, baseUrl).toString(), {
			waitUntil: "domcontentloaded",
		});
		await page.locator(checkoutButtonSelector).first().waitFor({
			state: "visible",
			timeout: 20_000,
		});
		await page
			.waitForLoadState("networkidle", { timeout: 10_000 })
			.catch(() => null);
	} finally {
		page.off("request", trackRequest);
	}

	return {
		expressCheckoutRequestCount: expressCheckoutRequests.length,
		expressCheckoutRequests,
		hostedCheckoutButtonCount: await page
			.locator(checkoutButtonSelector)
			.count(),
		offerId: offer.id,
		url: page.url(),
	};
}

async function waitForAccessGrant({
	clerkUserId,
	offer,
	requireConvexDebug,
	sessionId,
	timeoutMs,
}) {
	const deadline = Date.now() + timeoutMs;
	let productAccess = null;

	while (Date.now() < deadline) {
		try {
			productAccess = await getProductAccessDebug({
				clerkUserId,
				sessionId,
			});
		} catch (error) {
			if (!requireConvexDebug) {
				return null;
			}

			throw error;
		}
		if (
			productAccess?.stripeCheckoutSessionId === sessionId &&
			hostedProofAccessGrantMatchesOffer(productAccess, offer.id)
		) {
			return productAccess;
		}

		await new Promise((resolve) => setTimeout(resolve, 1_500));
	}

	return productAccess;
}

async function waitForHostedCheckoutReturn(
	page,
	{ offer, successPathPattern },
) {
	await page.waitForURL(
		(url) =>
			/\/checkout\/success\?session_id=/.test(url.toString()) ||
			successPathPattern.test(url.toString()),
		{
			timeout: 120_000,
			waitUntil: "commit",
		},
	);

	if (/\/checkout\/success\?session_id=/.test(page.url())) {
		console.log("Reached /checkout/success");
	}

	if (!successPathPattern.test(page.url())) {
		await page.waitForURL(successPathPattern, {
			timeout: 120_000,
			waitUntil: "commit",
		});
	}

	console.log(
		`Reached ${offer.label} protected app destination at ${page.url()}`,
	);
}

async function isAccessRequiredScreenVisible(page) {
	return await page
		.getByText(/Access Required/i)
		.isVisible()
		.catch(() => false);
}

async function isOfferAccessEvidenceVisible(page, offer) {
	for (const evidenceText of offer.accessEvidenceText) {
		if (
			await page
				.getByText(evidenceText)
				.first()
				.isVisible()
				.catch(() => false)
		) {
			return true;
		}
	}

	return false;
}

async function verifyAuthorizedAppAccess(page, { baseUrl, offer, timeoutMs }) {
	const verificationPage = await page.context().newPage();

	try {
		const deadline = Date.now() + timeoutMs;

		while (Date.now() < deadline) {
			await verificationPage.goto(`${baseUrl}${offer.protectedAccessPath}`, {
				waitUntil: "networkidle",
			});

			const accessRequiredVisible =
				await isAccessRequiredScreenVisible(verificationPage);
			const evidenceVisible = await isOfferAccessEvidenceVisible(
				verificationPage,
				offer,
			);
			const currentPathname = new URL(verificationPage.url()).pathname;
			const reachedExpectedPath =
				currentPathname === offer.protectedAccessPath ||
				currentPathname.startsWith(`${offer.protectedAccessPath}/`);

			if (!accessRequiredVisible && (evidenceVisible || reachedExpectedPath)) {
				return {
					accessRequiredVisible,
					authorized: true,
					evidenceVisible,
					url: verificationPage.url(),
				};
			}

			await new Promise((resolve) => setTimeout(resolve, 1_500));
		}

		return {
			accessRequiredVisible:
				await isAccessRequiredScreenVisible(verificationPage),
			authorized: false,
			evidenceVisible: await isOfferAccessEvidenceVisible(
				verificationPage,
				offer,
			),
			url: verificationPage.url(),
		};
	} finally {
		await verificationPage.close();
	}
}

function printCheck(label, passed, detail) {
	console.log(`- ${passed ? "PASS" : "FAIL"} ${label}: ${detail}`);
}

const { baseUrl, offerId, timeoutMs } = parseArgs(process.argv.slice(2));
const proofOffer = getHostedBillingProofOffer(offerId);
const expectedAccessSources = proofOffer.expectedAccessSources ?? [
	proofOffer.expectedAccessSource,
];
const hostedCheckoutAppPathPattern =
	buildHostedBillingProofSuccessPathPattern(offerId);
Object.assign(
	process.env,
	withConvexDeploymentEnv({
		...process.env,
		PLAYWRIGHT_BASE_URL: baseUrl,
	}),
);
const requireConvexDebug = process.env.QA_REQUIRE_CONVEX_DEBUG === "1";

if (!baseUrl) {
	throw new Error(
		"Missing PLAYWRIGHT_BASE_URL or --base-url for hosted Stripe checkout verification.",
	);
}

if (!stripeSecretKey) {
	throw new Error("Missing STRIPE_SECRET_KEY in environment.");
}

const stripePriceId = getHostedBillingProofStripePriceId(process.env, offerId);
const isLiveStripeMode = isLiveStripeSecretKey(stripeSecretKey);
const allowCardEntry = shouldAllowHostedProofCardEntry(isLiveStripeMode);

const buyerCredentials = await loadQaBuyerCredentials();
await clerkSetup({ dotenv: false });
const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2026-02-25.clover",
});
const proofRunLabel = `prod-${Date.now()}`;
console.log(
	`Preparing hosted ${proofOffer.label} billing proof ${proofRunLabel} for ${baseUrl}. Offer selector: --offer=${proofOffer.id} (${buildHostedBillingProofOfferSelectorHelp()})`,
);
const coupon = await stripe.coupons.create(
	buildHostedProofCouponParams({
		runLabel: proofRunLabel,
	}),
);

const browser = await chromium.launch();
const context = await browser.newContext({
	baseURL: baseUrl,
});
const page = await context.newPage();
let directCheckoutSessionId = null;
let directProofSubscriptionId = null;

function getStripeObjectId(value) {
	if (typeof value === "string") {
		return value;
	}

	return typeof value?.id === "string" ? value.id : null;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cancelDirectProofSubscription(subscriptionId) {
	if (!subscriptionId) {
		return {
			canceled: false,
			status: "not_applicable",
			subscriptionId: null,
		};
	}

	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	if (subscription.status === "canceled") {
		return {
			canceled: true,
			status: subscription.status,
			subscriptionId,
		};
	}

	const canceledSubscription = await stripe.subscriptions.cancel(
		subscriptionId,
		{
			invoice_now: false,
			prorate: false,
		},
	);

	return {
		canceled: canceledSubscription.status === "canceled",
		status: canceledSubscription.status,
		subscriptionId,
	};
}

async function tryCaptureDirectProofSubscriptionId(checkoutSessionId) {
	if (directProofSubscriptionId || !checkoutSessionId) {
		return directProofSubscriptionId;
	}

	try {
		const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
			expand: ["subscription"],
		});
		directProofSubscriptionId = getStripeObjectId(session.subscription);
	} catch (error) {
		console.warn(
			`Unable to capture proof subscription for ${checkoutSessionId}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	return directProofSubscriptionId;
}

async function waitForDirectProofSubscriptionId(checkoutSessionId) {
	if (proofOffer.id !== "workers") {
		return directProofSubscriptionId;
	}

	const deadline = Date.now() + 15_000;
	while (!directProofSubscriptionId && Date.now() < deadline) {
		await tryCaptureDirectProofSubscriptionId(checkoutSessionId);
		if (!directProofSubscriptionId) {
			await sleep(1_000);
		}
	}

	return directProofSubscriptionId;
}

try {
	const clerkUserId = await signInBuyer(page, {
		baseUrl,
		email: buyerCredentials.email,
	});
	console.log(`Signed in QA buyer ${buyerCredentials.email}`);
	console.log(`Authenticated Clerk user ${clerkUserId ?? "missing"}`);
	await resetHostedProofProductAccess(clerkUserId);
	console.log(`Reset product access for ${clerkUserId}`);
	const homepageCheckoutContract = await verifyHomepageCheckoutContract(page, {
		baseUrl,
		offer: proofOffer,
	});
	console.log(`Verified ${proofOffer.label} checkout contract`);
	const purchaseIntentId = await createHostedProofCheckoutPurchaseIntent({
		checkoutEmail: buyerCredentials.email,
		clerkUserId,
		offer: proofOffer,
	});
	console.log(`Created checkout purchase intent ${purchaseIntentId}`);
	const checkoutSession = await stripe.checkout.sessions.create(
		buildHostedProofCheckoutSessionParams({
			appBaseUrl: baseUrl,
			checkoutEmail: buyerCredentials.email,
			clerkUserId,
			couponId: coupon.id,
			offerId: proofOffer.id,
			purchaseIntentId,
			priceId: stripePriceId,
		}),
	);
	directCheckoutSessionId = checkoutSession.id;
	await attachHostedProofCheckoutPurchaseIntent({
		purchaseIntentId,
		stripeCheckoutSessionId: checkoutSession.id,
	});
	assertHostedProofCheckoutSessionSafe({
		checkoutSession,
		isLiveStripeMode,
	});
	if (!checkoutSession.url) {
		throw new Error("Stripe did not return a hosted checkout URL.");
	}
	console.log(`Created zero-cost Checkout Session ${checkoutSession.id}`);
	const appCheckoutSession = await createAppCheckoutSession(page, {
		offer: proofOffer,
	});
	console.log(
		`App checkout route smoke: ok=${appCheckoutSession.ok} session=${appCheckoutSession.sessionId ?? "missing"}`,
	);
	const appCheckoutSessionInspection = await inspectAppCheckoutSession(stripe, {
		offer: proofOffer,
		sessionId: appCheckoutSession.sessionId,
	});
	const appCheckoutSessionExpiry = await expireAppCheckoutSession(
		stripe,
		appCheckoutSession.sessionId,
	);
	console.log(
		`App checkout route smoke cleanup: expired=${appCheckoutSessionExpiry.expired} status=${appCheckoutSessionExpiry.status}`,
	);
	await page.goto(checkoutSession.url, {
		waitUntil: "load",
	});
	console.log("Opened hosted Stripe Checkout");
	await submitHostedCheckout(page, { allowCardEntry });
	console.log("Submitted hosted Stripe Checkout");
	await waitForDirectProofSubscriptionId(checkoutSession.id);
	await waitForHostedCheckoutReturn(page, {
		offer: proofOffer,
		successPathPattern: hostedCheckoutAppPathPattern,
	});

	const finalSession = await stripe.checkout.sessions.retrieve(
		checkoutSession.id,
	);
	directProofSubscriptionId = getStripeObjectId(finalSession.subscription);
	const finalLineItems = await stripe.checkout.sessions.listLineItems(
		checkoutSession.id,
		{
			limit: 5,
		},
	);
	const directCheckoutLineItem = finalLineItems.data[0] ?? null;
	const directSessionMetadataMatches = isExpectedHostedProofCheckoutMetadata(
		finalSession.metadata,
		proofOffer.id,
	);
	const directLineItemMatchesOffer = hostedProofCheckoutLineItemMatchesOffer(
		directCheckoutLineItem,
		proofOffer.id,
	);
	const productAccess = await waitForAccessGrant({
		clerkUserId,
		offer: proofOffer,
		requireConvexDebug,
		sessionId: checkoutSession.id,
		timeoutMs: requireConvexDebug ? timeoutMs : 15_000,
	});
	const appVerification = await verifyAuthorizedAppAccess(page, {
		baseUrl,
		offer: proofOffer,
		timeoutMs,
	});
	const directProofSubscriptionCleanup = await cancelDirectProofSubscription(
		directProofSubscriptionId,
	);
	const productAccessMatchesOffer = productAccess
		? productAccess.stripeCheckoutSessionId === checkoutSession.id &&
			hostedProofAccessGrantMatchesOffer(productAccess, proofOffer.id)
		: false;

	console.log(`Checkout session: ${checkoutSession.id}`);
	printCheck(
		"Selected hosted billing proof offer",
		proofOffer.id === offerId,
		`${proofOffer.id}; expected amount=${proofOffer.expectedAmountCents}; expected destination=${proofOffer.successPath}`,
	);
	printCheck(
		"Stripe session complete",
		isHostedProofCheckoutSessionFulfilled(finalSession),
		`status=${finalSession.status}, payment_status=${finalSession.payment_status}, amount_total=${finalSession.amount_total}`,
	);
	printCheck(
		"Checkout line item amount",
		directLineItemMatchesOffer,
		`amount_subtotal=${directCheckoutLineItem?.amount_subtotal ?? "missing"}, expected=${proofOffer.expectedAmountCents}`,
	);
	printCheck(
		"Checkout session metadata",
		directSessionMetadataMatches,
		`session_metadata=${JSON.stringify(finalSession.metadata)}`,
	);
	printCheck(
		"App checkout route smoke",
		appCheckoutSession.ok &&
			Boolean(appCheckoutSession.sessionId) &&
			Boolean(appCheckoutSession.url),
		`ok=${appCheckoutSession.ok}, session=${appCheckoutSession.sessionId ?? "missing"}`,
	);
	printCheck(
		"App checkout route offer metadata",
		appCheckoutSessionInspection.metadataMatches,
		`session_metadata=${JSON.stringify(appCheckoutSessionInspection.sessionMetadata)}`,
	);
	printCheck(
		"App checkout route line item amount",
		appCheckoutSessionInspection.amountMatches,
		`amount_subtotal=${appCheckoutSessionInspection.lineItem?.amount_subtotal ?? "missing"}, expected=${proofOffer.expectedAmountCents}`,
	);
	printCheck(
		"App checkout route smoke cleanup",
		appCheckoutSessionExpiry.expired ||
			appCheckoutSessionExpiry.status !== "open",
		`expired=${appCheckoutSessionExpiry.expired}, status=${appCheckoutSessionExpiry.status}`,
	);
	printCheck(
		"Homepage hosted checkout CTAs visible",
		homepageCheckoutContract.hostedCheckoutButtonCount > 0,
		`count=${homepageCheckoutContract.hostedCheckoutButtonCount}, url=${homepageCheckoutContract.url}`,
	);
	printCheck(
		"Homepage does not precreate Express Checkout sessions",
		homepageCheckoutContract.expressCheckoutRequestCount === 0,
		`express_requests=${homepageCheckoutContract.expressCheckoutRequestCount}`,
	);
	printCheck(
		"Hosted success redirect",
		/\/checkout\/success\?session_id=/.test(page.url()) ||
			hostedCheckoutAppPathPattern.test(page.url()),
		page.url(),
	);
	printCheck(
		`${proofOffer.label} destination reached`,
		appVerification.authorized,
		appVerification.accessRequiredVisible
			? `access required at ${appVerification.url}`
			: `${appVerification.url}; evidence_visible=${appVerification.evidenceVisible}`,
	);
	if (directProofSubscriptionId) {
		printCheck(
			"Direct Workers proof subscription cleanup",
			directProofSubscriptionCleanup.canceled,
			`subscription=${directProofSubscriptionCleanup.subscriptionId}, status=${directProofSubscriptionCleanup.status}`,
		);
	}
	if (productAccess) {
		printCheck(
			"Convex product access granted",
			productAccess.status === "granted",
			`status=${productAccess.status}`,
		);
		printCheck(
			"Product access source",
			expectedAccessSources.includes(productAccess.source),
			`source=${productAccess.source}; expected=${expectedAccessSources.join("|")}`,
		);
		printCheck(
			"Session id linked",
			productAccess.stripeCheckoutSessionId === checkoutSession.id,
			productAccess.stripeCheckoutSessionId ?? "missing",
		);
		printCheck(
			"Product access offer",
			productAccess.lastCheckoutOfferId === proofOffer.id ||
				productAccess.offerIds?.includes(proofOffer.id),
			`lastCheckoutOfferId=${productAccess.lastCheckoutOfferId ?? "missing"}, offerIds=${JSON.stringify(productAccess.offerIds ?? [])}`,
		);
		printCheck(
			"Product access capabilities",
			proofOffer.expectedCapabilities.every((capability) =>
				productAccess.capabilities?.includes(capability),
			),
			`capabilities=${JSON.stringify(productAccess.capabilities ?? [])}`,
		);
	} else if (requireConvexDebug) {
		printCheck("Convex product access granted", false, "missing");
		printCheck("Product access source", false, "missing");
		printCheck("Session id linked", false, "missing");
		printCheck("Product access offer", false, "missing");
		printCheck("Product access capabilities", false, "missing");
	} else {
		console.log(
			"- INFO Convex product access debug: unavailable in the local environment; browser proof reached the protected app successfully.",
		);
	}

	console.log(
		JSON.stringify(
			{
				checkoutSessionId: checkoutSession.id,
				checkoutUrl: checkoutSession.url,
				couponId: coupon.id,
				purchaseIntentId,
				offer: proofOffer,
				finalPageUrl: page.url(),
				appCheckoutSession,
				appCheckoutSessionInspection,
				appCheckoutSessionExpiry,
				clerkUserId,
				directCheckoutLineItem,
				homepageCheckoutContract,
				productAccess,
				productAccessMatchesOffer,
				appVerification,
				directProofSubscriptionCleanup,
				sessionStatus: finalSession.status,
				paymentStatus: finalSession.payment_status,
			},
			null,
			2,
		),
	);

	if (
		!isHostedProofCheckoutSessionFulfilled(finalSession) ||
		!directLineItemMatchesOffer ||
		!directSessionMetadataMatches ||
		!appCheckoutSession.ok ||
		!appCheckoutSession.sessionId ||
		!appCheckoutSession.url ||
		!appCheckoutSessionInspection.metadataMatches ||
		!appCheckoutSessionInspection.amountMatches ||
		!(
			appCheckoutSessionExpiry.expired ||
			appCheckoutSessionExpiry.status !== "open"
		) ||
		homepageCheckoutContract.hostedCheckoutButtonCount <= 0 ||
		homepageCheckoutContract.expressCheckoutRequestCount !== 0 ||
		!appVerification.authorized ||
		(!directProofSubscriptionCleanup.canceled &&
			directProofSubscriptionCleanup.status !== "not_applicable") ||
		(productAccess && !productAccessMatchesOffer) ||
		(requireConvexDebug &&
			(!productAccess ||
				productAccess.status !== "granted" ||
				!expectedAccessSources.includes(productAccess.source) ||
				productAccess.stripeCheckoutSessionId !== checkoutSession.id ||
				!hostedProofAccessGrantMatchesOffer(productAccess, proofOffer.id)))
	) {
		process.exitCode = 1;
	}
} finally {
	await tryCaptureDirectProofSubscriptionId(directCheckoutSessionId);
	if (directProofSubscriptionId) {
		await cancelDirectProofSubscription(directProofSubscriptionId).catch(
			() => null,
		);
	}
	await browser.close();
}
