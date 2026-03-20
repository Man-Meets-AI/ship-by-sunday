import {
  getAvailableLayoutModesForLesson,
  getCompletionIssues,
  getDefaultLayoutModeForLesson,
  getLessonById,
  getObjectiveTasks,
  getStudentFacingLessons,
  lessonSupportsLayoutToggle,
  normalizeLayoutModeForLesson,
} from "@/features/course/lesson/model";
import {
  BUILD_SLICES_FIELD_IDS,
  BUILD_SLICES_REVIEW_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/build-setting-up-slices/build-setting-up-slices-constants";
import {
  BUILD_PHASE_CHECKLIST_OPTIONS,
  BUILD_SHIP_ROADMAP_FIELD_IDS,
  SERVICE_ACCOUNT_CHECKLIST_OPTIONS,
  SHIP_PHASE_CHECKLIST_OPTIONS,
  SCOPE_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/build-ship-roadmap/build-ship-roadmap-constants";
import {
  BUILD_SKILLS_FIRST_TAGGED_PROMPT_FIELD_ID,
  BUILD_SKILLS_USAGE_CHECKLIST_FIELD_ID,
  SKILLS_USAGE_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/skills-quickstart/skills-quickstart-constants";

describe("split lesson baseline (former watch cohort)", () => {
  it("keeps Bunny-driven lessons in focus-only split layout with workbench video", () => {
    const splitVideoLessons = getStudentFacingLessons();

    expect(splitVideoLessons.length).toBeGreaterThan(20);

    for (const lesson of splitVideoLessons) {
      expect(lesson.shell).toBe("split");
      expect(lesson.coachVideoPlacement).toBe("workbench");
      expect(lesson.workbenchMediaLayout).toBe("split");
      expect(getAvailableLayoutModesForLesson(lesson)).toEqual(["focus"]);
      expect(getDefaultLayoutModeForLesson(lesson)).toBe("focus");
      expect(lessonSupportsLayoutToggle(lesson)).toBe(false);
      expect(normalizeLayoutModeForLesson(lesson, "split")).toBe("focus");
    }
  });

  it("treats fieldless video lessons as video-complete steps with no required in-product fields", () => {
    for (const lessonId of ["2.0", "4.0"]) {
      const lesson = getLessonById(lessonId);
      expect(lesson).toBeTruthy();
      if (!lesson) {
        throw new Error(`Expected lesson ${lessonId} to exist.`);
      }

      expect(lesson.workbenchFields ?? []).toEqual([]);
      expect(getObjectiveTasks(lesson, {})).toEqual([
        expect.objectContaining({
          id: "__coach_video_ready",
          label: "Lesson video is attached and ready",
          status: "complete",
        }),
      ]);
      expect(getCompletionIssues(lesson, {})).toEqual([]);
    }
  });

  it("gates Build 3.4 build + ship roadmap on required checklists and launch fields", () => {
    const lesson = getLessonById("3.4");
    expect(lesson).toBeTruthy();
    if (!lesson) {
      throw new Error("Expected lesson 3.4 to exist.");
    }

    expect(lesson.workbench).toBe("build_ship_roadmap");
    expect((lesson.workbenchFields ?? []).map((field) => field.id)).toEqual([
      BUILD_SHIP_ROADMAP_FIELD_IDS.buildPhaseChecklist,
      BUILD_SHIP_ROADMAP_FIELD_IDS.shipPhaseChecklist,
      BUILD_SHIP_ROADMAP_FIELD_IDS.serviceAccountsChecklist,
      BUILD_SHIP_ROADMAP_FIELD_IDS.scopeChecklist,
      BUILD_SHIP_ROADMAP_FIELD_IDS.marketingBrief,
      BUILD_SHIP_ROADMAP_FIELD_IDS.preferredDomain,
      BUILD_SHIP_ROADMAP_FIELD_IDS.supportEmail,
      BUILD_SHIP_ROADMAP_FIELD_IDS.loggingPlan,
      BUILD_SHIP_ROADMAP_FIELD_IDS.firstTesters,
    ]);

    expect(getCompletionIssues(lesson, {}).length).toBeGreaterThan(0);

    const checked = (options: readonly string[]) =>
      options.map((label) => ({ label, checked: true }));

    expect(
      getCompletionIssues(lesson, {
        [BUILD_SHIP_ROADMAP_FIELD_IDS.buildPhaseChecklist]: checked(
          BUILD_PHASE_CHECKLIST_OPTIONS,
        ),
        [BUILD_SHIP_ROADMAP_FIELD_IDS.shipPhaseChecklist]: checked(
          SHIP_PHASE_CHECKLIST_OPTIONS,
        ),
        [BUILD_SHIP_ROADMAP_FIELD_IDS.serviceAccountsChecklist]: checked(
          SERVICE_ACCOUNT_CHECKLIST_OPTIONS,
        ),
        [BUILD_SHIP_ROADMAP_FIELD_IDS.scopeChecklist]: checked(
          SCOPE_CHECKLIST_OPTIONS,
        ),
        [BUILD_SHIP_ROADMAP_FIELD_IDS.marketingBrief]:
          "Who: founders\nMoment: blank page\nPromise: Ship by Sunday",
        [BUILD_SHIP_ROADMAP_FIELD_IDS.preferredDomain]: "example.com",
        [BUILD_SHIP_ROADMAP_FIELD_IDS.supportEmail]: "support@example.com",
        [BUILD_SHIP_ROADMAP_FIELD_IDS.loggingPlan]: "Vercel runtime logs",
        [BUILD_SHIP_ROADMAP_FIELD_IDS.firstTesters]: "Friend A, Friend B",
      }),
    ).toEqual([]);
  });

  it("gates Build 3.8 slice planning on required fields and checklist", () => {
    const lesson = getLessonById("3.8");
    expect(lesson).toBeTruthy();
    if (!lesson) {
      throw new Error("Expected lesson 3.8 to exist.");
    }

    expect(lesson.workbench).toBe("build_setting_up_slices");
    expect((lesson.workbenchFields ?? []).map((field) => field.id)).toEqual([
      BUILD_SLICES_FIELD_IDS.planningPath,
      BUILD_SLICES_FIELD_IDS.coreUxOrPrompt,
      BUILD_SLICES_FIELD_IDS.referenceLink,
      BUILD_SLICES_FIELD_IDS.packet,
      BUILD_SLICES_FIELD_IDS.selectedSlice,
      BUILD_SLICES_FIELD_IDS.reviewChecklist,
      BUILD_SLICES_FIELD_IDS.userFlowSketch,
    ]);

    expect(getCompletionIssues(lesson, {}).length).toBeGreaterThan(0);

    const reviewDone = BUILD_SLICES_REVIEW_CHECKLIST_OPTIONS.map((label) => ({
      label,
      checked: true,
    }));

    expect(
      getCompletionIssues(lesson, {
        [BUILD_SLICES_FIELD_IDS.planningPath]: "plan_skill",
        [BUILD_SLICES_FIELD_IDS.coreUxOrPrompt]:
          "User lands, connects account, runs first action.",
        [BUILD_SLICES_FIELD_IDS.packet]: "- Slice A\n- Slice B",
        [BUILD_SLICES_FIELD_IDS.selectedSlice]:
          "Slice A: wire the empty state CTA",
        [BUILD_SLICES_FIELD_IDS.reviewChecklist]: reviewDone,
      }),
    ).toEqual([]);
  });

  it("gates Build kickoff (3.0) on the setup checklist while keeping video ready", () => {
    const lesson = getLessonById("3.0");
    expect(lesson).toBeTruthy();
    if (!lesson) {
      throw new Error("Expected lesson 3.0 to exist.");
    }

    expect(lesson.workbench).toBe("build_setup_launchpad");
    expect((lesson.workbenchFields ?? []).map((field) => field.id)).toEqual([
      "build_product_folder_name",
      "build_setup_prereqs",
    ]);

    const prereqField = lesson.workbenchFields?.find(
      (field) => field.id === "build_setup_prereqs",
    );
    const options = prereqField?.options ?? [];
    expect(options).toHaveLength(9);

    expect(getCompletionIssues(lesson, {}).length).toBeGreaterThan(0);

    const allChecked = options.map((label) => ({ label, checked: true }));
    expect(
      getCompletionIssues(lesson, {
        build_product_folder_name: "my-app",
        build_setup_prereqs: allChecked,
      }),
    ).toEqual([]);
  });

  it("gates Build 3.16 skills quickstart on checklist and tagged prompt", () => {
    const lesson = getLessonById("3.16");
    expect(lesson).toBeTruthy();
    if (!lesson) {
      throw new Error("Expected lesson 3.16 to exist.");
    }

    expect(lesson.workbench).toBe("skills_quickstart");
    expect((lesson.workbenchFields ?? []).map((field) => field.id)).toEqual([
      BUILD_SKILLS_USAGE_CHECKLIST_FIELD_ID,
      BUILD_SKILLS_FIRST_TAGGED_PROMPT_FIELD_ID,
    ]);

    expect(getCompletionIssues(lesson, {}).length).toBeGreaterThan(0);

    const usageDone = SKILLS_USAGE_CHECKLIST_OPTIONS.map((label) => ({
      label,
      checked: true,
    }));

    expect(
      getCompletionIssues(lesson, {
        [BUILD_SKILLS_USAGE_CHECKLIST_FIELD_ID]: usageDone,
        [BUILD_SKILLS_FIRST_TAGGED_PROMPT_FIELD_ID]:
          "$clerk-setup\nWire magic link sign-in for Next.js.",
      }),
    ).toEqual([]);
  });

  it("keeps no student-facing watch shells", () => {
    expect(
      getStudentFacingLessons().filter((l) => l.shell === "watch"),
    ).toHaveLength(0);
  });
});
