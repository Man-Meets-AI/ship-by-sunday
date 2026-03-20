import type { ArtifactType, LessonConfig, UploadFieldValue } from "./contracts";
import { CORE_FLOW_IMAGE_FIELD_ID } from "./core-flow";
import { getFilledTableRows } from "./table";

const LEGACY_SCOPE_STORYBOARD_SLOTS = 12;

function getLegacyScopeStoryboardStepTitlesForPreview(
  fieldValues: Record<string, unknown>,
  limit = 4,
): string[] {
  const titles: string[] = [];
  for (let step = 1; step <= LEGACY_SCOPE_STORYBOARD_SLOTS; step += 1) {
    const key = String(step).padStart(2, "0");
    const title = fieldValues[`sb_${key}_title`];
    if (typeof title === "string" && title.trim().length > 0) {
      titles.push(title.trim());
    }
    if (titles.length >= limit) {
      break;
    }
  }
  return titles;
}

type StageUnlockPreview = {
  artifactKey: string;
  artifactLabel: string;
  contextTitle?: string;
  artifactType: ArtifactType;
  lessonId: string;
  lessonTitle: string;
  fieldValues: Record<string, unknown>;
  fields: Array<[string, unknown]>;
};

type StageUnlockPinnedArtifact = StageUnlockPreview;

export type StageUnlockStat = {
  label: string;
  value: string;
};

export type StageUnlockSectionAction = {
  label: string;
  href: string;
};

export type StageUnlockSection = {
  label: string;
  value: string;
  imageUrl?: string | null;
  galleryImageUrls?: string[];
  action?: StageUnlockSectionAction;
};

export type StageUnlockTask = {
  id: string;
  label: string;
  status: "complete" | "incomplete";
};

export type StageUnlockBridge = {
  eyebrow: string;
  title: string;
  body: string;
  highlights: string[];
};

export type StageUnlockSummary = {
  preview: StageUnlockPreview;
  stats: StageUnlockStat[];
  sectionHeading: string;
  sections: StageUnlockSection[];
  tasks: StageUnlockTask[];
  bridge?: StageUnlockBridge;
};

function getPinnedArtifactByKey(
  pinnedArtifacts: StageUnlockPinnedArtifact[],
  artifactKey: string,
) {
  return pinnedArtifacts.find(
    (artifact) => artifact.artifactKey === artifactKey,
  );
}

function isUploadFieldValue(value: unknown): value is UploadFieldValue {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "kind" in value &&
    (value as { kind?: string }).kind === "upload"
  );
}

function isUploadFieldValueArray(value: unknown): value is UploadFieldValue[] {
  return (
    Array.isArray(value) && value.every((item) => isUploadFieldValue(item))
  );
}

function getFieldString(
  artifact: StageUnlockPinnedArtifact | undefined,
  fieldId: string,
) {
  const value = artifact?.fieldValues[fieldId];
  return typeof value === "string" ? value.trim() : "";
}

function countFilledLines(value: unknown) {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  ).length;
}

