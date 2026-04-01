const BUNNY_EMBED_HOSTS = new Set([
	"player.mediadelivery.net",
	"iframe.mediadelivery.net",
]);

const BUNNY_EMBED_PATH_PATTERN =
	/^\/(?:embed|play)\/[A-Za-z0-9-]+\/[A-Za-z0-9-]+$/;

export type VideoAvailabilityResult =
	| {
			kind: "ready";
			httpStatus: number;
	  }
	| {
			kind: "unavailable";
			httpStatus: number | null;
	  };

export type VideoVerificationFetch = typeof fetch;

export function isBunnyEmbedUrl(url: string): boolean {
	let parsedUrl: URL;

	try {
		parsedUrl = new URL(url);
	} catch {
		return false;
	}

	return (
		parsedUrl.protocol === "https:" &&
		BUNNY_EMBED_HOSTS.has(parsedUrl.hostname) &&
		BUNNY_EMBED_PATH_PATTERN.test(parsedUrl.pathname)
	);
}

export async function verifyBunnyEmbedUrl(
	url: string,
	fetchImpl: VideoVerificationFetch = fetch,
): Promise<VideoAvailabilityResult> {
	if (!isBunnyEmbedUrl(url)) {
		return { kind: "unavailable", httpStatus: null };
	}

	const response = await fetchImpl(url, {
		method: "GET",
		cache: "no-store",
		redirect: "follow",
		headers: {
			accept: "text/html,application/xhtml+xml",
		},
	});

	await response.body?.cancel().catch(() => undefined);

	if (response.ok) {
		return {
			kind: "ready",
			httpStatus: response.status,
		};
	}

	return {
		kind: "unavailable",
		httpStatus: response.status,
	};
}
