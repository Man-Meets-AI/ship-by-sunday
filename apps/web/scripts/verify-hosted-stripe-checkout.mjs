import path from "node:path";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

import { chromium } from "@playwright/test";
import Stripe from "stripe";

import {
	buildHostedProofAccessDebugArgs,
	buildHostedProofCheckoutSessionParams,
	buildHostedProofCouponParams,
	buildHostedProofSignInPath,
	DEFAULT_PROOF_COURSE_SLUG,
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
const stripePriceId = normalizeStripeSecretKey(
	process.env.STRIPE_PRICE_ID ?? "",
);
const qaPersonaLocalPath = path.resolve(
	import.meta.dirname,
	"../../../qa/personas.local.json",
);

function normalizeStripeSecretKey(secretKey) {
	return secretKey.replaceAll("\\n", "").replaceAll("\n", "").trim();
}

function parseArgs(argv) {
	let baseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim() ?? "";
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
		timeoutMs,
	};
}

async function loadQaBuyerCredentials() {
	const raw = await readFile(qaPersonaLocalPath, "utf8");
	const parsed = JSON.parse(raw);
	const account = parsed.accounts?.["ship-by-sunday-clerk-instance"];

	if (!account?.email || !account?.password) {
		throw new Error(
			"Missing ship-by-sunday-clerk-instance credentials in qa/personas.local.json.",
		);
	}

	return {
		email: account.email,
		password: account.password,
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
			"access:getProductAccessDebug",
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

function getHostedCheckoutSubmitButton(page) {
	return page.getByTestId("hosted-payment-submit-button").or(
		page.getByRole("button", {
			name: /(pay|complete order|place order|submit)/i,
		}),
	);
}

async function fillHostedSandboxCardDetails(page) {
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

async function submitHostedCheckout(page) {
	await page.waitForURL(/checkout\.stripe\.com/, {
		timeout: 30_000,
	});
	await satisfyStripeLinkVerification(page);
	await selectHostedCardPaymentMethod(page);
	await fillHostedSandboxCardDetails(page);

	const submitButton = getHostedCheckoutSubmitButton(page);
	await submitButton.waitFor({ state: "visible", timeout: 20_000 });
	await submitButton.click();
}

async function signInBuyer(page, { baseUrl, email, password }) {
	await page.goto(
		`${baseUrl}${buildHostedProofSignInPath({ redirectPath: "/" })}`,
		{
			waitUntil: "networkidle",
		},
	);
	await page.waitForFunction(
		() => {
			const runtimeWindow = window;
			return runtimeWindow.Clerk?.loaded === true;
		},
		{ timeout: 15_000 },
	);
	await page.getByLabel(/^email$/i).fill(email);
	await page.getByLabel(/^password$/i).fill(password);
	await page.getByRole("button", { name: /^sign in$/i }).click();
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

async function createAppCheckoutSession(page) {
	return await page.evaluate(async () => {
		const response = await fetch("/api/stripe/checkout", {
			method: "POST",
		});
		const body = await response.json();
		return {
			ok: response.ok,
			sessionId: body.sessionId ?? null,
			url: body.url ?? null,
		};
	});
}

async function waitForAccessGrant({
	clerkUserId,
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
			productAccess?.status === "granted" &&
			productAccess?.stripeCheckoutSessionId === sessionId
		) {
			return productAccess;
		}

		await new Promise((resolve) => setTimeout(resolve, 1_500));
	}

	return productAccess;
}

async function waitForHostedCheckoutReturn(page) {
	await page.waitForURL(
		(url) =>
			/\/checkout\/success\?session_id=/.test(url.toString()) ||
			/\/(start|blueprint)(\?|$)/.test(url.toString()),
		{
			timeout: 120_000,
			waitUntil: "commit",
		},
	);

	if (/\/checkout\/success\?session_id=/.test(page.url())) {
		console.log("Reached /checkout/success");
	}

	if (!/\/(start|blueprint)(\?|$)/.test(page.url())) {
		await page.waitForURL(/\/(start|blueprint)(\?|$)/, {
			timeout: 120_000,
			waitUntil: "commit",
		});
	}

	console.log(`Reached protected workspace at ${page.url()}`);
}

async function isAccessRequiredScreenVisible(page) {
	return await page
		.getByText(/Access Required/i)
		.isVisible()
		.catch(() => false);
}

async function verifyAuthorizedWorkspace(page, { baseUrl, timeoutMs }) {
	const verificationPage = await page.context().newPage();

	try {
		const deadline = Date.now() + timeoutMs;

		while (Date.now() < deadline) {
			await verificationPage.goto(`${baseUrl}/blueprint`, {
				waitUntil: "networkidle",
			});

			const accessRequiredVisible =
				await isAccessRequiredScreenVisible(verificationPage);
			const headingVisible = await verificationPage
				.getByRole("heading", { name: "Blueprint" })
				.isVisible()
				.catch(() => false);
			const reviewButtonVisible = await verificationPage
				.getByRole("button", { name: /Continue to Review/i })
				.isVisible()
				.catch(() => false);

			if (!accessRequiredVisible && (headingVisible || reviewButtonVisible)) {
				return {
					accessRequiredVisible,
					authorized: true,
					url: verificationPage.url(),
				};
			}

			await new Promise((resolve) => setTimeout(resolve, 1_500));
		}

		return {
			accessRequiredVisible:
				await isAccessRequiredScreenVisible(verificationPage),
			authorized: false,
			url: verificationPage.url(),
		};
	} finally {
		await verificationPage.close();
	}
}

function printCheck(label, passed, detail) {
	console.log(`- ${passed ? "PASS" : "FAIL"} ${label}: ${detail}`);
}

const { baseUrl, timeoutMs } = parseArgs(process.argv.slice(2));
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

if (!stripePriceId) {
	throw new Error("Missing STRIPE_PRICE_ID in environment.");
}

const buyerCredentials = await loadQaBuyerCredentials();
const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2026-02-25.clover",
});
const proofRunLabel = `prod-${Date.now()}`;
console.log(`Preparing hosted billing proof ${proofRunLabel} for ${baseUrl}`);
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

try {
	const clerkUserId = await signInBuyer(page, {
		baseUrl,
		email: buyerCredentials.email,
		password: buyerCredentials.password,
	});
	console.log(`Signed in QA buyer ${buyerCredentials.email}`);
	console.log(`Authenticated Clerk user ${clerkUserId ?? "missing"}`);
	await resetHostedProofProductAccess(clerkUserId);
	console.log(`Reset product access for ${clerkUserId}`);
	const checkoutSession = await stripe.checkout.sessions.create(
		buildHostedProofCheckoutSessionParams({
			appBaseUrl: baseUrl,
			checkoutEmail: buyerCredentials.email,
			clerkUserId,
			couponId: coupon.id,
			courseSlug: process.env.QA_COURSE_SLUG ?? DEFAULT_PROOF_COURSE_SLUG,
			priceId: stripePriceId,
		}),
	);
	if (!checkoutSession.url) {
		throw new Error("Stripe did not return a hosted checkout URL.");
	}
	console.log(`Created zero-cost Checkout Session ${checkoutSession.id}`);
	const appCheckoutSession = await createAppCheckoutSession(page);
	console.log(
		`App checkout route smoke: ok=${appCheckoutSession.ok} session=${appCheckoutSession.sessionId ?? "missing"}`,
	);
	await page.goto(checkoutSession.url, {
		waitUntil: "load",
	});
	console.log("Opened hosted Stripe Checkout");
	await submitHostedCheckout(page);
	console.log("Submitted hosted Stripe Checkout");
	await waitForHostedCheckoutReturn(page);

	const finalSession = await stripe.checkout.sessions.retrieve(
		checkoutSession.id,
	);
	const productAccess = await waitForAccessGrant({
		clerkUserId,
		requireConvexDebug,
		sessionId: checkoutSession.id,
		timeoutMs: requireConvexDebug ? timeoutMs : 15_000,
	});
	const workspaceVerification = await verifyAuthorizedWorkspace(page, {
		baseUrl,
		timeoutMs,
	});

	console.log(`Checkout session: ${checkoutSession.id}`);
	printCheck(
		"Stripe session complete",
		finalSession.status === "complete" &&
			finalSession.payment_status === "paid" &&
			finalSession.amount_total === 0,
		`status=${finalSession.status}, payment_status=${finalSession.payment_status}, amount_total=${finalSession.amount_total}`,
	);
	printCheck(
		"App checkout route smoke",
		appCheckoutSession.ok &&
			Boolean(appCheckoutSession.sessionId) &&
			Boolean(appCheckoutSession.url),
		`ok=${appCheckoutSession.ok}, session=${appCheckoutSession.sessionId ?? "missing"}`,
	);
	printCheck(
		"Hosted success redirect",
		/\/checkout\/success\?session_id=/.test(page.url()) ||
			/\/(start|blueprint)/.test(page.url()),
		page.url(),
	);
	printCheck(
		"Workspace reached",
		workspaceVerification.authorized,
		workspaceVerification.accessRequiredVisible
			? `access required at ${workspaceVerification.url}`
			: workspaceVerification.url,
	);
	if (productAccess) {
		printCheck(
			"Convex product access granted",
			productAccess.status === "granted",
			`status=${productAccess.status}`,
		);
		printCheck(
			"Product access source",
			Boolean(productAccess.source),
			`source=${productAccess.source}`,
		);
		printCheck(
			"Session id linked",
			productAccess.stripeCheckoutSessionId === checkoutSession.id,
			productAccess.stripeCheckoutSessionId ?? "missing",
		);
	} else if (requireConvexDebug) {
		printCheck("Convex product access granted", false, "missing");
		printCheck("Product access source", false, "missing");
		printCheck("Session id linked", false, "missing");
	} else {
		console.log(
			"- INFO Convex product access debug: unavailable in the local environment; browser proof reached the protected workspace successfully.",
		);
	}

	console.log(
		JSON.stringify(
			{
				checkoutSessionId: checkoutSession.id,
				checkoutUrl: checkoutSession.url,
				couponId: coupon.id,
				finalPageUrl: page.url(),
				appCheckoutSession,
				clerkUserId,
				productAccess,
				workspaceVerification,
				sessionStatus: finalSession.status,
				paymentStatus: finalSession.payment_status,
			},
			null,
			2,
		),
	);

	if (
		finalSession.status !== "complete" ||
		finalSession.payment_status !== "paid" ||
		finalSession.amount_total !== 0 ||
		!appCheckoutSession.ok ||
		!appCheckoutSession.sessionId ||
		!appCheckoutSession.url ||
		!workspaceVerification.authorized ||
		(requireConvexDebug &&
			(!productAccess ||
				productAccess.status !== "granted" ||
				productAccess.stripeCheckoutSessionId !== checkoutSession.id))
	) {
		process.exitCode = 1;
	}
} finally {
	await browser.close();
}
