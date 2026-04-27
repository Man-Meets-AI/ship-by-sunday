import {
	getLegacyLessonRedirect,
	legacyLessonRedirects,
} from "@/lib/course/lesson/utils/legacy-routes";
import { getLessonMapHref } from "@/lib/workspace-navigation/lesson-map-href";

describe("legacy lesson routes", () => {
	it("returns the supported compatibility redirects", () => {
		expect(getLegacyLessonRedirect("1.7")).toBe("/lesson/map-the-core-flow");
		expect(getLegacyLessonRedirect("2.7")).toBe("/lesson/build-kickoff");
		expect(getLegacyLessonRedirect("4.6")).toBe("/lesson/product-review");
	});

	it("redirects numeric current lesson labels and mission to stable routes", () => {
		expect(getLegacyLessonRedirect("1.0")).toBe(getLessonMapHref());
		expect(getLegacyLessonRedirect("1.8")).toBe("/lesson/ceo-wrap-up");
		expect(getLegacyLessonRedirect("3.16")).toBe(
			"/lesson/finalize-build-handoff-and-unlock-ship",
		);
	});

	it("returns null for unknown route segments", () => {
		expect(getLegacyLessonRedirect("unknown")).toBeNull();
	});

	it("keeps the compatibility map aligned with the removed curriculum ids", () => {
		expect(legacyLessonRedirects["1.1"]).toBe(
			"/lesson/welcome-to-ship-by-sunday",
		);
		expect(legacyLessonRedirects["3.16"]).toBe(
			"/lesson/finalize-build-handoff-and-unlock-ship",
		);
		expect(legacyLessonRedirects["1.7"]).toBe("/lesson/map-the-core-flow");
		expect(legacyLessonRedirects["4.6"]).toBe("/lesson/product-review");
	});
});
