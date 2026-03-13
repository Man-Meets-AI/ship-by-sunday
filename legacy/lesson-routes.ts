export const legacyLessonRedirects = {
	"0.0": "/mission",
	"2.7": "/lesson/3.1",
} as const satisfies Record<string, string>;

export function getLegacyLessonRedirect(lessonId: string) {
	return (
		legacyLessonRedirects[lessonId as keyof typeof legacyLessonRedirects] ??
		null
	);
}
