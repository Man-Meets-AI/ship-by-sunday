export const BONUS_LESSON_VIEWED_ENDPOINT =
	"/api/course/bonus-lesson-viewed" as const;

export const BONUS_LESSON_VIEW_ERROR_CODES = {
	unauthorized: "UNAUTHORIZED",
	badRequest: "BAD_REQUEST",
	forbidden: "FORBIDDEN",
	notFound: "NOT_FOUND",
	serverError: "SERVER_ERROR",
} as const;
