import { getLessonHref } from "@/features/course/lesson/model";
import type { LessonConfig } from "@/features/course/lesson/model";
import { buildStageUnlockSummary } from "@/features/course/lesson/model/stage-unlock";

const ceoStageUnlockLesson = {
	id: "1.9",
	lessonKey: "ceo-skills",
	displayLabel: "1.9",
	routeSegment: "ceo-skills",
	slug: "01-09-ceo-skills",
	order: 1.9,
	block: "CEO",
	title: "CEO Skills",
	shortTitle: "Skills",
	shell: "split",
	workbench: "brief_assembler",
	artifact: {
		key: "product_brief",
		label: "Product brief",
		type: "brief",
		required: true,
	},
	coachMode: "docked",
	objectiveTitle: "Assemble the product brief",
	checklist: [],
	winCondition: "Brief is assembled.",
	panelDefaults: {
		coach: "docked",
		transcript: "collapsed",
		examples: "collapsed",
		resources: "collapsed",
	},
	content: {
		status: "ready",
		intro: "",
		lessonMeta: {
			runtimeLabel: "10 min",
			goal: "",
			purpose: "",
		},
		actionCard: {
			jobNow: "",
			timebox: "",
			comeBackWith: "",
		},
		coach: {},
		workbench: {},
	},
	briefAssembler: {
		variant: "stage_unlock",
		preset: "ceo",
		heroEyebrow: "Ready",
		heroTitle: "Ready for Design",
		heroBody: "Carry the brief into Design.",
		nextStepLabel: "2.1",
		skills: [],
	},
} satisfies LessonConfig;

describe("stage unlock summary", () => {
	it("routes CEO repair actions through canonical lesson keys", () => {
		const summary = buildStageUnlockSummary(ceoStageUnlockLesson, [
			{
				artifactKey: "user_statement",
				artifactLabel: "User",
				artifactType: "brief",
				lessonId: "1.4",
				lessonTitle: "Pick One User",
				fieldValues: {
					selected_problem_owner: "Independent coach",
					selected_problem_statement: "Loses clients to inconsistent follow-up",
					problem_when: "After discovery calls",
				},
				fields: [],
			},
			{
				artifactKey: "outcome_statement",
				artifactLabel: "Outcome",
				artifactType: "brief",
				lessonId: "1.5",
				lessonTitle: "Define the Outcome",
				fieldValues: {
					messaging_person: "Independent coach",
					messaging_problem: "Follow-up dies after the call",
					messaging_what_it_does: "Creates the next touchpoint",
					messaging_benefit: "Keeps leads moving",
					outcome_statement_body:
						"Help coaches book the next step before momentum dies.",
				},
				fields: [],
			},
			{
				artifactKey: "research_notes",
				artifactLabel: "Research",
				artifactType: "mixed",
				lessonId: "1.6",
				lessonTitle: "Light Research",
				fieldValues: {
					research_table: [["Manual follow-up", "Leads go cold"]],
				},
				fields: [],
			},
			{
				artifactKey: "core_flow_image",
				artifactLabel: "Core flow",
				artifactType: "image",
				lessonId: "2.1",
				lessonTitle: "Map the Core Flow",
				fieldValues: {
					__core_flow_image_upload: {
						kind: "upload",
						url: "https://example.com/flow.png",
					},
				},
				fields: [],
			},
			{
				artifactKey: "scope_boundary",
				artifactLabel: "Scope",
				artifactType: "brief",
				lessonId: "2.1",
				lessonTitle: "Map the Core Flow",
				fieldValues: {
					in_scope: ["Capture lead", "Send next-step follow-up"],
					out_of_scope: ["CRM sync"],
					v1_rationale: "Keep the first shipped path tight.",
				},
				fields: [],
			},
		]);

		expect(summary).toBeTruthy();
		if (!summary) {
			throw new Error("Expected CEO stage unlock summary.");
		}

		const sectionActionHrefs = Object.fromEntries(
			summary.sections.map((section) => [section.label, section.action?.href]),
		);

		expect(sectionActionHrefs["Who Design Is For"]).toBe(
			getLessonHref("pick-one-user"),
		);
		expect(sectionActionHrefs["Outcome to Deliver"]).toBe(
			getLessonHref("define-the-outcome"),
		);
		expect(sectionActionHrefs["Evidence to Preserve"]).toBe(
			getLessonHref("light-research-not-a-thesis"),
		);
		expect(sectionActionHrefs["Core Flow to Keep"]).toBe(
			getLessonHref("map-the-core-flow"),
		);
		expect(sectionActionHrefs["What Not to Design Yet"]).toBe(
			getLessonHref("map-the-core-flow"),
		);
	});
});
