import {
	getLegacyLessonRedirect,
	legacyLessonRedirects,
} from "@/legacy/lesson-routes";

describe("legacy lesson routes", () => {
	it("returns the supported compatibility redirects", () => {
		expect(getLegacyLessonRedirect("0.0")).toBe("/mission");
		expect(getLegacyLessonRedirect("2.7")).toBe("/lesson/3.1");
	});

	it("returns null for current lesson ids", () => {
		expect(getLegacyLessonRedirect("3.1")).toBeNull();
		expect(getLegacyLessonRedirect("unknown")).toBeNull();
	});

	it("keeps the compatibility map intentionally small", () => {
		expect(Object.keys(legacyLessonRedirects)).toEqual(["0.0", "2.7"]);
	});
});
