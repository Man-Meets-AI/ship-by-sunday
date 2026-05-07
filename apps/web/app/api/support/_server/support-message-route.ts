import "server-only";

import { fetchAction, fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { getConvexServerSession } from "@/platform/auth/convex-auth";
import {
	appendSupportSessionCookie,
	getSupportSessionCookie,
	type SupportSessionCookie,
} from "./support-session-cookie";

type SupportMessageRequestBody = {
	readonly messageText?: unknown;
	readonly pagePath?: unknown;
	readonly entrySurface?: unknown;
};

const SUPPORT_MESSAGE_MAX_LENGTH = 2_000;
const SUPPORT_FALLBACK_HREF = "https://t.me/parkerrex";

export async function getSupportSessionFromRequest(request: Request) {
	const supportSessionCookie = getSupportSessionCookie(request);
	return appendSupportSessionCookie(
		Response.json({ ok: true }),
		supportSessionCookie,
	);
}

export async function getSupportMessagesFromRequest(request: Request) {
	const supportSessionCookie = getSupportSessionCookie(request);
	const threadState = await fetchQuery(api.support.getThreadBySession, {
		sessionToken: supportSessionCookie.sessionToken,
	}).catch(() => ({
		status: "disabled",
		supportId: null,
		messages: [],
		fallbackHref: SUPPORT_FALLBACK_HREF,
		error: "Ship by Sunday support is using Telegram directly right now.",
	}));

	return appendSupportSessionCookie(
		Response.json(threadState),
		supportSessionCookie,
	);
}

export async function sendSupportMessageFromRequest(request: Request) {
	const supportSessionCookie = getSupportSessionCookie(request);
	const body = await readSupportMessageRequestBody(request);
	const messageText = normalizeSupportMessageText(body?.messageText);
	if (!messageText) {
		return jsonWithSupportCookie(
			{ error: "Message text is required." },
			{ status: 400 },
			supportSessionCookie,
		);
	}

	try {
		const actionArgs = {
			sessionToken: supportSessionCookie.sessionToken,
			messageText,
			pagePath: normalizePagePath(body?.pagePath),
			entrySurface: normalizeEntrySurface(body?.entrySurface),
		};
		const convexAuthToken = await getOptionalConvexAuthToken();
		const threadState = convexAuthToken
			? await fetchAction(api.support.sendVisitorMessage, actionArgs, {
					token: convexAuthToken,
				})
			: await fetchAction(api.support.sendVisitorMessage, actionArgs);

		return jsonWithSupportCookie(threadState, undefined, supportSessionCookie);
	} catch (error) {
		return jsonWithSupportCookie(
			{ error: getSupportMessageError(error) },
			{ status: getSupportErrorStatus(error) },
			supportSessionCookie,
		);
	}
}

async function readSupportMessageRequestBody(request: Request) {
	try {
		return (await request.json()) as SupportMessageRequestBody;
	} catch {
		return null;
	}
}

function normalizeSupportMessageText(value: unknown) {
	if (typeof value !== "string") {
		return null;
	}

	const normalized = value.trim();
	if (!normalized || normalized.length > SUPPORT_MESSAGE_MAX_LENGTH) {
		return null;
	}

	return normalized;
}

function normalizePagePath(value: unknown) {
	if (typeof value !== "string") {
		return "/";
	}

	const normalized = value.trim();
	if (!normalized.startsWith("/")) {
		return "/";
	}

	return normalized.slice(0, 256);
}

function normalizeEntrySurface(value: unknown) {
	return typeof value === "string" && value.trim()
		? value.trim().slice(0, 80)
		: "homepage_support_widget";
}

async function getOptionalConvexAuthToken() {
	try {
		const convexSession = await getConvexServerSession();
		return convexSession.token;
	} catch {
		return null;
	}
}

function getSupportMessageError(error: unknown) {
	if (error instanceof Error && error.message) {
		if (error.message.includes("characters or fewer")) {
			return `Message text must be ${SUPPORT_MESSAGE_MAX_LENGTH} characters or fewer.`;
		}
		if (error.message.includes("wait")) {
			return "Please wait a moment before sending another message.";
		}
		if (error.message.includes("Support is busy")) {
			return "Support is busy. Use Telegram directly for now.";
		}
		if (error.message.includes("Parker has your messages")) {
			return "Parker has your messages. Wait for a reply before sending more.";
		}
		if (error.message.includes("Support thread is closed")) {
			return "This support thread is closed.";
		}
	}

	return "Unable to send support message.";
}

function getSupportErrorStatus(error: unknown) {
	if (!(error instanceof Error)) {
		return 500;
	}

	if (error.message.includes("Support thread is closed")) {
		return 409;
	}

	if (
		error.message.includes("wait") ||
		error.message.includes("Support is busy") ||
		error.message.includes("Parker has your messages")
	) {
		return 429;
	}

	if (
		error.message.includes("required") ||
		error.message.includes("characters or fewer")
	) {
		return 400;
	}

	return 500;
}

function jsonWithSupportCookie(
	body: unknown,
	init: ResponseInit | undefined,
	supportSessionCookie: SupportSessionCookie,
) {
	return appendSupportSessionCookie(
		Response.json(body, init),
		supportSessionCookie,
	);
}
