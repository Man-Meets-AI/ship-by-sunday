import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
	environment:
		process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
	release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
	sendDefaultPii: false,
	tracesSampleRate: getClientTraceSampleRate(),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

function getClientTraceSampleRate() {
	const configuredRate = Number(
		process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
	);
	if (Number.isFinite(configuredRate)) {
		return configuredRate;
	}

	return process.env.NODE_ENV === "development" ? 1.0 : 0.1;
}
