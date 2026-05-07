import "server-only";

import { auth } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { ConvexError } from "convex/values";

import { apiConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	getSupportModeBlockedMutationMessage,
	isSupportModeBlockedMutationResult,
} from "@/platform/admin-impersonation";
import { BONUS_LESSON_VIEW_ERROR_CODES } from "@/lib/execute-ship/bonus-lesson-view-contract";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";

type BonusLessonViewedRequestBody = {
	lessonKey: string;
};

function getConvexErrorMessage(error: unknown) {
	if (error instanceof ConvexError) {
		return String(error.data);
	}

	if (error instanceof Error) {
		return error.message;
	}

	return null;
}

function normalizeLessonKey(value: unknown) {
	return typeof value === "string" ? value.trim() : null;
}

async function readBonusLessonViewedRequestBody(request: Request) {
	try {
		return (await request.json()) as Record<string, unknown>;
	} catch {
		return null;
	}
}

export async function markBonusLessonViewedFromRequest(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const body = await readBonusLessonViewedRequestBody(request);
	const lessonKey = normalizeLessonKey(body?.lessonKey);

	if (!lessonKey) {
		return jsonWithRequestId(
			{
				error: "lessonKey is required.",
				code: BONUS_LESSON_VIEW_ERROR_CODES.badRequest,
				requestId,
			},
			{ status: 400 },
			requestId,
		);
	}

	const authState = await auth();
	if (!authState.userId) {
		return jsonWithRequestId(
			{
				error: "Sign in before tracking bonus lesson progress.",
				code: BONUS_LESSON_VIEW_ERROR_CODES.unauthorized,
				requestId,
			},
			{ status: 401 },
			requestId,
		);
	}

	const token = await authState.getToken({
		template: apiConfig.convexAuthTokenTemplate,
	});
	if (!token) {
		return jsonWithRequestId(
			{
				error: "Sign in before tracking bonus lesson progress.",
				code: BONUS_LESSON_VIEW_ERROR_CODES.unauthorized,
				requestId,
			},
			{ status: 401 },
			requestId,
		);
	}

	try {
		const result = await fetchMutation(
			api.course.markBonusLessonViewed,
			{ lessonKey } satisfies BonusLessonViewedRequestBody,
			{ token },
		);
		if (isSupportModeBlockedMutationResult(result)) {
			return jsonWithRequestId(
				{
					error: getSupportModeBlockedMutationMessage(),
					code: BONUS_LESSON_VIEW_ERROR_CODES.forbidden,
					requestId,
				},
				{ status: 403 },
				requestId,
			);
		}

		return jsonWithRequestId(result, undefined, requestId);
	} catch (error) {
		const message = getConvexErrorMessage(error);
		if (message?.includes("Execute / Ship is still locked")) {
			return jsonWithRequestId(
				{
					error: "Execute / Ship is still locked.",
					code: BONUS_LESSON_VIEW_ERROR_CODES.forbidden,
					requestId,
				},
				{ status: 403 },
				requestId,
			);
		}

		if (message?.includes("Lesson not found")) {
			return jsonWithRequestId(
				{
					error: "Lesson not found.",
					code: BONUS_LESSON_VIEW_ERROR_CODES.notFound,
					requestId,
				},
				{ status: 404 },
				requestId,
			);
		}

		return jsonWithRequestId(
			{
				error: "Unable to mark bonus lesson viewed.",
				code: BONUS_LESSON_VIEW_ERROR_CODES.serverError,
				requestId,
			},
			{ status: 500 },
			requestId,
		);
	}
}
