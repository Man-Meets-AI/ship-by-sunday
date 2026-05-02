import { spawn } from "node:child_process";

import {
	APPS_WEB_DIRECTORY,
	CONVEX_BIN_PATH,
} from "./lib/convex-product-access-grant.mjs";
import { findUserByEmail } from "./ensure-clerk-test-user.mjs";

const DEFAULT_CLERK_API_BASE_URL = "https://api.clerk.com";
const SCRIPT_NAME = "repair-paid-checkout-customer";

function result(status, details = {}) {
	return { status, ...details };
}

function getMessageFromErrorPayload(payload, fallback) {
	if (!payload || typeof payload !== "object") {
		return fallback;
	}

	if (typeof payload.errors?.[0]?.long_message === "string") {
		return payload.errors[0].long_message;
	}

	if (typeof payload.errors?.[0]?.message === "string") {
		return payload.errors[0].message;
	}

	if (typeof payload.message === "string") {
		return payload.message;
	}

	return fallback;
}

function normalizeEmail(email) {
	return email.trim().toLowerCase();
}

function requireValue(value, label) {
	const normalized = value?.trim();
	if (!normalized) {
		throw new Error(`Missing ${label}.`);
	}

	return normalized;
}

function getOptionValue(args, index, optionName) {
	const next = args[index + 1];
	if (!next || next.startsWith("--")) {
		throw new Error(`Missing value for ${optionName}.`);
	}

	return next;
}

export function parseArgs(args) {
	const parsed = {
		checkoutEmail: null,
		stripeCheckoutSessionId: null,
		clerkUserId: null,
		createClerkUser: false,
	};

	for (let i = 0; i < args.length; i += 1) {
		const current = args[i];

		if (current === "--create-clerk-user") {
			parsed.createClerkUser = true;
			continue;
		}

		if (current?.startsWith("--checkout-email=")) {
			parsed.checkoutEmail = current.slice("--checkout-email=".length);
			continue;
		}

		if (current === "--checkout-email") {
			parsed.checkoutEmail = getOptionValue(args, i, "--checkout-email");
			i += 1;
			continue;
		}

		if (current?.startsWith("--stripe-checkout-session-id=")) {
			parsed.stripeCheckoutSessionId = current.slice(
				"--stripe-checkout-session-id=".length,
			);
			continue;
		}

		if (current === "--stripe-checkout-session-id") {
			parsed.stripeCheckoutSessionId = getOptionValue(
				args,
				i,
				"--stripe-checkout-session-id",
			);
			i += 1;
			continue;
		}

		if (current?.startsWith("--clerk-user-id=")) {
			parsed.clerkUserId = current.slice("--clerk-user-id=".length);
			continue;
		}

		if (current === "--clerk-user-id") {
			parsed.clerkUserId = getOptionValue(args, i, "--clerk-user-id");
			i += 1;
			continue;
		}

		throw new Error(`Unknown argument: ${current}`);
	}

	return {
		checkoutEmail: normalizeEmail(
			requireValue(parsed.checkoutEmail, "--checkout-email"),
		),
		stripeCheckoutSessionId: requireValue(
			parsed.stripeCheckoutSessionId,
			"--stripe-checkout-session-id",
		),
		clerkUserId: parsed.clerkUserId
			? requireValue(parsed.clerkUserId, "--clerk-user-id")
			: null,
		createClerkUser: parsed.createClerkUser,
	};
}

async function fetchClerkUsersByEmail({
	secretKey,
	email,
	apiBaseUrl = DEFAULT_CLERK_API_BASE_URL,
	fetchImpl = fetch,
}) {
	const url = new URL("/v1/users", apiBaseUrl);
	url.searchParams.set("limit", "100");
	url.searchParams.set("query", normalizeEmail(email));

	const response = await fetchImpl(url, {
		headers: {
			Authorization: `Bearer ${secretKey}`,
		},
	});
	const body = await response.json().catch(() => null);

	if (!response.ok) {
		return result("error", {
			message: getMessageFromErrorPayload(
				body,
				`Clerk user lookup failed with status ${response.status}.`,
			),
			statusCode: response.status,
		});
	}

	return result("ok", {
		users: Array.isArray(body) ? body : [],
	});
}

async function createClerkCheckoutUser({
	secretKey,
	email,
	stripeCheckoutSessionId,
	apiBaseUrl = DEFAULT_CLERK_API_BASE_URL,
	fetchImpl = fetch,
}) {
	const response = await fetchImpl(new URL("/v1/users", apiBaseUrl), {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secretKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email_address: [email],
			skip_password_requirement: true,
			private_metadata: {
				shipBySundayPaidCheckoutRepair: {
					checkoutEmail: email,
					stripeCheckoutSessionId,
					source: SCRIPT_NAME,
					createdAt: new Date().toISOString(),
				},
			},
		}),
	});
	const body = await response.json().catch(() => null);

	if (!response.ok) {
		return result("error", {
			message: getMessageFromErrorPayload(
				body,
				`Clerk user creation failed with status ${response.status}.`,
			),
			statusCode: response.status,
		});
	}

	return result("created", {
		clerkUserId: body?.id ?? null,
	});
}

