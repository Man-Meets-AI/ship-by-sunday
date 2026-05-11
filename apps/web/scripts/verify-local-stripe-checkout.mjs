import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import Stripe from "stripe";

const require = createRequire(import.meta.url);
const CONVEX_BIN_PATH = path.join(
	path.dirname(require.resolve("convex/package.json")),
	"bin/main.js",
);
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);
const VALID_PRODUCT_ACCESS_SOURCES = new Set([
	"stripe_checkout",
	"stripe_webhook",
]);

function parseArgs(argv) {
	let sessionId = null;
	let timeoutMs = 30000;

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current?.startsWith("--session-id=")) {
			sessionId = current.slice("--session-id=".length);
			continue;
		}

		if (current === "--session-id") {
			sessionId = argv[index + 1] ?? null;
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

	return { sessionId, timeoutMs };
}

function runCommand(command, args) {
	return new Promise((resolve, reject) => {
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

		child.on("error", reject);
		child.on("close", (code) => {
			resolve({ code: code ?? 1, stdout, stderr });
		});
	});
}

function isLocalhostUrl(urlString) {
	return LOCALHOST_HOSTS.has(new URL(urlString).hostname);
}

function getHostedConvexDevContext() {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
	if (!convexUrl) {
		throw new Error(
			"Missing NEXT_PUBLIC_CONVEX_URL in .env.local. Run `bun run dev:convex` to sync your hosted Convex dev deployment.",
		);
	}

	if (isLocalhostUrl(convexUrl)) {
		throw new Error(
			"NEXT_PUBLIC_CONVEX_URL must point to your hosted Convex dev deployment, not localhost. Run `bun run dev:convex` to refresh .env.local.",
		);
	}

	const deploymentName = process.env.CONVEX_DEPLOYMENT?.trim();
	if (!deploymentName) {
		throw new Error(
			"Missing CONVEX_DEPLOYMENT in .env.local. Run `bun run dev:convex` to sync your hosted Convex dev deployment.",
		);
	}

	return { deploymentName };
}

async function getLatestCheckoutSessionId(stripe) {
	const events = await stripe.events.list({
		limit: 1,
		types: ["checkout.session.completed"],
	});
	return events.data[0]?.data?.object?.id ?? null;
}

async function getProductAccessDebug(sessionId) {
	const payload = JSON.stringify({ stripeCheckoutSessionId: sessionId });
	const result = await runCommand(process.execPath, [
		CONVEX_BIN_PATH,
		"run",
		"access:getProductAccessDebug",
		payload,
	]);

	if (result.code !== 0) {
		throw new Error(
			result.stderr ||
				result.stdout ||
				"Convex dev query failed. Make sure `bun run dev:convex` has synced your hosted deployment into .env.local.",
		);
	}

	const output = result.stdout.trim();
	return output ? JSON.parse(output) : null;
}

function printCheck(label, passed, detail) {
	console.log(`- ${passed ? "PASS" : "FAIL"} ${label}: ${detail}`);
}

const { sessionId: requestedSessionId, timeoutMs } = parseArgs(
	process.argv.slice(2),
);
const { deploymentName } = getHostedConvexDevContext();

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("Missing STRIPE_SECRET_KEY in environment.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2026-02-25.clover",
});
const sessionId =
	requestedSessionId ?? (await getLatestCheckoutSessionId(stripe));

if (!sessionId) {
	throw new Error(
		"Missing checkout session id. Pass --session-id or create a fresh checkout first.",
	);
}

const session = await stripe.checkout.sessions.retrieve(sessionId);
const clerkUserId =
	session.metadata?.clerkUserId ?? session.client_reference_id ?? null;
const purchaseIntentId = session.metadata?.purchaseIntentId ?? null;
const checkoutMetadataValid =
	session.metadata?.metadataSchema === "mma_checkout_v1" &&
	session.metadata?.app === "man_meets_ai" &&
	session.metadata?.accessProduct === "paid_app_access" &&
	session.metadata?.checkoutSurface === "hosted_checkout" &&
	typeof purchaseIntentId === "string" &&
	purchaseIntentId.length > 0 &&
	session.metadata?.courseSlug === undefined;

const deadline = Date.now() + timeoutMs;
let productAccess = null;

while (Date.now() < deadline) {
	productAccess = await getProductAccessDebug(sessionId);
	if (productAccess?.status === "granted") {
		break;
	}
	await new Promise((resolve) => setTimeout(resolve, 1500));
}

console.log(`Checkout session: ${sessionId}`);
printCheck("Convex dev deployment target", true, deploymentName);
printCheck(
	"Stripe session complete",
	session.status === "complete" && session.payment_status === "paid",
	`status=${session.status}, payment_status=${session.payment_status}`,
);
printCheck(
	"Checkout purchase metadata present",
	checkoutMetadataValid,
	`clerkUserId=${clerkUserId ?? "missing"}, purchaseIntentId=${purchaseIntentId ?? "missing"}, metadata=${JSON.stringify(session.metadata)}`,
);
printCheck(
	"Convex product access found",
	Boolean(productAccess),
	productAccess ? `status=${productAccess.status}` : "missing",
);
printCheck(
	"Convex product access granted",
	productAccess?.status === "granted",
	productAccess ? `status=${productAccess.status}` : "missing",
);
printCheck(
	"Product access source",
	productAccess
		? VALID_PRODUCT_ACCESS_SOURCES.has(productAccess.source)
		: false,
	productAccess
		? `source=${productAccess.source}`
		: `missing; expected one of ${Array.from(VALID_PRODUCT_ACCESS_SOURCES).join(
				", ",
			)}`,
);
printCheck(
	"Session id linked",
	productAccess?.stripeCheckoutSessionId === sessionId,
	productAccess?.stripeCheckoutSessionId ?? "missing",
);

console.log(
	JSON.stringify(
		{
			sessionId,
			sessionStatus: session.status,
			paymentStatus: session.payment_status,
			clerkUserId,
			purchaseIntentId,
			productAccess,
		},
		null,
		2,
	),
);

if (
	session.status !== "complete" ||
	session.payment_status !== "paid" ||
	!checkoutMetadataValid ||
	!productAccess ||
	productAccess.status !== "granted" ||
	!VALID_PRODUCT_ACCESS_SOURCES.has(productAccess.source) ||
	productAccess.stripeCheckoutSessionId !== sessionId
) {
	process.exitCode = 1;
}
