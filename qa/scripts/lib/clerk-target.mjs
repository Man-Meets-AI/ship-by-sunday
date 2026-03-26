const localhostHosts = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);

function extractClerkPublishableKey(html) {
	const keyMatch = html.match(/pk_(live|test)_[A-Za-z0-9_$-]+/);
	return keyMatch?.[0] ?? null;
}

function getClerkKeyMode(key) {
	if (key.startsWith("pk_live_") || key.startsWith("sk_live_")) {
		return "live";
	}

	if (key.startsWith("pk_test_") || key.startsWith("sk_test_")) {
		return "test";
	}

	return "unknown";
}

function summarizeClerkKey(key) {
	if (key.length <= 18) {
		return key;
	}

	return `${key.slice(0, 12)}...${key.slice(-6)}`;
}

export function shouldValidateHostedClerkTarget(baseUrl) {
	if (!baseUrl) {
		return false;
	}

	return !localhostHosts.has(new URL(baseUrl).hostname);
}

export async function assertClerkTargetMatchesQaEnv({
	baseUrl,
	loadedEnvFilePath,
	fetchImpl = fetch,
}) {
	if (!shouldValidateHostedClerkTarget(baseUrl)) {
		return;
	}

	const envPublishableKey =
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? null;
	const envSecretKey = process.env.CLERK_SECRET_KEY?.trim() ?? null;

	if (!envPublishableKey && !envSecretKey) {
		return;
	}

	const signInUrl = new URL("/sign-in", baseUrl);
	const response = await fetchImpl(signInUrl, {
		headers: {
			"user-agent": "manmeetsai-qa-auth-check/1.0",
		},
		redirect: "follow",
	});

	if (!response.ok) {
		throw new Error(
			`Failed to inspect Clerk config for ${signInUrl.origin}. GET ${signInUrl.pathname} returned ${response.status}.`,
		);
	}

	const html = await response.text();
	const targetPublishableKey = extractClerkPublishableKey(html);

	if (!targetPublishableKey) {
		throw new Error(
			`Could not find the target Clerk publishable key on ${signInUrl.origin}/sign-in.`,
		);
	}

	const configuredKey = envPublishableKey ?? envSecretKey;
	const hasModeMismatch =
		getClerkKeyMode(configuredKey) !== getClerkKeyMode(targetPublishableKey);
	const hasPublishableKeyMismatch =
		envPublishableKey !== null && envPublishableKey !== targetPublishableKey;

	if (!hasModeMismatch && !hasPublishableKeyMismatch) {
		return;
	}

	const envSource = loadedEnvFilePath
		? `Loaded QA env from ${loadedEnvFilePath}.`
		: "Loaded QA env from process env only.";

	throw new Error(
		[
			`The hosted target ${signInUrl.origin} uses Clerk publishable key ${summarizeClerkKey(targetPublishableKey)}, but the loaded QA env is configured for ${summarizeClerkKey(configuredKey)}.`,
			envSource,
			"Load Clerk env values that match the hosted target before preparing personas.",
			"Set QA_ENV_FILE to a matching env file or export matching NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY before rerunning the QA command.",
		].join(" "),
	);
}