function getCountLabel(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getUploadCount(value: unknown) {
  return isUploadFieldValueArray(value)
    ? value.filter((item) => Boolean(item.storageId || item.url)).length
    : 0;
}

function getUploadUrl(value: unknown) {
  return isUploadFieldValue(value) && typeof value.url === "string"
    ? value.url
    : null;
}

function createPreview(
  lesson: LessonConfig,
  fieldValues: Record<string, unknown>,
  fields: Array<[string, unknown]>,
): StageUnlockPreview {
  return {
    artifactKey: lesson.artifact.key,
    artifactLabel: lesson.artifact.label,
    contextTitle: lesson.artifact.contextTitle,
    artifactType: lesson.artifact.type,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    fieldValues,
    fields,
  };
}

function buildCeoStageUnlockSummary(
  lesson: LessonConfig,
  pinnedArtifacts: StageUnlockPinnedArtifact[],
): StageUnlockSummary {
  const userArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "user_statement",
  );
  const outcomeArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "outcome_statement",
  );
  const researchArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "research_notes",
  );
  const flowArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "core_flow_image",
  );
  const scopeArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "scope_boundary",
  );
  const coreFlowSketchArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "core_flow_sketch_state",
  );

  const researchSignalCount = getFilledTableRows(
    researchArtifact?.fieldValues.research_table,
  ).length;
  const keepItems = getStringList(scopeArtifact?.fieldValues.in_scope);
  const cutItems = getStringList(scopeArtifact?.fieldValues.out_of_scope);
  const primaryKeepItems = keepItems.slice(0, 5);
  const primaryCutItems = cutItems.slice(0, 5);
  const keepCount = countFilledLines(scopeArtifact?.fieldValues.in_scope);
  const cutCount = countFilledLines(scopeArtifact?.fieldValues.out_of_scope);
  const flowImageValue = flowArtifact?.fieldValues[CORE_FLOW_IMAGE_FIELD_ID];
  const flowImageUrl =
    isUploadFieldValue(flowImageValue) && typeof flowImageValue.url === "string"
      ? flowImageValue.url
      : null;

  const who = [
    getFieldString(userArtifact, "selected_problem_owner"),
    getFieldString(userArtifact, "selected_problem_statement")
      ? `Problem: ${getFieldString(userArtifact, "selected_problem_statement")}`
      : "",
    getFieldString(userArtifact, "problem_when")
      ? `When it happens: ${getFieldString(userArtifact, "problem_when")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const outcome = [
    getFieldString(outcomeArtifact, "messaging_person")
      ? `Person: ${getFieldString(outcomeArtifact, "messaging_person")}`
      : "",
    getFieldString(outcomeArtifact, "messaging_problem")
      ? `Problem: ${getFieldString(outcomeArtifact, "messaging_problem")}`
      : "",
    getFieldString(outcomeArtifact, "messaging_what_it_does")
      ? `What it does: ${getFieldString(
          outcomeArtifact,
          "messaging_what_it_does",
        )}`
      : "",
    getFieldString(outcomeArtifact, "messaging_benefit")
      ? `What they get: ${getFieldString(outcomeArtifact, "messaging_benefit")}`
      : "",
    getFieldString(outcomeArtifact, "outcome_statement_body"),
  ]
    .filter(Boolean)
    .join("\n");
  const evidence = [
    researchSignalCount > 0 ? `Signals captured: ${researchSignalCount}` : "",
    getFieldString(researchArtifact, "research_summary")
      ? `Pattern to design around: ${getFieldString(
          researchArtifact,
          "research_summary",
        )}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const coreNamedScreens = getFieldString(
    coreFlowSketchArtifact,
    "core_named_screens",
  );
  const coreMustHaves = getFieldString(
    coreFlowSketchArtifact,
    "core_must_have_features",
  );
  const coreProblemLine = getFieldString(
    coreFlowSketchArtifact,
    "core_problem",
  );

  const screenFlowParts = coreNamedScreens
    ? coreNamedScreens
        .split(/\n|,/)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 12)
    : [];
  const storyboardTitles = scopeArtifact?.fieldValues
    ? getLegacyScopeStoryboardStepTitlesForPreview(
        scopeArtifact.fieldValues as Record<string, unknown>,
        8,
      )
    : [];
  const storyboardLine = screenFlowParts.length
    ? `Screen flow: ${screenFlowParts.join(" → ")}`
    : storyboardTitles.length > 0
      ? `Storyboard beats: ${storyboardTitles.join(" → ")}`
      : "";
  const flow = [
    storyboardLine,
    flowImageUrl
      ? "Use the saved core-flow image as the source of truth for screen sequencing."
      : "",
    getFieldString(userArtifact, "problem_when")
      ? `Start from: ${getFieldString(userArtifact, "problem_when")}`
      : "",
    getFieldString(outcomeArtifact, "outcome_statement_body")
      ? `Design toward: ${getFieldString(
          outcomeArtifact,
          "outcome_statement_body",
        )}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const scope = [
    primaryKeepItems.length > 0
      ? `Keep in v1: ${primaryKeepItems.join(", ")}`
      : "",
    primaryCutItems.length > 0
      ? `Do not design yet: ${primaryCutItems.join(", ")}`
      : "",
    getFieldString(scopeArtifact, "v1_rationale")
      ? `Why this smaller version still wins: ${getFieldString(
          scopeArtifact,
          "v1_rationale",
        )}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const sections = (
    [
      {
        label: "Who Design Is For",
        value: who,
        action: { label: "Edit user", href: "/lesson/1.4" },
      },
      {
        label: "Outcome to Deliver",
        value: outcome,
        action: { label: "Edit outcome", href: "/lesson/1.5" },
      },
      {
        label: "Evidence to Preserve",
        value: evidence,
        action: { label: "Edit evidence", href: "/lesson/1.6" },
      },
      {
        label: "Core Flow to Keep",
        value: flow,
        imageUrl: flowImageUrl,
        action: { label: "Edit flow", href: "/lesson/2.1" },
      },
      {
        label: "What Not to Design Yet",
        value: scope,
        action: { label: "Edit scope", href: "/lesson/2.1" },
      },
    ] as StageUnlockSection[]
  ).filter((section) => section.value.length > 0);
  const hasBrief = sections.length === 5;
  const bridgeHighlights = [
    getFieldString(userArtifact, "selected_problem_owner")
      ? `Design for ${getFieldString(userArtifact, "selected_problem_owner")}`
      : "",
    getFieldString(outcomeArtifact, "outcome_statement_body")
      ? `Optimize for ${getFieldString(
          outcomeArtifact,
          "outcome_statement_body",
        )}`
      : "",
    primaryKeepItems.length > 0
      ? `Stay inside ${primaryKeepItems.join(", ")}`
      : "",
    coreMustHaves
      ? `Flow must-haves: ${coreMustHaves.split("\n").filter(Boolean)[0] ?? coreMustHaves}`
      : "",
  ].filter(Boolean);

  return {
    preview: createPreview(
      lesson,
      {
        who,
        outcome,
        evidence,
        flow,
        scope,
        user_locked_count: who ? 1 : 0,
        outcome_defined_count: outcome ? 1 : 0,
        research_signal_count: researchSignalCount,
        flow_step_count:
          flowImageUrl ||
          screenFlowParts.length > 0 ||
          storyboardTitles.length > 0
            ? 1
            : 0,
        scope_cut_count: cutCount,
        flow_image_url: flowImageUrl,
      },
      sections.map((section) => [section.label, section.value]),
    ),
    stats: [
      {
        label: "User",
        value: who ? "Locked and specific" : "Still undefined",
      },
      {
        label: "Outcome",
        value: outcome ? "Clear win to design for" : "Still undefined",
      },
      {
        label: "Evidence",
        value:
          researchSignalCount > 0
            ? `Grounded in ${getCountLabel(researchSignalCount, "signal")}`
            : "No signals saved",
      },
      {
        label: "Flow",
        value: flowImageUrl ? "Saved and visible" : "Still missing",
      },
      {
        label: "Scope",
        value:
          keepCount > 0 || cutCount > 0
            ? "Constrained for a weekend v1"
            : "Still too loose",
      },
    ],
    sectionHeading: "What Design gets now",
    sections,
    tasks: [
      {
        id: "product-brief:who",
        label: "Lock the user and problem",
        status: who ? "complete" : "incomplete",
      },
      {
        id: "product-brief:outcome",
        label: "Lock the outcome",
        status: outcome ? "complete" : "incomplete",
      },
      {
        id: "product-brief:evidence",
        label: "Bring in real evidence",
        status: evidence ? "complete" : "incomplete",
      },
      {
        id: "product-brief:flow",
        label: "Carry the core flow into Design",
        status: flow ? "complete" : "incomplete",
      },
      {
        id: "product-brief:scope",
        label: "Keep the v1 brutally small",
        status: scope ? "complete" : "incomplete",
      },
      {
        id: "product-brief:assembled",
        label: "Assemble the product brief",
        status: hasBrief ? "complete" : "incomplete",
      },
    ],
    bridge: {
      eyebrow: "Carry this into Design",
      title: "Lock a sketched core flow before references",
      body: "In 2.1, run a fast Crazy Eights pass, capture a builder brief, and name the screens for one flow—rough enough to photograph for Figma Make.",
      highlights: bridgeHighlights,
    },
  };
}

