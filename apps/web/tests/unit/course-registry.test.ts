import {
  getCompletionIssues,
  getLessonById,
  getObjectiveTasks,
  getStudentFacingLessons,
  getUnlockedBlockIds,
  getUnlockedLessonIds,
  lessonRegistry,
} from "@/features/course/lesson/model";

const studentFacingIds = [
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  "1.6",
  "1.8",
  "1.9",
  "2.0",
  "2.1",
  "2.2",
  "3.0",
  "3.1",
  "3.2",
  "3.3",
  "3.4",
  "3.5",
  "3.6",
  "3.7",
  "3.8",
  "3.9",
  "3.10",
  "3.11",
  "3.12",
  "3.13",
  "3.14",
  "3.15",
  "3.16",
  "4.0",
];

describe("course registry", () => {
  it("keeps mission and welcome available before progress exists", () => {
    expect(getUnlockedLessonIds([])).toEqual(["1.1"]);
  });

  it("unlocks the Bunny-driven sequence at the handoff lessons", () => {
    expect(getUnlockedLessonIds(["1.1"])).toContain("1.2");
    expect(getUnlockedLessonIds(["1.1", "1.2"])).toContain("1.3");
    expect(getUnlockedLessonIds(["1.1", "1.2", "1.9"])).toContain("2.0");
    expect(getUnlockedLessonIds(["1.1", "1.2", "1.9", "2.2"])).toContain("3.0");
    expect(
      getUnlockedLessonIds(["1.1", "1.2", "1.9", "2.2", "3.16"]),
    ).toContain("4.0");
  });

  it("unlocks blocks at the new Bunny handoff points", () => {
    expect(getUnlockedBlockIds([])).toEqual(["CEO"]);
    expect(getUnlockedBlockIds(["1.9"])).toEqual(["CEO", "DESIGN"]);
    expect(getUnlockedBlockIds(["1.9", "2.2"])).toEqual([
      "CEO",
      "DESIGN",
      "BUILD",
    ]);
    expect(getUnlockedBlockIds(["1.9", "2.2", "3.16"])).toEqual([
      "CEO",
      "DESIGN",
      "BUILD",
      "SHIP",
    ]);
  });

  it("keeps the student-facing lesson sequence aligned with the Bunny-first map", () => {
    expect(getStudentFacingLessons().map((lesson) => lesson.id)).toEqual(
      studentFacingIds,
    );
    expect(lessonRegistry.length).toBe(29);
    expect(getLessonById("4.0")?.title).toBe("Product Review");
    expect(getLessonById("1.0")).toBeNull();
    expect(getLessonById("4.6")).toBeNull();
  });

  it("keeps Build as the 17-video sequence from 3.0 through 3.16", () => {
    const buildLessons = getStudentFacingLessons().filter(
      (lesson) => lesson.block === "BUILD",
    );

    expect(buildLessons.map((lesson) => lesson.id)).toEqual([
      "3.0",
      "3.1",
      "3.2",
      "3.3",
      "3.4",
      "3.5",
      "3.6",
      "3.7",
      "3.8",
      "3.9",
      "3.10",
      "3.11",
      "3.12",
      "3.13",
      "3.14",
      "3.15",
      "3.16",
    ]);
    expect(buildLessons.at(-1)?.nextLessonId).toBe("4.0");
  });

  it("hydrates the live Bunny media onto welcome and representative video lessons", () => {
    const welcomeLesson = getLessonById("1.1");
    expect(welcomeLesson).toBeTruthy();
    if (!welcomeLesson) {
      throw new Error("Expected lesson 1.1 to exist.");
    }
    expect(welcomeLesson.shell).toBe("split");
    expect(welcomeLesson.coachVideoPlacement).toBe("workbench");
    expect(welcomeLesson.content.coach.video).toMatchObject({
      status: "ready",
      provider: "bunny",
      libraryId: 619172,
      title: "Welcome",
    });

    const startWithProblem = getLessonById("1.3");
    expect(startWithProblem).toBeTruthy();
    if (!startWithProblem) {
      throw new Error("Expected lesson 1.3 to exist.");
    }
    expect(startWithProblem.shell).toBe("split");
    expect(startWithProblem.content.coach.video).toMatchObject({
      status: "ready",
      provider: "bunny",
      libraryId: 619172,
      videoId: "b0173058-5cf9-4a93-b865-8bb6e48fd5f7",
      title: "Start With the Problem",
    });

    const pickOneUser = getLessonById("1.4");
    expect(pickOneUser).toBeTruthy();
    if (!pickOneUser) {
      throw new Error("Expected lesson 1.4 to exist.");
    }
    expect(pickOneUser.shell).toBe("split");
    expect(pickOneUser.content.coach.video).toMatchObject({
      status: "ready",
      provider: "bunny",
      libraryId: 619172,
      videoId: "59276fe3-0832-455b-8223-2a2974028be8",
      title: "Pick One User",
    });

    const defineOutcome = getLessonById("1.5");
    expect(defineOutcome).toBeTruthy();
    if (!defineOutcome) {
      throw new Error("Expected lesson 1.5 to exist.");
    }
    expect(defineOutcome.shell).toBe("split");
    expect(defineOutcome.workbench).toBe("guided_form");
    expect(defineOutcome.artifact.key).toBe("outcome_statement");
    expect(defineOutcome.fieldShapeVersion).toBe(2);
    expect((defineOutcome.workbenchFields ?? []).map((f) => f.id)).toEqual([
      "messaging_person",
      "messaging_problem",
      "messaging_what_it_does",
      "messaging_benefit",
      "outcome_statement_body",
      "outcome_self_review",
    ]);
    expect(defineOutcome.requireReadyVideoForCompletion).toBe(true);
    expect(defineOutcome.content.coach.video).toMatchObject({
      status: "ready",
      provider: "bunny",
      libraryId: 619172,
      videoId: "59276fe3-0832-455b-8223-2a2974028be8",
      title: "Define the Outcome",
    });
    const outcomeTasks = getObjectiveTasks(defineOutcome, {});
    expect(outcomeTasks.map((t) => t.id).sort()).toEqual(
      [
        "__coach_video_ready",
        "messaging_benefit",
        "messaging_person",
        "messaging_problem",
        "messaging_what_it_does",
        "outcome_statement_body",
      ].sort(),
    );
    expect(
      getCompletionIssues(defineOutcome, {})
        .map((i) => i.id)
        .sort(),
    ).toEqual(
      [
        "messaging_benefit",
        "messaging_person",
        "messaging_problem",
        "messaging_what_it_does",
        "outcome_statement_body",
      ].sort(),
    );

    expect(getLessonById("1.6")?.pinnedArtifacts).toEqual([
      "user_statement",
      "outcome_statement",
    ]);

    const lightResearch = getLessonById("1.6");
    expect(lightResearch).toBeTruthy();
    if (!lightResearch) {
      throw new Error("Expected lesson 1.6 to exist.");
    }
    expect(lightResearch.workbench).toBe("competitor_research_light");
    expect(lightResearch.artifact.key).toBe("competitor_research_snapshot");
    expect(lightResearch.artifact.type).toBe("mixed");
    expect(lightResearch.fieldShapeVersion).toBe(2);
    expect((lightResearch.workbenchFields ?? []).map((f) => f.id)).toEqual([
      "research_known_competitors",
      "research_problem_patterns",
      "research_pricing_notes",
      "research_messaging_notes",
      "research_product_notes",
      "research_flow_checklist",
      "research_things_tried",
      "research_directional_takeaway",
    ]);
    const lightResearchIssues = getCompletionIssues(lightResearch, {}).map(
      (i) => i.id,
    );
    expect(new Set(lightResearchIssues)).toEqual(
      new Set([
        "research_flow_checklist",
        "research_known_competitors",
        "research_directional_takeaway",
      ]),
    );
    expect(
      lightResearchIssues.filter((id) => id === "research_flow_checklist")
        .length,
    ).toBe(5);

    const coreFlow = getLessonById("2.1");
    expect(coreFlow).toBeTruthy();
    if (!coreFlow) {
      throw new Error("Expected lesson 2.1 to exist.");
    }
    expect(coreFlow.pinnedArtifacts).toEqual([
      "user_statement",
      "outcome_statement",
    ]);
    expect(coreFlow.workbench).toBe("core_flow_sketch");
    expect(coreFlow.artifact.key).toBe("core_flow_sketch_state");
    expect(coreFlow.artifact.type).toBe("mixed");
    expect(coreFlow.promptImport).toBeUndefined();
    expect((coreFlow.workbenchFields ?? []).map((field) => field.id)).toEqual(
      expect.arrayContaining([
        "core_problem",
        "core_audience",
        "core_execution_checklist",
        "core_named_screens",
        "core_brand_path",
      ]),
    );
    expect(
      getObjectiveTasks(coreFlow, {})
        .map((task) => task.id)
        .sort(),
    ).toEqual(
      [
        "__coach_video_ready",
        "core_audience",
        "core_brand_path",
        "core_desired_outcome",
        "core_execution_checklist:Pick one idea",
        "core_execution_checklist:Redraw the best flow left to right",
        "core_execution_checklist:Sketch 8 ideas (Crazy Eights)",
        "core_execution_checklist:Start 2-minute timer",
        "core_must_have_features",
        "core_named_screens",
        "core_problem",
        "core_transformation",
      ].sort(),
    );
    expect(
      getCompletionIssues(coreFlow, {})
        .map((issue) => issue.id)
        .sort(),
    ).toEqual(
      [
        "core_audience",
        "core_brand_path",
        "core_desired_outcome",
        "core_execution_checklist",
        "core_execution_checklist",
        "core_execution_checklist",
        "core_execution_checklist",
        "core_must_have_features",
        "core_named_screens",
        "core_problem",
        "core_transformation",
      ].sort(),
    );
    const execAll = [
      { label: "Start 2-minute timer", checked: true },
      { label: "Sketch 8 ideas (Crazy Eights)", checked: true },
      { label: "Pick one idea", checked: true },
      { label: "Redraw the best flow left to right", checked: true },
    ];
    const filledCoreIssues = getCompletionIssues(coreFlow, {
      core_problem: "Parents need faster meal planning.",
      core_audience: "Busy parents",
      core_transformation: "Less Sunday stress",
      core_desired_outcome: "A week of meals planned",
      core_must_have_features: "Ideas, brand tweak, export",
      core_named_screens: "Connect GPT → Ideas for Posts",
      core_brand_path: "I already have a Figma or Canva brand file",
      core_execution_checklist: execAll,
    }).map((issue) => issue.id);
    expect(
      filledCoreIssues.filter((id) => id !== "__coach_video_ready"),
    ).toEqual([]);

    const badChecklistIssues = getCompletionIssues(coreFlow, {
      core_problem: "Ok",
      core_audience: "Ok",
      core_transformation: "Ok",
      core_desired_outcome: "Ok",
      core_must_have_features: "Ok",
      core_named_screens: "Ok",
      core_brand_path: "I already have a Figma or Canva brand file",
      core_execution_checklist: execAll.map((item, i) => ({
        ...item,
        checked: i !== 0,
      })),
    }).map((issue) => issue.id);
    expect(badChecklistIssues).toContain("core_execution_checklist");
    expect(
      badChecklistIssues.filter(
        (id) =>
          id !== "__coach_video_ready" && id !== "core_execution_checklist",
      ),
    ).toEqual([]);

    const ceoSkills = getLessonById("1.9");
    expect(ceoSkills).toBeTruthy();
    if (!ceoSkills) {
      throw new Error("Expected lesson 1.9 to exist.");
    }
    expect(ceoSkills.artifact.key).toBe("ceo_skills_setup");
    expect(ceoSkills.artifact.type).toBe("mixed");
    expect((ceoSkills.workbenchFields ?? []).map((f) => f.id)).toEqual([
      "ceo_skills_setup_checklist",
      "codex_project_folder_name",
      "ceo_skills_building_and_problem",
      "ceo_skills_workflow_stage",
    ]);
    expect(getCompletionIssues(ceoSkills, {}).length).toBeGreaterThan(0);
    expect(
      getCompletionIssues(ceoSkills, {
        ceo_skills_setup_checklist: [
          { label: "Created or added a project", checked: true },
          { label: "Started a thread", checked: true },
          { label: "Downloaded or linked skills", checked: true },
          { label: "Picked a first skill to try", checked: true },
        ],
        codex_project_folder_name: "team-wiki",
        ceo_skills_building_and_problem:
          "Internal wiki so ops stops losing playbooks.",
      }),
    ).toEqual([]);

    const repoMapLesson = getLessonById("3.2");
    expect(repoMapLesson).toBeTruthy();
    if (!repoMapLesson) {
      throw new Error("Expected lesson 3.2 to exist.");
    }
    expect(repoMapLesson.workbench).toBe("repo_map_orientation");
    expect((repoMapLesson.workbenchFields ?? []).map((f) => f.id)).toEqual([]);
    expect(
      (repoMapLesson.content.coach.resources ?? []).map((r) => r.id),
    ).toEqual(["repo_map_tool_overview_video", "repo_map_setup_guide"]);

    const deployHandoffLesson = getLessonById("3.14");
    expect(deployHandoffLesson).toBeTruthy();
    if (!deployHandoffLesson) {
      throw new Error("Expected lesson 3.14 to exist.");
    }
    expect(deployHandoffLesson.workbench).toBe("production_deploy_handoff");
    expect(
      (deployHandoffLesson.workbenchFields ?? []).map((f) => f.id),
    ).toEqual([
      "deploy_handoff_steps",
      "deploy_handoff_product_name",
      "deploy_handoff_domain",
      "deploy_handoff_success_checks",
    ]);
    expect(getCompletionIssues(deployHandoffLesson, {}).length).toBeGreaterThan(
      0,
    );
    const stepOptions =
      deployHandoffLesson.workbenchFields?.find(
        (field) => field.id === "deploy_handoff_steps",
      )?.options ?? [];
    expect(
      getCompletionIssues(deployHandoffLesson, {
        deploy_handoff_steps: stepOptions.map((label) => ({
          label,
          checked: true,
        })),
        deploy_handoff_product_name: "Acme",
        deploy_handoff_domain: "acme.com",
      }),
    ).toEqual([]);

    const codexMarketingLesson = getLessonById("3.5");
    expect(codexMarketingLesson).toBeTruthy();
    if (!codexMarketingLesson) {
      throw new Error("Expected lesson 3.5 to exist.");
    }
    expect(codexMarketingLesson.workbench).toBe("codex_marketing_site");
    expect(codexMarketingLesson.artifact.key).toBe(
      "codex_marketing_site_workspace",
    );
    expect(codexMarketingLesson.pinnedArtifacts).toEqual([
      "core_flow_sketch_state",
      "outcome_statement",
      "user_statement",
    ]);
    expect(
      (codexMarketingLesson.workbenchFields ?? []).map((f) => f.id),
    ).toEqual([
      "codex_marketing_saved_prompt",
      "codex_marketing_product",
      "codex_marketing_audience",
      "codex_marketing_problem",
      "codex_marketing_pain",
      "codex_marketing_frequency",
      "codex_marketing_why_matters",
      "codex_marketing_outcome",
      "codex_marketing_capability",
      "codex_marketing_copy_eyebrow",
      "codex_marketing_copy_subheader",
      "codex_marketing_copy_primary_cta",
      "codex_marketing_copy_secondary_cta",
      "codex_marketing_copy_promise",
      "codex_marketing_copy_highlights",
      "codex_marketing_copy_faq",
      "codex_marketing_style_reference_url",
      "codex_marketing_workflow",
    ]);
    expect(
      getCompletionIssues(codexMarketingLesson, {}).length,
    ).toBeGreaterThan(0);
    const marketingWorkflowOptions =
      codexMarketingLesson.workbenchFields?.find(
        (field) => field.id === "codex_marketing_workflow",
      )?.options ?? [];
    expect(
      getCompletionIssues(codexMarketingLesson, {
        codex_marketing_saved_prompt: "Reusable prompt body",
        codex_marketing_product: "Acme Plugin",
        codex_marketing_audience: "Designers",
        codex_marketing_problem: "Slow handoff",
        codex_marketing_pain: "Wasted hours",
        codex_marketing_frequency: "Every sprint",
        codex_marketing_why_matters: "Ship faster",
        codex_marketing_outcome: "Synced files",
        codex_marketing_capability: "One-click sync",
        codex_marketing_copy_eyebrow: "New",
        codex_marketing_copy_subheader: "Ship handoffs",
        codex_marketing_copy_primary_cta: "Install",
        codex_marketing_copy_secondary_cta: "Watch demo",
        codex_marketing_copy_promise: "Fewer meetings",
        codex_marketing_copy_highlights: "- Fast\n- Simple",
        codex_marketing_copy_faq: "Q: …",
        codex_marketing_workflow: marketingWorkflowOptions.map((label) => ({
          label,
          checked: true,
        })),
      }),
    ).toEqual([]);

    for (const lessonId of ["2.0", "4.0"]) {
      const lesson = getLessonById(lessonId);
      expect(lesson).toBeTruthy();
      if (!lesson) {
        throw new Error(`Expected lesson ${lessonId} to exist.`);
      }
      expect(lesson.shell).toBe("split");
      expect(lesson.workbench).toBe("guided_form");
      expect(lesson.workbenchFields ?? []).toEqual([]);
      expect(lesson.requireReadyVideoForCompletion).toBe(true);
      expect(lesson.content.coach.video).toMatchObject({
        status: "ready",
        provider: "bunny",
        libraryId: 619172,
      });
      expect(getObjectiveTasks(lesson, {})).toEqual([
        expect.objectContaining({
          id: "__coach_video_ready",
          label: "Lesson video is attached and ready",
          status: "complete",
        }),
      ]);
      expect(getCompletionIssues(lesson, {})).toEqual([]);
    }

    const skillsHandoff = getLessonById("3.16");
    expect(skillsHandoff).toBeTruthy();
    if (!skillsHandoff) {
      throw new Error("Expected lesson 3.16 to exist.");
    }
    expect(skillsHandoff.shell).toBe("split");
    expect(skillsHandoff.workbench).toBe("skills_quickstart");
    expect((skillsHandoff.workbenchFields ?? []).length).toBe(2);
    expect(skillsHandoff.requireReadyVideoForCompletion).toBe(true);
    expect(skillsHandoff.content.coach.video).toMatchObject({
      status: "ready",
      provider: "bunny",
      libraryId: 619172,
    });
    expect(getCompletionIssues(skillsHandoff, {}).length).toBeGreaterThan(0);

    const buildKickoff = getLessonById("3.0");
    expect(buildKickoff).toBeTruthy();
    if (!buildKickoff) {
      throw new Error("Expected lesson 3.0 to exist.");
    }
    expect(buildKickoff.shell).toBe("split");
    expect(buildKickoff.workbench).toBe("build_setup_launchpad");
    expect(
      (buildKickoff.workbenchFields ?? []).map((field) => field.id),
    ).toEqual(["build_product_folder_name", "build_setup_prereqs"]);
    expect(buildKickoff.requireReadyVideoForCompletion).toBe(true);
    expect(buildKickoff.content.coach.video).toMatchObject({
      status: "ready",
      provider: "bunny",
      libraryId: 619172,
    });
    expect(getCompletionIssues(buildKickoff, {}).length).toBeGreaterThan(0);
    const setupOptions =
      buildKickoff.workbenchFields?.find(
        (field) => field.id === "build_setup_prereqs",
      )?.options ?? [];
    expect(
      getCompletionIssues(buildKickoff, {
        build_product_folder_name: "my-app",
        build_setup_prereqs: setupOptions.map((label) => ({
          label,
          checked: true,
        })),
      }),
    ).toEqual([]);
  });
});
