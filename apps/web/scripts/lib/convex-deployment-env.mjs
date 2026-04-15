function isProductionQaTarget(env = process.env) {
	return (
		env.QA_ENV_FILE?.endsWith(".env.production") === true ||
		env.PLAYWRIGHT_BASE_URL === "https://www.man-meets-ai.com"
	);
}

function isHostedQaTarget(env = process.env) {
	const baseUrl = env.PLAYWRIGHT_BASE_URL?.trim();
	if (!baseUrl) {
		return false;
	}

	try {
		const hostname = new URL(baseUrl).hostname;
		return hostname !== "localhost" && hostname !== "127.0.0.1";
	} catch {
		return false;
	}
}

export function withConvexDeploymentEnv(env) {
	if (env.CONVEX_DEPLOYMENT || !isHostedQaTarget(env)) {
		return env;
	}

	const convexUrl = env.NEXT_PUBLIC_CONVEX_URL?.trim();
	if (!convexUrl) {
		return env;
	}

	const deploymentName = new URL(convexUrl).hostname.split(".")[0];
	if (!deploymentName) {
		return env;
	}

	return {
		...env,
		CONVEX_DEPLOYMENT:
			isProductionQaTarget(env) || deploymentName.startsWith("prod:")
				? deploymentName
				: `prod:${deploymentName}`,
	};
}
