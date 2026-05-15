const RELEASE_BILLING_DOCTOR_CONFIG = {
	preview: {
		appBaseUrl: "https://dev.man-meets-ai.com",
		envFile: ".env.local",
		expectedMode: "test",
		releaseEnvironment: "preview",
	},
	production: {
		appBaseUrl: "https://www.man-meets-ai.com",
		envFile: ".env.production",
		expectedMode: "live",
		releaseEnvironment: "production",
	},
};

export function resolveReleaseBillingDoctorConfig(releaseEnvironment) {
	const config = RELEASE_BILLING_DOCTOR_CONFIG[releaseEnvironment];
	if (!config) {
		throw new Error(
			`Unsupported release billing environment '${releaseEnvironment}'. Expected 'preview' or 'production'.`,
		);
	}

	return config;
}

export function buildReleaseBillingDoctorCommand(config) {
	return [
		"bun",
		`--env-file=${config.envFile}`,
		"scripts/verify-managed-stripe-env.ts",
		`--expected-mode=${config.expectedMode}`,
		`--app-base-url=${config.appBaseUrl}`,
		"--require-webhook-endpoint",
		"--require-convex-sync-boundary",
	];
}