function buildDesignStageUnlockSummary(
  lesson: LessonConfig,
  pinnedArtifacts: StageUnlockPinnedArtifact[],
): StageUnlockSummary {
  const sketchArtifact = getPinnedArtifactByKey(pinnedArtifacts, "sketch_set");
  const storyboardArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "storyboard_image",
  );
  const roughScreensArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "rough_screens",
  );

  const sketchCount = getUploadCount(sketchArtifact?.fieldValues.sketch_upload);
  const storyboardImageUrl = getUploadUrl(
    storyboardArtifact?.fieldValues.storyboard_upload,
  );
  const hasRoughScreens = Boolean(roughScreensArtifact);
  const hasStoryboard = Boolean(storyboardImageUrl);
  const screenPlan = hasRoughScreens
    ? "The 3-5 rough screens are ready, so Build can start from a real screen plan instead of a blank editor."
    : "";
  const flowSequence = hasStoryboard
    ? "The storyboard already sequences the core user path, so the first implemented slice has a clear flow to follow."
    : "";

  const sections = (
    [
      {
        label: "Screen plan",
        value: screenPlan,
      },
      {
        label: "Flow sequence",
        value: flowSequence,
        imageUrl: storyboardImageUrl,
      },
    ] as StageUnlockSection[]
  ).filter((section) => section.value.length > 0);

  const hasSketches = sketchCount > 0;
  const hasDesignSpec = hasSketches && hasStoryboard && hasRoughScreens;

  return {
    preview: createPreview(
      lesson,
      {
        screen_plan: screenPlan,
        flow_sequence: flowSequence,
        sketch_uploaded_count: sketchCount,
        storyboard_locked_count: hasStoryboard ? 1 : 0,
      },
      sections.map((section) => [section.label, section.value]),
    ),
    stats: [
      {
        label: "Sketches",
        value: `${sketchCount} uploaded`,
      },
      {
        label: "Storyboard",
        value: `${hasStoryboard ? 1 : 0} locked`,
      },
    ],
    sectionHeading: "What Build now has",
    sections,
    tasks: [
      {
        id: "design-spec:sketches",
        label: "Carry the sketches into the handoff",
        status: hasSketches ? "complete" : "incomplete",
      },
      {
        id: "design-spec:storyboard",
        label: "Lock the storyboard flow",
        status: hasStoryboard ? "complete" : "incomplete",
      },
      {
        id: "design-spec:rough-screens",
        label: "Carry the rough screens into Build",
        status: hasRoughScreens ? "complete" : "incomplete",
      },
      {
        id: "design-spec:assembled",
        label: "Assemble the design spec",
        status: hasDesignSpec ? "complete" : "incomplete",
      },
    ],
  };
}

