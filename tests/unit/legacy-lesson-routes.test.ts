import {
  getLegacyLessonRedirect,
  legacyLessonRedirects,
} from "@/features/course/lesson/utils/legacy-routes";

describe("legacy lesson routes", () => {
  it("returns the supported compatibility redirects", () => {
    expect(getLegacyLessonRedirect("1.7")).toBe("/lesson/2.1");
    expect(getLegacyLessonRedirect("2.7")).toBe("/lesson/3.0");
    expect(getLegacyLessonRedirect("4.6")).toBe("/lesson/4.0");
  });

  it("returns null for current lesson ids", () => {
    expect(getLegacyLessonRedirect("1.0")).toBeNull();
    expect(getLegacyLessonRedirect("1.8")).toBeNull();
    expect(getLegacyLessonRedirect("3.16")).toBeNull();
    expect(getLegacyLessonRedirect("unknown")).toBeNull();
  });

  it("keeps the compatibility map aligned with the removed curriculum ids", () => {
    expect(Object.keys(legacyLessonRedirects)).toEqual([
      "1.7",
      "2.3",
      "2.4",
      "2.5",
      "2.6",
      "2.7",
      "4.1",
      "4.2",
      "4.3",
      "4.4",
      "4.5",
      "4.6",
    ]);
  });
});
