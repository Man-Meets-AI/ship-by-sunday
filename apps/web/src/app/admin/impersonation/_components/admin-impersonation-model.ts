export function adminImpersonationReasonIsValid(reason: string) {
	const normalized = reason.trim().replace(/\s+/g, " ");
	return normalized.length >= 10 && normalized.length <= 500;
}
