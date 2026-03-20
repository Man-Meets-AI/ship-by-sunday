import type {
  LessonConfig,
  ObjectiveTaskDefinition,
  WorkbenchField,
} from "../manifest";
import { isReferenceGalleryValue } from "../reference-gallery";
import { buildStageUnlockSummary } from "../stage-unlock";
import { isLessonVideoReady as isRenderableLessonVideoReady } from "../video";
import { normalizeLessonFieldValues } from "./legacy";
import {
  getObjectiveMode,
  getRequiredFields,
  getWorkbenchSections,
} from "./progression";
import {
  type ArtifactPreview,
  type CompletionIssue,
  type FieldValuesSource,
  isChecklistItemArray,
  isUploadFieldValueArray,
  OBJECTIVE_CHECKLIST_FIELD_ID,
  type ObjectiveTask,
  type WorkbenchSectionState,
} from "./shared";

type ObjectiveTaskContext = {
  pinnedArtifacts?: ArtifactPreview[];
  resolvedArtifactPreview?: ArtifactPreview | null;
};

function normalizeTaskLabel(label: string) {
  return label.replace(/[?.:]$/, "").trim();
}

function getFieldTaskLabel(field: WorkbenchField) {
  return (
    field.taskLabel ??
    field.artifactPreviewLabel ??
    normalizeTaskLabel(field.label)
  );
}

function isLessonVideoReady(lesson: LessonConfig) {
  return isRenderableLessonVideoReady(lesson.content.coach.video);
}

function normalizeLegacyChecklistItems(
  value: unknown,
  definitions: ObjectiveTaskDefinition[],
) {
  if (isChecklistItemArray(value)) {
    return definitions.map((definition) => {
      const existing = value.find((item) => item.label === definition.label);
      return {
        label: definition.label,
        checked: existing?.checked ?? false,
      };
    });
  }

  return definitions.map((definition) => ({
    label: definition.label,
    checked: false,
  }));
}

function getManualObjectiveTaskDefinitions(
  lesson: LessonConfig,
): ObjectiveTaskDefinition[] {
  if (lesson.objectiveTasks && lesson.objectiveTasks.length > 0) {
    return lesson.objectiveTasks;
  }

  return lesson.checklist.map((label) => ({ label }));
}

export function isFilled(value: unknown) {
  if (isReferenceGalleryValue(value)) {
    return value.items.length > 0;
  }

  if (isUploadFieldValueArray(value)) {
    return value.some((item) => Boolean(item.storageId || item.url));
  }

  if (isChecklistItemArray(value)) {
    return value.some((item) => item.checked);
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    if (value.some((item) => Array.isArray(item))) {
      return value.some(
        (item) =>
          Array.isArray(item) &&
          item.some((cell) => String(cell ?? "").trim().length > 0),
      );
    }

    return value.length > 0;
  }

  if (value && typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return false;
}

function getFieldMinimumItems(field: WorkbenchField) {
  return Math.max(field.minItems ?? 1, 1);
}

function countFilledBoardLines(value: unknown) {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  ).length;
}

