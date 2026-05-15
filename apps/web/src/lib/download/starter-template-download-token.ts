import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const tokenVersion = "v1";
const tokenPurpose = "starter-template-download";
const tokenTtlMs = 10 * 60 * 1000;
const tokenQueryParamName = "downloadToken";
const nonProductionFallbackSecret =
	"starter-template-download-non-production-secret";

type TokenVerificationResult =
	| { kind: "valid" }
	| { kind: "missing_secret" }
	| { kind: "invalid" }
	| { kind: "expired" };

function normalizeSecret(value: string | undefined) {
	const normalizedValue = value?.trim();
	return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null;
}

function getDownloadTokenSecret() {
	const configuredSecret =
		normalizeSecret(process.env.CLERK_SECRET_KEY) ??
		normalizeSecret(process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET) ??
		normalizeSecret(process.env.ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET);

	if (configuredSecret) {
		return configuredSecret;
	}

	if (process.env.NODE_ENV !== "production") {
		return nonProductionFallbackSecret;
	}

	return null;
}

function encodeSignature(input: string, secret: string) {
	return createHmac("sha256", secret).update(input).digest("base64url");
}

function buildTokenPayload(expiresAt: number) {
	return `${tokenVersion}.${tokenPurpose}.${expiresAt}`;
}

function signaturesMatch(actualSignature: string, expectedSignature: string) {
	const actual = Buffer.from(actualSignature);
	const expected = Buffer.from(expectedSignature);
	if (actual.length !== expected.length) {
		return false;
	}

	return timingSafeEqual(actual, expected);
}

export function createStarterTemplateDownloadToken(now = Date.now()) {
	const secret = getDownloadTokenSecret();
	if (!secret) {
		throw new Error(
			"Starter template download signing secret is not configured.",
		);
	}

	const expiresAt = now + tokenTtlMs;
	const payload = buildTokenPayload(expiresAt);
	const signature = encodeSignature(payload, secret);
	return `${payload}.${signature}`;
}

export function createStarterTemplateDownloadHref(
	pathname: string,
	now = Date.now(),
) {
	const urlSearchParams = new URLSearchParams({
		[tokenQueryParamName]: createStarterTemplateDownloadToken(now),
	});
	return `${pathname}?${urlSearchParams.toString()}`;
}

export function verifyStarterTemplateDownloadToken(
	token: string | null,
	now = Date.now(),
): TokenVerificationResult {
	const secret = getDownloadTokenSecret();
	if (!secret) {
		return { kind: "missing_secret" };
	}
	if (!token) {
		return { kind: "invalid" };
	}

	const parts = token.split(".");
	if (parts.length !== 4) {
		return { kind: "invalid" };
	}

	const [version, purpose, expiresAtText, signature] = parts;
	if (version !== tokenVersion || purpose !== tokenPurpose) {
		return { kind: "invalid" };
	}

	const expiresAt = Number(expiresAtText);
	if (!Number.isSafeInteger(expiresAt)) {
		return { kind: "invalid" };
	}
	if (expiresAt < now) {
		return { kind: "expired" };
	}

	const expectedSignature = encodeSignature(
		buildTokenPayload(expiresAt),
		secret,
	);
	if (!signaturesMatch(signature, expectedSignature)) {
		return { kind: "invalid" };
	}

	return { kind: "valid" };
}

export function getStarterTemplateDownloadTokenFromRequest(request: Request) {
	return new URL(request.url).searchParams.get(tokenQueryParamName);
}
