export type CodexAccount =
	| {
			type: "chatgpt";
			email: string;
			planType: string;
	  }
	| {
			type: "apiKey";
	  }
	| null;

export type RateLimitWindow = {
	usedPercent: number;
	windowDurationMins: number | null;
	resetsAt: number | null;
};

export type RateLimitSnapshot = {
	limitId: string | null;
	limitName: string | null;
	primary: RateLimitWindow | null;
	secondary: RateLimitWindow | null;
	credits: {
		hasCredits: boolean;
		unlimited: boolean;
		balance: string;
	} | null;
	planType: string | null;
};

export type RateLimitsPayload = {
	rateLimits: RateLimitSnapshot;
	rateLimitsByLimitId: Record<string, RateLimitSnapshot> | null;
} | null;

export type RequestState =
	| "loading"
	| "idle"
	| "starting_login"
	| "polling"
	| "refreshing_limits"
	| "disconnecting";

export type FeedbackState = {
	tone: "neutral" | "error";
	message: string;
};

export type ConnectionState = {
	connected: boolean;
	account: CodexAccount;
	rateLimits: RateLimitsPayload;
	pendingLoginId: string | null;
};

export const emptyConnectionState: ConnectionState = {
	connected: false,
	account: null,
	rateLimits: null,
	pendingLoginId: null,
};

export function getRateLimitSnapshots(rateLimits: RateLimitsPayload) {
	if (!rateLimits) {
		return [];
	}

	if (rateLimits.rateLimitsByLimitId) {
		return Object.values(rateLimits.rateLimitsByLimitId);
	}

	return [rateLimits.rateLimits];
}

export function formatResetTimestamp(epochSeconds: number | null) {
	if (!epochSeconds) {
		return "n/a";
	}

	return new Date(epochSeconds * 1000).toLocaleString();
}