export async function ensureCheckoutEmailClerkUser({
	secretKey,
	email,
	stripeCheckoutSessionId,
	createClerkUser,
	fetchImpl = fetch,
}) {
	if (!secretKey) {
		return result("blocked", {
			message: "Missing CLERK_SECRET_KEY.",
		});
	}

	const lookup = await fetchClerkUsersByEmail({
		secretKey,
		email,
		fetchImpl,
	});

	if (lookup.status !== "ok") {
		return lookup;
	}

	const existingUser = findUserByEmail(lookup.users, email);
	if (existingUser?.id) {
		return result("exists", {
			clerkUserId: existingUser.id,
		});
	}

	if (!createClerkUser) {
		return result("missing", {
			message:
				"No Clerk user exists for the checkout email. Rerun with --create-clerk-user to create one.",
		});
	}

	const created = await createClerkCheckoutUser({
		secretKey,
		email,
		stripeCheckoutSessionId,
		fetchImpl,
	});

	if (created.status === "created" && created.clerkUserId) {
		return created;
	}

	return result("error", {
		message: created.message ?? "Clerk user creation did not return a user id.",
		statusCode: created.statusCode,
	});
}

function spawnCommand(command, args, options) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			...options,
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
		child.on("close", (code) => {
			resolve({
				code: code ?? 1,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
			});
		});
	});
}

export function buildRepairPaidCheckoutClaimCommand({
	checkoutEmail,
	stripeCheckoutSessionId,
	clerkUserId,
}) {
	return {
		command: process.execPath,
		args: [
			CONVEX_BIN_PATH,
			"run",
			"--prod",
			"checkoutClaims:repairPaidCheckoutClaim",
			JSON.stringify({
				stripeCheckoutSessionId,
				checkoutEmail,
				clerkUserId,
			}),
		],
	};
}

export async function repairPaidCheckoutClaim({
	checkoutEmail,
	stripeCheckoutSessionId,
	clerkUserId,
	env = process.env,
	runCommand = spawnCommand,
}) {
	const { command, args } = buildRepairPaidCheckoutClaimCommand({
		checkoutEmail,
		stripeCheckoutSessionId,
		clerkUserId,
	});

	return runCommand(command, args, {
		cwd: APPS_WEB_DIRECTORY,
		env,
	});
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	fetchImpl = fetch,
	repairPaidCheckoutClaimImpl = repairPaidCheckoutClaim,
} = {}) {
	let parsed;
	try {
		parsed = parseArgs(args);
	} catch (error) {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					error instanceof Error ? error.message : "Failed to parse arguments.",
				usage:
					"node --env-file=.env.production apps/web/scripts/repair-paid-checkout-customer.mjs --checkout-email <email> --stripe-checkout-session-id <cs_...> [--create-clerk-user] [--clerk-user-id <user_...>]",
			}),
		};
	}

	const clerkUserResult = parsed.clerkUserId
		? result("provided", { clerkUserId: parsed.clerkUserId })
		: await ensureCheckoutEmailClerkUser({
				secretKey: env.CLERK_SECRET_KEY,
				email: parsed.checkoutEmail,
				stripeCheckoutSessionId: parsed.stripeCheckoutSessionId,
				createClerkUser: parsed.createClerkUser,
				fetchImpl,
			});

	if (!clerkUserResult.clerkUserId) {
		return {
			exitCode: 1,
			payload: result("blocked", {
				checkoutEmail: parsed.checkoutEmail,
				stripeCheckoutSessionId: parsed.stripeCheckoutSessionId,
				message: clerkUserResult.message ?? "Unable to resolve Clerk user.",
				clerkUserStatus: clerkUserResult.status,
				statusCode: clerkUserResult.statusCode,
			}),
		};
	}

	const repairResult = await repairPaidCheckoutClaimImpl({
		checkoutEmail: parsed.checkoutEmail,
		stripeCheckoutSessionId: parsed.stripeCheckoutSessionId,
		clerkUserId: clerkUserResult.clerkUserId,
		env,
	});

	if (repairResult.code !== 0) {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					"Convex paid checkout repair failed. Make sure the repair mutation is deployed to production and the Convex CLI is authenticated.",
				checkoutEmail: parsed.checkoutEmail,
				stripeCheckoutSessionId: parsed.stripeCheckoutSessionId,
				clerkUserId: clerkUserResult.clerkUserId,
				clerkUserStatus: clerkUserResult.status,
				stdout: repairResult.stdout,
				stderr: repairResult.stderr,
			}),
		};
	}

	return {
		exitCode: 0,
		payload: result("ok", {
			message: "Paid checkout customer account is repaired.",
			checkoutEmail: parsed.checkoutEmail,
			stripeCheckoutSessionId: parsed.stripeCheckoutSessionId,
			clerkUserId: clerkUserResult.clerkUserId,
			clerkUserStatus: clerkUserResult.status,
			repairOutput: repairResult.stdout,
		}),
	};
}

const isEntrypoint =
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isEntrypoint) {
	const { exitCode, payload } = await runCli();
	console.log(JSON.stringify(payload, null, 2));
	process.exitCode = exitCode;
}
