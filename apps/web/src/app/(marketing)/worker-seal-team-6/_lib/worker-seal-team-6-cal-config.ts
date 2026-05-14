const defaultWorkerSealTeam6CalOrigin = "https://cal.com";

export type WorkerSealTeam6CalBookingConfig = {
	calLink: string | null;
	calOrigin: string;
	hostedBookingUrl: string | null;
	directSchedulingHref: string;
};

export function normalizeWorkerSealTeam6CalLink(value: string | undefined) {
	const trimmedValue = value?.trim();
	if (!trimmedValue) {
		return null;
	}

	const rawPath = getCalLinkPath(trimmedValue);
	const calLink = rawPath.replace(/^\/+|\/+$/g, "");
	return calLink.length > 0 ? calLink : null;
}

export function normalizeWorkerSealTeam6CalOrigin(value: string | undefined) {
	const trimmedValue = value?.trim();
	if (!trimmedValue) {
		return defaultWorkerSealTeam6CalOrigin;
	}

	try {
		const url = new URL(trimmedValue);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return defaultWorkerSealTeam6CalOrigin;
		}

		return url.origin;
	} catch {
		return defaultWorkerSealTeam6CalOrigin;
	}
}

export function createWorkerSealTeam6CalBookingConfig({
	calLinkEnv,
	calOriginEnv,
	directSchedulingHref,
}: {
	calLinkEnv: string | undefined;
	calOriginEnv: string | undefined;
	directSchedulingHref: string;
}): WorkerSealTeam6CalBookingConfig {
	const calLink = normalizeWorkerSealTeam6CalLink(calLinkEnv);
	const calOrigin = normalizeWorkerSealTeam6CalOrigin(calOriginEnv);
	const hostedBookingUrl = calLink
		? new URL(`/${calLink}`, calOrigin).toString()
		: null;

	return {
		calLink,
		calOrigin,
		hostedBookingUrl,
		directSchedulingHref,
	};
}

function getCalLinkPath(value: string) {
	try {
		return new URL(value).pathname;
	} catch {
		return value;
	}
}
