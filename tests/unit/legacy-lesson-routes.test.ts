import {
	getLegacyLessonRedirect,
	legacyLessonRedirects,
} from "@/features/course/lesson/utils/legacy-routes";

describe("legacy lesson routes", () => {
	it("returns the supported compatibility redirects", () => {
		expect(getLegacyLessonRedirect("0.0")).toBe("/mission");
		expect(getLegacyLessonRedirect("1.8")).toBe("/lesson/1.7");
		expect(getLegacyLessonRedirect("2.7")).toBe("/lesson/3.0");
		expect(getLegacyLessonRedirect("4.6")).toBe("/lesson/4.0");
	});

	it("returns null for current lesson ids", () => {
		expect(getLegacyLessonRedirect("1.7")).toBeNull();
		expect(getLegacyLessonRedirect("3.16")).toBeNull();
		expect(getLegacyLessonRedirect("unknown")).toBeNull();
	});

	it("keeps the compatibility map aligned with the removed curriculum ids", () => {
		expect(Object.keys(legacyLessonRedirects)).toEqual([
			"0.0",
			"1.8",
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