function getLessonSpecificCompletionMessage(
  lesson: LessonConfig,
  fieldId: string,
) {
  if (lesson.id === "1.4") {
    if (fieldId === "selected_problem_index") {
      return "Choose one of your three candidate problems.";
    }
    if (fieldId === "problem_when") {
      return "Say when this problem tends to show up.";
    }
    if (fieldId === "problem_where") {
      return "Say where or in what situation it happens.";
    }
    if (fieldId === "problem_trigger") {
      return "Name what triggers the pain.";
    }
    if (fieldId === "pain_level") {
      return "Pick how painful this is: Low, Medium, or High.";
    }
    if (fieldId === "pain_why_now") {
      return "Explain why this is worth solving now.";
    }
    if (fieldId === "commitment_readiness") {
      return "Check each readiness item when it is true.";
    }
  }

  if (lesson.id === "1.5") {
    if (fieldId === "messaging_person") {
      return "Name who this outcome is for.";
    }
    if (fieldId === "messaging_problem") {
      return "State the problem they struggle with.";
    }
    if (fieldId === "messaging_what_it_does") {
      return "Say what the product helps them do, in plain language.";
    }
    if (fieldId === "messaging_benefit") {
      return "Name what they get out of it when it works.";
    }
    if (fieldId === "outcome_statement_body") {
      return "Write one outcome statement: who, problem, result, and benefit—not a feature list.";
    }
  }

  if (lesson.id === "2.1") {
    if (fieldId === "core_problem") {
      return "Name the problem this flow removes.";
    }
    if (fieldId === "core_audience") {
      return "Say who this flow is for.";
    }
    if (fieldId === "core_transformation") {
      return "Describe how the user changes after the flow works.";
    }
    if (fieldId === "core_desired_outcome") {
      return "State the outcome they get when it works.";
    }
    if (fieldId === "core_must_have_features") {
      return "List must-haves for this flow only.";
    }
    if (fieldId === "core_execution_checklist") {
      return "Check each execution step when you have actually done it.";
    }
    if (fieldId === "core_named_screens") {
      return "Write your screen list in order for the flow you chose.";
    }
    if (fieldId === "core_brand_path") {
      return "Pick whether you already have brand assets or need a guide first.";
    }
  }

  if (lesson.id === "1.9") {
    if (fieldId === "ceo_skills_setup_checklist") {
      return "Check each setup line after you have done it in Codex.";
    }
    if (fieldId === "codex_project_folder_name") {
      return "Name the project or folder you are using in Codex.";
    }
    if (fieldId === "ceo_skills_building_and_problem") {
      return "Write what you are building and which problem it solves.";
    }
  }

  if (lesson.id === "3.1") {
    if (fieldId === "build_product_iteration_setup_checklist") {
      return "Check every setup line when it is true—including accounts, prompt, saved response, idea, and posts.";
    }
    if (fieldId === "build_product_iteration_brand_strategy") {
      return "Paste or write the brand strategy instructions from ChatGPT.";
    }
    if (fieldId === "build_product_iteration_brand_design") {
      return "Paste or write the brand design instructions from ChatGPT.";
    }
    if (fieldId === "build_product_iteration_starter_idea") {
      return "Name the single starter idea you are testing first.";
    }
    if (fieldId === "build_product_iteration_generated_posts") {
      return "Add your first batch of generated posts.";
    }
  }

  if (lesson.id !== "1.3") {
    return undefined;
  }

  const match = fieldId.match(/^problem_(\d+)_(who|pain|frequency|severity)$/);
  if (!match) {
    return undefined;
  }

  const [, index, type] = match;
  if (type === "who") {
    return `Candidate ${index}: name a real person or group, not a broad audience.`;
  }
  if (type === "pain") {
    return `Candidate ${index}: describe the recurring pain they keep running into, not the product idea you want to build.`;
  }
  if (type === "frequency") {
    return `Candidate ${index}: choose how often this pain actually shows up.`;
  }
  return `Candidate ${index}: score how painful this problem is from 1 to 10.`;
}

function isFieldComplete(field: WorkbenchField, value: unknown) {
  if (field.kind === "reference_gallery") {
    return (
      isReferenceGalleryValue(value) &&
      value.items.length >= getFieldMinimumItems(field)
    );
  }

  if (field.kind === "board") {
    return countFilledBoardLines(value) >= getFieldMinimumItems(field);
  }

  if (field.kind === "checklist") {
    if (!isChecklistItemArray(value) || value.length === 0) {
      return false;
    }
    if (field.required) {
      return value.every((item) => item.checked);
    }
    return value.some((item) => item.checked);
  }

  return isFilled(value);
}

export function getObjectiveTasks(
  lesson: LessonConfig,
  fieldValues: FieldValuesSource,
  context: ObjectiveTaskContext = {},
): ObjectiveTask[] {
  const values = normalizeLessonFieldValues(lesson, fieldValues);
  const objectiveMode = getObjectiveMode(lesson);
  const stageUnlockSummary = buildStageUnlockSummary(
    lesson,
    context.pinnedArtifacts ?? [],
  );

  if (objectiveMode === "manual") {
    const definitions = getManualObjectiveTaskDefinitions(lesson);
    const manualItems = normalizeLegacyChecklistItems(
      values[OBJECTIVE_CHECKLIST_FIELD_ID],
      definitions,
    );

    return definitions.map(
      (definition, index) =>
        ({
          id: definition.id ?? definition.label,
          label: definition.label,
          status: manualItems[index]?.checked ? "complete" : "incomplete",
          source: "manual",
          interactive: true,
        }) satisfies ObjectiveTask,
    );
  }

  const sectionByFieldId = new Map<
    string,
    { sectionId: string; sectionTitle: string }
  >();

  for (const section of getWorkbenchSections(lesson)) {
    for (const fieldId of section.fieldIds) {
      sectionByFieldId.set(fieldId, {
        sectionId: section.id,
        sectionTitle: section.title,
      });
    }
  }

  const tasks: ObjectiveTask[] = [];

  if (stageUnlockSummary) {
    tasks.push(
      ...stageUnlockSummary.tasks.map(
        (task) =>
          ({
            id: task.id,
            label: task.label,
            status: task.status,
            source: "field",
            fieldId: task.id,
            interactive: false,
          }) satisfies ObjectiveTask,
      ),
    );
  }

  if (lesson.requireReadyVideoForCompletion) {
    tasks.push({
      id: "__coach_video_ready",
      label: "Lesson video is attached and ready",
      status: isLessonVideoReady(lesson) ? "complete" : "incomplete",
      source: "field",
      fieldId: "__coach_video_ready",
      sectionId: "watch",
      sectionTitle: "Watch",
      interactive: false,
    });
  }

  if (lesson.handoff?.mode === "select_candidate_problem") {
    tasks.push({
      id: lesson.handoff.selectionFieldId,
      label:
        lesson.id === "1.4"
          ? "Commit to the user behind the problem"
          : "Pick problem to carry forward",
      status: isFilled(values[lesson.handoff.selectionFieldId])
        ? "complete"
        : "incomplete",
      source: "handoff",
      fieldId: lesson.handoff.selectionFieldId,
      sectionId: "handoff",
      sectionTitle: "Chosen problem",
      interactive: false,
    });
  }

  for (const field of getRequiredFields(lesson)) {
    const section = sectionByFieldId.get(field.id);
    const value = values[field.id];

    if (field.kind === "checklist") {
      const options = field.options ?? [];
      const checkedLabels = new Set(
        isChecklistItemArray(value)
          ? value.filter((item) => item.checked).map((item) => item.label)
          : Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string")
            : [],
      );

      for (const option of options) {
        tasks.push({
          id: `${field.id}:${option}`,
          label: option,
          status: checkedLabels.has(option) ? "complete" : "incomplete",
          source: "checklist_option",
          fieldId: field.id,
          sectionId: section?.sectionId,
          sectionTitle: section?.sectionTitle,
          interactive: false,
        });
      }

      continue;
    }

    tasks.push({
      id: field.id,
      label: getFieldTaskLabel(field),
      status: isFieldComplete(field, value) ? "complete" : "incomplete",
      source: "field",
      fieldId: field.id,
      sectionId: section?.sectionId,
      sectionTitle: section?.sectionTitle,
      interactive: false,
    });
  }

  return tasks;
}