function buildBuildStageUnlockSummary(
  lesson: LessonConfig,
  pinnedArtifacts: StageUnlockPinnedArtifact[],
): StageUnlockSummary {
  const kickoffArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "agent_build_brief",
  );
  const localEnvironmentArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "working_local_environment",
  );
  const coreUxArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "core_flow_working_locally",
  );
  const blockerLogArtifact = getPinnedArtifactByKey(
    pinnedArtifacts,
    "blocker_log",
  );

  const kickoffReady = Boolean(kickoffArtifact);
  const kickoffContext = kickoffReady
    ? "Build started from the saved brief, storyboard, and rough screens, so implementation opened from a real handoff instead of another summary step."
    : "";
  const localEnvironment = localEnvironmentArtifact
    ? "The starter or repo is running locally, so Ship starts from a working baseline instead of a setup problem."
    : "";
  const coreUx = coreUxArtifact
    ? "The core path works locally end to end, so Ship starts from a real product flow instead of a partial stub."
    : "";
  const debugPass = blockerLogArtifact
    ? "The core UX made it through a blocker-first debug pass, so Ship can stay focused on the path that matters."
    : "";

  const sections = (
    [
      { label: "Kickoff", value: kickoffContext },
      { label: "Local environment", value: localEnvironment },
      { label: "Core UX", value: coreUx },
      { label: "Stability pass", value: debugPass },
    ] as StageUnlockSection[]
  ).filter((section) => section.value.length > 0);

  const hasBuildSummary =
    kickoffReady &&
    Boolean(localEnvironmentArtifact) &&
    Boolean(coreUxArtifact) &&
    Boolean(blockerLogArtifact);

  return {
    preview: createPreview(
      lesson,
      {
        kickoff_context: kickoffContext,
        local_environment: localEnvironment,
        core_ux: coreUx,
        debug_pass: debugPass,
        kickoff_ready_count: kickoffReady ? 1 : 0,
        local_environment_ready_count: localEnvironmentArtifact ? 1 : 0,
        core_ux_ready_count: coreUxArtifact ? 1 : 0,
        debug_pass_complete_count: blockerLogArtifact ? 1 : 0,
      },
      sections.map((section) => [section.label, section.value]),
    ),
    stats: [
      {
        label: "Kickoff",
        value: `${kickoffReady ? 1 : 0} aligned`,
      },
      {
        label: "Environment",
        value: `${localEnvironmentArtifact ? 1 : 0} ready`,
      },
      {
        label: "Core UX",
        value: `${coreUxArtifact ? 1 : 0} working`,
      },
      {
        label: "Stability",
        value: `${blockerLogArtifact ? 1 : 0} pass complete`,
      },
    ],
    sectionHeading: "What Ship now has",
    sections,
    tasks: [
      {
        id: "build-summary:plan",
        label: "Carry the kickoff context into Ship",
        status: kickoffReady ? "complete" : "incomplete",
      },
      {
        id: "build-summary:environment",
        label: "Carry the local environment into Ship",
        status: localEnvironmentArtifact ? "complete" : "incomplete",
      },
      {
        id: "build-summary:core-ux",
        label: "Carry the working core UX forward",
        status: coreUxArtifact ? "complete" : "incomplete",
      },
      {
        id: "build-summary:debug",
        label: "Bring the stability pass into Ship",
        status: blockerLogArtifact ? "complete" : "incomplete",
      },
      {
        id: "build-summary:assembled",
        label: "Assemble the Build handoff",
        status: hasBuildSummary ? "complete" : "incomplete",
      },
    ],
  };
}

export function buildStageUnlockSummary(
  lesson: LessonConfig,
  pinnedArtifacts: StageUnlockPinnedArtifact[] = [],
) {
  const briefAssembler = lesson.briefAssembler;
  if (lesson.workbench !== "brief_assembler") {
    return null;
  }
  if (briefAssembler?.variant !== "stage_unlock") {
    return null;
  }

  switch (briefAssembler.preset) {
    case "ceo":
      return buildCeoStageUnlockSummary(lesson, pinnedArtifacts);
    case "design":
      return buildDesignStageUnlockSummary(lesson, pinnedArtifacts);
    case "build":
      return buildBuildStageUnlockSummary(lesson, pinnedArtifacts);
    default:
      return null;
  }
}
