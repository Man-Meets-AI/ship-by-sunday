import { spawn } from "node:child_process";
import Stripe from "stripe";

const CONVEX_BIN_PATH = new URL(
	"../node_modules/convex/bin/main.js",
	import.meta.url,
).pathname;

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

async function getLatestCheckoutSessionId(stripe) {
	const events = await stripe.events.list({
		limit: 1,
		types: ["checkout.session.completed"],
	});
	return events.data[0]?.data?.object?.id ?? null;
}

async function getEntitlementDebug(sessionId) {
	const payload = JSON.stringify({ stripeCheckoutSessionId: sessionId });
	const result = await runCommand(process.execPath, [
		CONVEX_BIN_PATH,
		"run",
		"course:getEntitlementDebug",
		payload,
	]);

	if (result.code !== 0) {
		throw new Error(result.stderr || result.stdout || "Convex query failed.");
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
const courseSlug = session.metadata?.courseSlug ?? "ship-by-sunday";

const deadline = Date.now() + timeoutMs;
let entitlement = null;

while (Date.now() < deadline) {
	entitlement = await getEntitlementDebug(sessionId);
	if (entitlement?.status === "active") {
		break;
	}
	await new Promise((resolve) => setTimeout(resolve, 1500));
}

console.log(`Checkout session: ${sessionId}`);
printCheck(
	"Stripe session complete",
	session.status === "complete" && session.payment_status === "paid",
	`status=${session.status}, payment_status=${session.payment_status}`,
);
printCheck(
	"Metadata present",
	Boolean(clerkUserId) && Boolean(courseSlug),
	`clerkUserId=${clerkUserId ?? "missing"}, courseSlug=${courseSlug ?? "missing"}`,
);
printCheck(
	"Convex entitlement found",
	Boolean(entitlement),
	entitlement ? `status=${entitlement.status}` : "missing",
);
printCheck(
	"Convex entitlement active",
	entitlement?.status === "active",
	entitlement ? `status=${entitlement.status}` : "missing",
);
printCheck(
	"Entitlement source",
	entitlement?.source === "stripe_webhook",
	entitlement ? `source=${entitlement.source}` : "missing",
);
printCheck(
	"Session id linked",
	entitlement?.stripeCheckoutSessionId === sessionId,
	entitlement?.stripeCheckoutSessionId ?? "missing",
);

console.log(
	JSON.stringify(
		{
			sessionId,
			sessionStatus: session.status,
			paymentStatus: session.payment_status,
			clerkUserId,
			courseSlug,
			entitlement,
		},
		null,
		2,
	),
);

if (
	session.status !== "complete" ||
	session.payment_status !== "paid" ||
	!entitlement ||
	entitlement.status !== "active" ||
	entitlement.source !== "stripe_webhook" ||
	entitlement.stripeCheckoutSessionId !== sessionId
) {
	process.exitCode = 1;
}
