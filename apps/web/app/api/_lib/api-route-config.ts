export const nextApiRouteConfig = {
	stripeCheckout: "/api/stripe/checkout",
	stripeExpressCheckout: "/api/stripe/checkout/express",
	observabilityClerk: "/api/observability/clerk",
	observabilityVercel: "/api/observability/vercel",
	observabilityIncidentStatus:
		"/api/observability/incidents/[incidentId]/status",
	codexGenerate: "/api/codex/generate",
	codexAccountRead: "/api/codex/account/read",
	codexAccountLoginStart: "/api/codex/account/login/start",
	codexAccountLoginPoll: "/api/codex/account/login/poll",
	codexAccountRateLimits: "/api/codex/account/rate-limits",
	codexAccountLogout: "/api/codex/account/logout",
	workspaceRunnerPair: "/api/workspace/runner/pair",
	workspaceRunnerEvents: "/api/workspace/runner/events",
} as const;

export const convexHttpRouteConfig = {
	stripeWebhook: "/stripe/webhook",
} as const;

export const apiRouteConfig = {
	...nextApiRouteConfig,
	...convexHttpRouteConfig,
} as const;
