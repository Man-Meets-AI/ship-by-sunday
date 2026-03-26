export const STRIPE_CLI_PROJECT_NAME = "ship-by-sunday";

export function buildStripeCliArgs(
	args,
	{ projectName = STRIPE_CLI_PROJECT_NAME } = {},
) {
	return [...args, "--project-name", projectName];
}

export function parseStripeCliConfigListOutput(output) {
	const trimmedOutput = output.trim();
	if (!trimmedOutput) {
		return null;
	}

	const values = {};
	let resolvedProjectName = null;

	for (const rawLine of trimmedOutput.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) {
			continue;
		}

		if (line.startsWith("[") && line.endsWith("]")) {
			resolvedProjectName = line.slice(1, -1).trim();
			continue;
		}

		const separatorIndex = line.indexOf("=");
		if (separatorIndex < 0) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		const value = line
			.slice(separatorIndex + 1)
			.trim()
			.replace(/^'|'$/g, "");

		if (key) {
			values[key] = value;
		}
	}

	return {
		projectName: resolvedProjectName ?? STRIPE_CLI_PROJECT_NAME,
		accountId: values.account_id ?? null,
		displayName: values.display_name ?? null,
		values,
	};
}

export function buildStripeCliRepairCommand(
	projectName = STRIPE_CLI_PROJECT_NAME,
) {
	return `stripe login --project-name ${projectName}`;
}

export function buildStripeCliProjectCheck({
	projectConfig,
	stripeAccount,
	projectName = STRIPE_CLI_PROJECT_NAME,
	stripeCliAvailable = true,
}) {
	const label = `Stripe CLI project ${projectName}`;
	const repairCommand = buildStripeCliRepairCommand(projectName);

	if (!stripeCliAvailable) {
		return {
			label,
			status: "unavailable",
			passed: false,
			detail: "Stripe CLI not available on PATH",
			guidance: `Install the Stripe CLI, then run \`${repairCommand}\` and sign into ${stripeAccount.displayName} (${stripeAccount.id}).`,
		};
	}

	if (!projectConfig?.accountId) {
		return {
			label,
			status: "missing",
			passed: false,
			detail: "missing",
			guidance: `Run \`${repairCommand}\` and sign into ${stripeAccount.displayName} (${stripeAccount.id}).`,
		};
	}

	if (projectConfig.accountId !== stripeAccount.id) {
		return {
			label,
			status: "mismatch",
			passed: false,
			detail: `${projectConfig.displayName ?? projectConfig.projectName ?? "Stripe CLI"} (${projectConfig.accountId}); expected ${stripeAccount.displayName} (${stripeAccount.id})`,
			guidance: `Run \`${repairCommand}\` and select ${stripeAccount.displayName} (${stripeAccount.id}).`,
		};
	}

	return {
		label,
		status: "healthy",
		passed: true,
		detail: `${projectConfig.displayName ?? projectConfig.projectName ?? "Stripe CLI"} (${projectConfig.accountId})`,
		guidance: null,
	};
}
