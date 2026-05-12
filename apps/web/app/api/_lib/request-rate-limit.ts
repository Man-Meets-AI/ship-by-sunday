type RateLimitKey = {
	bucket: string;
	identity?: string | null;
	request: Request;
};

type RateLimitOptions = RateLimitKey & {
	limit: number;
	windowMs: number;
};

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export function getRateLimitedResponse({
	bucket,
	identity,
	request,
	limit,
	windowMs,
}: RateLimitOptions): Response | null {
	const key = `${bucket}:${identity ?? getRequestFingerprint(request)}`;
	const now = Date.now();
	const existing = rateLimitBuckets.get(key);
	const state =
		existing && existing.resetAt > now
			? existing
			: { count: 0, resetAt: now + windowMs };

	state.count += 1;
	rateLimitBuckets.set(key, state);

	if (state.count <= limit) {
		return null;
	}

	const retryAfterSeconds = Math.max(
		1,
		Math.ceil((state.resetAt - now) / 1_000),
	);
	return new Response("Too many requests", {
		status: 429,
		headers: {
			"retry-after": String(retryAfterSeconds),
		},
	});
}

function getRequestFingerprint(request: Request) {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip")?.trim() ||
		"unknown"
	);
}
