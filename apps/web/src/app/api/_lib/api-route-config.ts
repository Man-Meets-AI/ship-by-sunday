export const nextApiRouteConfig = {
	stripeCheckout: "/api/stripe/checkout",
	stripeExpressCheckout: "/api/stripe/checkout/express",
	stripeWebhook: "/api/stripe/webhook",
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
	workspaceRunnerDoctorPassStart: "/api/workspace/runner/doctor-pass/start",
	workspaceRunnerFindings: "/api/workspace/runner/findings",
	workspaceRunnerWorkflowRuns: "/api/workspace/runner/workflow-runs",
} as const;

export const convexHttpRouteConfig = {
	legacyStripeWebhook: "/stripe/webhook",
} as const;

export const apiRouteConfig = {
	...nextApiRouteConfig,
	...convexHttpRouteConfig,
} as const;
