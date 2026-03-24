import type { LessonConfig, ReferenceGalleryValue } from "../manifest";
import { isReferenceGalleryValue } from "../reference-gallery";
import {
  getFieldShapeVersion,
  getHandoffPersistedFieldIds,
} from "./progression";
import {
  FIELD_SHAPE_VERSION_FIELD_ID,
  type FieldValuesSource,
  isUploadFieldValue,
  isUploadFieldValueArray,
  normalizeFieldValues,
  type PersistedFieldValues,
  PRIVATE_FIELD_PREFIX,
} from "./shared";

function getLegacyStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getLegacyTrimmedString(
  fieldValues: PersistedFieldValues,
  fieldId: string,
) {
  const value = fieldValues[fieldId];
  return typeof value === "string" ? value.trim() : "";
}

function isUrlString(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function omitFields(
  fieldValues: PersistedFieldValues,
  fieldIds: string[],
): PersistedFieldValues {
  const nextValues = { ...fieldValues };

  for (const fieldId of fieldIds) {
    delete nextValues[fieldId];
  }

  return nextValues;
}

function adaptLegacyReferenceBoardFieldValues(
  fieldValues: PersistedFieldValues,
): PersistedFieldValues {
  if (isReferenceGalleryValue(fieldValues.reference_gallery)) {
    return fieldValues;
  }

  const rows = getLegacyStringArray(fieldValues.reference_board);
  if (rows.length === 0) {
    return fieldValues;
  }

  return {
    ...omitFields(fieldValues, [
      "reference_input",
      "reference_board",
      "reference_patterns",
    ]),
    reference_gallery: {
      kind: "reference_gallery",
      items: rows
        .filter((row) => isUrlString(row))
        .map((row, index) => ({
          id: `legacy-reference-${index + 1}`,
          source: "remote_url",
          url: row,
        })),
    } satisfies ReferenceGalleryValue,
    [FIELD_SHAPE_VERSION_FIELD_ID]: 2,
  };
}

function adaptLegacySketchUploadFieldValues(
  fieldValues: PersistedFieldValues,
): PersistedFieldValues {
  if (isUploadFieldValueArray(fieldValues.sketch_upload)) {
    return fieldValues;
  }

  if (!isUploadFieldValue(fieldValues.sketch_upload)) {
    return fieldValues;
  }

  return {
    ...fieldValues,
    sketch_upload: [fieldValues.sketch_upload],
  };
}

function buildLegacyVisualGuideMarkdown(rules: string[], avoidRule: string) {
  const sections = ["# Visual Guide"];

  if (rules.length > 0) {
    sections.push(
      "## Direction Rules",
      rules.map((rule) => `- ${rule}`).join("\n"),
    );
  }

  if (avoidRule) {
    sections.push("## Avoid", `- ${avoidRule}`);
  }

  return sections.join("\n\n");
}

function adaptLegacyVisualDirectionFieldValues(
  fieldValues: PersistedFieldValues,
): PersistedFieldValues {
  const hasCurrentNotes = getLegacyTrimmedString(
    fieldValues,
    "visual_direction_notes",
  );
  const hasCurrentGuide = getLegacyTrimmedString(
    fieldValues,
    "visual_guide_markdown",
  );

  if (hasCurrentNotes || hasCurrentGuide) {
    return fieldValues;
  }

  const rules = [
    getLegacyTrimmedString(fieldValues, "style_rule_1"),
    getLegacyTrimmedString(fieldValues, "style_rule_2"),
    getLegacyTrimmedString(fieldValues, "style_rule_3"),
  ].filter(Boolean);
  const avoidRule = getLegacyTrimmedString(fieldValues, "avoid_rule");

  if (rules.length === 0 && !avoidRule) {
    return fieldValues;
  }

  const directionLines = [
    ...rules.map((rule, index) => `Style rule ${index + 1}: ${rule}`),
    ...(avoidRule ? [`Avoid: ${avoidRule}`] : []),
  ];

  return {
    ...omitFields(fieldValues, [
      "style_rule_1",
      "style_rule_2",
      "style_rule_3",
      "avoid_rule",
    ]),
    visual_direction_notes: directionLines.join("\n"),
    visual_guide_markdown: buildLegacyVisualGuideMarkdown(rules, avoidRule),
    [FIELD_SHAPE_VERSION_FIELD_ID]: 2,
  };
}

function adaptLegacyLessonFieldValues(
  lesson: LessonConfig,
  fieldValues: FieldValuesSource,
): PersistedFieldValues {
  const values = normalizeFieldValues(fieldValues);

  switch (lesson.id) {
    case "2.2":
      return adaptLegacySketchUploadFieldValues(values);
    case "2.6":
      return adaptLegacyVisualDirectionFieldValues(values);
    default:
      return values;
  }
}

export function isLessonFieldShapeCompatible(
  lesson: LessonConfig,
  fieldValues: FieldValuesSource,
) {
  const values = adaptLegacyLessonFieldValues(lesson, fieldValues);
  const expectedVersion = getFieldShapeVersion(lesson);
  const storedVersion = values[FIELD_SHAPE_VERSION_FIELD_ID];
  const knownFieldIds = new Set([
    ...(lesson.workbenchFields ?? []).map((field) => field.id),
    ...getHandoffPersistedFieldIds(lesson.handoff),
  ]);
  const nonPrivateFieldIds = Object.keys(values).filter(
    (fieldId) => !fieldId.startsWith(PRIVATE_FIELD_PREFIX),
  );

  if (expectedVersion === 1) {
    return storedVersion === undefined || storedVersion === expectedVersion;
  }

  if (storedVersion === undefined && lesson.handoff) {
    return false;
  }

  if (
    storedVersion === undefined &&
    nonPrivateFieldIds.every((fieldId) => knownFieldIds.has(fieldId))
  ) {
    return true;
  }

  return storedVersion === expectedVersion;
}

export function normalizeLessonFieldValues(
  lesson: LessonConfig,
  fieldValues: FieldValuesSource,
) {
  const values = adaptLegacyLessonFieldValues(lesson, fieldValues);

  if (!isLessonFieldShapeCompatible(lesson, values)) {
    return {} as PersistedFieldValues;
  }

  return values;
}
