import { readFile } from "node:fs/promises";

const DEFAULT_API_BASE_URL = "https://api.clerk.com";
export const DEFAULT_CONFIG_URL = new URL(
	"./data/clerk-test-accounts.json",
	import.meta.url,
);

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

function summarizeAccount(account) {
	return {
		scope: account.scope,
		provider: account.provider,
		authMode: account.authMode,
		email: account.email,
		softwareName: account.softwareName,
	};
}

export function findUserByEmail(users, email) {
	return (
		users.find(
			(user) =>
				Array.isArray(user?.email_addresses) &&
				user.email_addresses.some(
					(address) =>
						typeof address?.email_address === "string" &&
						address.email_address.toLowerCase() === email.toLowerCase(),
				),
		) ?? null
	);
}

export async function loadConfiguredAccount({
	configUrl = DEFAULT_CONFIG_URL,
	scope,
} = {}) {
	const raw = await readFile(configUrl, "utf8");
	const parsed = JSON.parse(raw);
	const resolvedScope = scope ?? parsed.defaultScope;
	const account = parsed.accounts?.[resolvedScope];

	if (!account) {
		throw new Error(
			`Missing Clerk test account config for scope: ${resolvedScope}`,
		);
	}

	return account;
}

async function fetchClerkUsersByQuery({
	secretKey,
	email,
	apiBaseUrl = DEFAULT_API_BASE_URL,
	fetchImpl = fetch,
}) {
	const url = new URL("/v1/users", apiBaseUrl);
	url.searchParams.set("limit", "100");
	// Clerk user search can be case-sensitive for query matching.
	url.searchParams.set("query", email.toLowerCase());

	const response = await fetchImpl(url, {
		headers: {
			Authorization: `Bearer ${secretKey}`,
		},
	});

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const fallback = `Clerk user lookup failed with status ${response.status}.`;
		return result("error", {
			message: getMessageFromErrorPayload(body, fallback),
			statusCode: response.status,
			raw: body,
		});
	}

	return result("ok", {
		users: Array.isArray(body) ? body : [],
	});
}

async function createClerkUser({
	account,
	secretKey,
	apiBaseUrl = DEFAULT_API_BASE_URL,
	fetchImpl = fetch,
}) {
	const response = await fetchImpl(new URL("/v1/users", apiBaseUrl), {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secretKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email_address: [account.email],
			password: account.password,
			first_name: account.firstName,
			last_name: account.lastName,
		}),
	});

	const body = await response.json().catch(() => null);

	if (!response.ok) {
		const fallback = `Clerk user creation failed with status ${response.status}.`;
		const message = getMessageFromErrorPayload(body, fallback);
		const status =
			response.status === 400 ||
			response.status === 401 ||
			response.status === 403 ||
			response.status === 422
				? "blocked"
				: "error";

		return result(status, {
			message,
			statusCode: response.status,
			raw: body,
		});
	}

	return result("created", {
		message: "Clerk test user created.",
		clerkUserId: body?.id ?? null,
		user: body ?? null,
	});
}

export async function checkClerkTestUser({
	account,
	secretKey,
	apiBaseUrl = DEFAULT_API_BASE_URL,
	fetchImpl = fetch,
}) {
	if (!secretKey) {
		return result("blocked", {
			...summarizeAccount(account),
			message: "Missing CLERK_SECRET_KEY.",
		});
	}

	if (account.authMode !== "password") {
		return result("blocked", {
			...summarizeAccount(account),
			message: `Unsupported auth mode for repo-local provisioning: ${account.authMode}.`,
		});
	}

	const lookup = await fetchClerkUsersByQuery({
		secretKey,
		email: account.email,
		apiBaseUrl,
		fetchImpl,
	});

	if (lookup.status !== "ok") {
		return result(lookup.status, {
			...summarizeAccount(account),
			message: lookup.message,
			statusCode: lookup.statusCode,
			raw: lookup.raw,
		});
	}

	const existingUser = findUserByEmail(lookup.users, account.email);

	if (!existingUser) {
		return result("missing", {
			...summarizeAccount(account),
			message: "Clerk test user is missing.",
		});
	}

	return result("exists", {
		...summarizeAccount(account),
		message: "Clerk test user already exists.",
		clerkUserId: existingUser.id ?? null,
	});
}

export async function ensureClerkTestUser({
	account,
	secretKey,
	apiBaseUrl = DEFAULT_API_BASE_URL,
	fetchImpl = fetch,
}) {
	const preflight = await checkClerkTestUser({
		account,
		secretKey,
		apiBaseUrl,
		fetchImpl,
	});

	if (preflight.status !== "missing") {
		return preflight;
	}

	const created = await createClerkUser({
		account,
		secretKey,
		apiBaseUrl,
		fetchImpl,
	});

	if (
		created.status === "blocked" &&
		created.raw?.errors?.[0]?.code === "email_address_exists"
	) {
		const recheck = await checkClerkTestUser({
			account,
			secretKey,
			apiBaseUrl,
			fetchImpl,
		});

		if (recheck.status === "exists") {
			return result("exists", {
				...summarizeAccount(account),
				message: "Clerk test user already exists.",
				clerkUserId: recheck.clerkUserId ?? null,
			});
		}
	}

	return result(created.status, {
		...summarizeAccount(account),
		message: created.message,
		clerkUserId: created.clerkUserId ?? null,
		statusCode: created.statusCode,
		raw: created.raw,
	});
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	fetchImpl = fetch,
} = {}) {
	const [mode, ...restArgs] = args;

	if (mode !== "check" && mode !== "create") {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					"Usage: node --env-file=.env.local scripts/ensure-clerk-test-user.mjs <check|create> [--scope=<scope>] [--scope <scope>]",
			}),
		};
	}

	let requestedScope = env.CLERK_TEST_USER_SCOPE;
	for (let i = 0; i < restArgs.length; i += 1) {
		const current = restArgs[i];
		if (current?.startsWith("--scope=")) {
			requestedScope = current.slice("--scope=".length);
			continue;
		}

		if (current === "--scope") {
			const next = restArgs[i + 1];
			if (!next || next.startsWith("--")) {
				return {
					exitCode: 1,
					payload: result("error", {
						message: "Missing value for --scope.",
					}),
				};
			}

			requestedScope = next;
			i += 1;
		}
	}

	let account;

	try {
		account = await loadConfiguredAccount({ scope: requestedScope });
	} catch (error) {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					error instanceof Error
						? error.message
						: "Failed to load Clerk test account config.",
			}),
		};
	}

	const runner = mode === "check" ? checkClerkTestUser : ensureClerkTestUser;
	const payload = await runner({
		account,
		secretKey: env.CLERK_SECRET_KEY,
		fetchImpl,
	});
	const exitCode =
		payload.status === "blocked" || payload.status === "error" ? 1 : 0;

	return { exitCode, payload };
}

const isEntrypoint =
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isEntrypoint) {
	const { exitCode, payload } = await runCli();
	console.log(JSON.stringify(payload, null, 2));
	process.exitCode = exitCode;
}