export function getCompletionIssues(
  lesson: LessonConfig,
  fieldValues: FieldValuesSource,
  context: ObjectiveTaskContext = {},
): CompletionIssue[] {
  const values = normalizeLessonFieldValues(lesson, fieldValues);

  if (getObjectiveMode(lesson) === "generated") {
    return getObjectiveTasks(lesson, values, context)
      .filter((task) => task.status !== "complete")
      .map((task) => ({
        id: task.fieldId ?? task.id,
        label: task.label,
        kind: "field" as const,
        message: task.fieldId
          ? getLessonSpecificCompletionMessage(lesson, task.fieldId)
          : undefined,
      }));
  }

  const issues: CompletionIssue[] = [];

  for (const field of getRequiredFields(lesson)) {
    const value = values[field.id];

    if (field.kind === "checklist") {
      const checklistIsComplete =
        isChecklistItemArray(value) &&
        value.length > 0 &&
        value.every((item) => item.checked);

      if (!checklistIsComplete) {
        issues.push({
          id: field.id,
          label: getFieldTaskLabel(field),
          kind: "field",
        });
      }
      continue;
    }

    if (!isFieldComplete(field, value)) {
      issues.push({
        id: field.id,
        label: getFieldTaskLabel(field),
        kind: "field",
        message: getLessonSpecificCompletionMessage(lesson, field.id),
      });
    }
  }

  for (const task of getObjectiveTasks(lesson, values).filter(
    (task) => task.source === "manual" && task.status !== "complete",
  )) {
    issues.push({
      id: OBJECTIVE_CHECKLIST_FIELD_ID,
      label: task.label,
      kind: "objective",
    });
  }

  return issues;
}

export function getWorkbenchSectionStates(
  lesson: LessonConfig,
  fieldValues: FieldValuesSource,
) {
  const values = normalizeLessonFieldValues(lesson, fieldValues);
  const fieldsById = new Map(
    (lesson.workbenchFields ?? []).map((field) => [field.id, field]),
  );

  return getWorkbenchSections(lesson).map((section) => {
    const requiredFields: WorkbenchField[] = [];

    for (const fieldId of section.fieldIds) {
      const field = fieldsById.get(fieldId);
      if (!field || !field.required || field.kind === "readonly") {
        continue;
      }

      requiredFields.push(field);
    }

    const incompleteFieldIds = requiredFields
      .filter((field) => !isFieldComplete(field, values[field.id]))
      .map((field) => field.id);
    const totalRequiredFields = requiredFields.length;
    const completedRequiredFields =
      totalRequiredFields - incompleteFieldIds.length;
    const completionLabel = section.completionLabel ?? section.title;

    return {
      id: section.id,
      title: section.title,
      completionLabel,
      totalRequiredFields,
      completedRequiredFields,
      isComplete:
        totalRequiredFields === 0 ||
        completedRequiredFields === totalRequiredFields,
      incompleteFieldIds,
    } satisfies WorkbenchSectionState;
  });
}
