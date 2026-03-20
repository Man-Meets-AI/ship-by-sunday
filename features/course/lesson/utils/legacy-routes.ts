export const legacyLessonRedirects = {
  "1.7": "/lesson/2.1",
  "2.3": "/lesson/3.0",
  "2.4": "/lesson/3.0",
  "2.5": "/lesson/3.0",
  "2.6": "/lesson/3.0",
  "2.7": "/lesson/3.0",
  "4.1": "/lesson/4.0",
  "4.2": "/lesson/4.0",
  "4.3": "/lesson/4.0",
  "4.4": "/lesson/4.0",
  "4.5": "/lesson/4.0",
  "4.6": "/lesson/4.0",
} as const satisfies Record<string, string>;

export function getLegacyLessonRedirect(lessonId: string) {
  return (
    legacyLessonRedirects[lessonId as keyof typeof legacyLessonRedirects] ??
    null
  );
}
