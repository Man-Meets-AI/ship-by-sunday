import { productConfig } from "@/config/product";
import {
	getLessonByRouteSegment,
	getStudentFacingLessons,
	lessonRegistry,
} from "@/features/course/lesson/model";
import { legacyLessonRedirects } from "@/features/course/lesson/utils/legacy-routes";
import { homePageContent } from "@/features/marketing/content/home";
import { getLessonMapHref } from "@/features/workspace-navigation/lib/lesson-map-href";

describe("curriculum contract", () => {
	it("keeps unique slugs and embedded content on every lesson", () => {
		const seenSlugs = new Set<string>();

		for (const lesson of lessonRegistry) {
			expect(lesson.slug).toBeTruthy();
			expect(lesson.content).toBeTruthy();
			expect(seenSlugs.has(lesson.slug)).toBe(false);
			seenSlugs.add(lesson.slug);
		}
	});

	it("keeps product config and public marketing content aligned", () => {
		const publicBrandCopy = [
			homePageContent.hero.eyebrow,
			homePageContent.hero.body,
			homePageContent.sprintPathSection.supportingPoints.join("\n"),
			homePageContent.footerWordmark,
		].join("\n");

		expect(productConfig.name).toBeTruthy();
		expect(productConfig.courseSlug).toMatch(/^[a-z0-9-]+$/);
		expect(publicBrandCopy).toContain(productConfig.name);
		expect(homePageContent.pricingSection.priceDisplay).toBe(
			productConfig.checkoutPriceDisplay,
		);
		expect(homePageContent.footerWordmark).toBe(productConfig.name);
	});

	it("keeps redirects pointed at supported destinations in the live curriculum", () => {
		for (const [lessonId, destination] of Object.entries(
			legacyLessonRedirects,
		)) {
			expect(lessonId).toMatch(/^\d+\.\d+$/);
			if (destination === getLessonMapHref()) {
				continue;
			}

			expect(destination.startsWith("/lesson/")).toBe(true);
			expect(
				getLessonByRouteSegment(destination.replace("/lesson/", "")),
			).toBeTruthy();
		}
	});

	it("keeps student-facing lessons on the split + workbench-video baseline (1.1–1.5 pattern)", () => {
		const studentLessons = getStudentFacingLessons();
		const openingLessonIds = ["1.1", "1.2", "1.3", "1.4", "1.5"];
		const openingLessons = studentLessons.filter((lesson) =>
			openingLessonIds.includes(lesson.id),
		);
		const restLessons = studentLessons.filter(
			(lesson) => !openingLessonIds.includes(lesson.id),
		);

		expect(openingLessons.every((lesson) => lesson.shell === "split")).toBe(
			true,
		);
		expect(
			openingLessons.every(
				(lesson) => lesson.coachVideoPlacement === "workbench",
			),
		).toBe(true);

		expect(restLessons.length).toBeGreaterThan(20);
		expect(restLessons.every((lesson) => lesson.shell === "split")).toBe(true);
		expect(
			restLessons.every((lesson) => lesson.coachVideoPlacement === "workbench"),
		).toBe(true);
		expect(
			restLessons.every((lesson) =>
				[
					"guided_form",
					"core_flow_sketch",
					"competitor_research_light",
					"build_setup_launchpad",
					"repo_map_orientation",
					"production_deploy_handoff",
					"build_product_iteration",
					"codex_marketing_site",
					"brand_kit_workbench",
					"checkout_qa_loop",
					"build_setting_up_slices",
					"fresh_template_plan",
					"core_ux_plan_flow",
					"core_ux_build",
					"skills_quickstart",
					"build_ship_roadmap",
					"route_access_orientation",
				].includes(lesson.workbench),
			),
		).toBe(true);
		expect(
			getStudentFacingLessons().filter((l) => l.shell === "watch"),
		).toHaveLength(0);
	});
});
