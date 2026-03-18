import type { ArtifactType, LessonConfig } from "../manifest";
import {
	getReferenceGallerySummary,
	isReferenceGalleryValue,
} from "../reference-gallery";
import { buildStageUnlockSummary } from "../stage-unlock";
import { formatTablePreview } from "../table";
import { isFilled } from "./completion";
import { normalizeLessonFieldValues } from "./legacy";
import { getRequiredFields } from "./progression";
import {
	type ArtifactPreview,
	type FieldValuesSource,
	isChecklistItemArray,
	isUploadFieldValue,
	isUploadFieldValueArray,
	type PersistedFieldValue,
	type PersistedFieldValues,
	PRIVATE_FIELD_PREFIX,
} from "./shared";

function hasOwnArtifactFields(lesson: LessonConfig) {
	return getRequiredFields(lesson).length > 0;
}

function getUploadFieldValueSummary(value: unknown) {
	const count = isUploadFieldValueArray(value)
		? value.filter((item) => Boolean(item.storageId || item.url)).length
		: 0;
	if (count === 0) {
		return "";
	}

	return `${count} image${count === 1 ? "" : "s"} uploaded`;
}

function formatArtifactSummaryValue(value: unknown) {
	if (isUploadFieldValue(value)) {
		return value.fileName ?? "Saved upload";
	}

	if (isUploadFieldValueArray(value)) {
		return getUploadFieldValueSummary(value);
	}

	if (isReferenceGalleryValue(value)) {
		return getReferenceGallerySummary(value);
	}

	if (isChecklistItemArray(value)) {
		return value
			.filter((item) => item.checked)
			.map((item) => item.label)
			.join(", ");
	}

	if (Array.isArray(value)) {
		if (value.some((item) => Array.isArray(item))) {
			return formatTablePreview(value);
		}

		if (value.every((item) => typeof item === "string")) {
			return value
				.map((item) => item.trim())
				.filter(Boolean)
				.join(", ");
		}

		return JSON.stringify(value);
	}

	if (value === null || value === undefined) {
		return "";
	}

	return String(value).trim();
}

function truncatePreviewText(value: string, maxLength = 160) {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function getMarkdownDocumentTitle(markdown: string) {
	const match = markdown.match(/^#\s+(.+)$/mu);
	return match?.[1]?.trim() ?? null;
}

function getTrimmedFieldValue(
	fieldValues: PersistedFieldValues,
	fieldId: string,
) {
	const value = fieldValues[fieldId];
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function buildVisualDirectionPreview(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
): ArtifactPreview {
	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const directionNote = getTrimmedFieldValue(values, "visual_direction_notes");
	const visualGuideMarkdown = getTrimmedFieldValue(
		values,
		"visual_guide_markdown",
	);
	const visualGuideLabel = visualGuideMarkdown
		? (getMarkdownDocumentTitle(visualGuideMarkdown) ?? "Guide saved")
		: "";

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		contextTitle: lesson.artifact.contextTitle,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: values,
		fields: (
			[
				directionNote
					? (["Direction note", truncatePreviewText(directionNote)] as [
							string,
							PersistedFieldValue,
						])
					: null,
				visualGuideLabel
					? (["visualguide.md", visualGuideLabel] as [
							string,
							PersistedFieldValue,
						])
					: null,
			] as Array<[string, PersistedFieldValue] | null>
		).filter((entry): entry is [string, PersistedFieldValue] => Boolean(entry)),
	};
}

function summarizePinnedArtifact(artifact: ArtifactPreview, limit = 2) {
	if (artifact.fields.length === 0) {
		return "Saved and ready.";
	}

	return artifact.fields
		.slice(0, limit)
		.map(([label, value]) => {
			const formattedValue = formatArtifactSummaryValue(value);
			return formattedValue ? `${label}: ${formattedValue}` : label;
		})
		.join(" • ");
}

function buildCompositeBriefPreview(
	lesson: LessonConfig,
	pinnedArtifacts: ArtifactPreview[],
): ArtifactPreview {
	const fields = pinnedArtifacts.map((artifact) => [
		artifact.contextTitle ?? artifact.artifactLabel,
		summarizePinnedArtifact(artifact),
	]) as Array<[string, PersistedFieldValue]>;

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		contextTitle: lesson.artifact.contextTitle,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: Object.fromEntries(
			pinnedArtifacts.map((artifact) => [
				artifact.artifactKey,
				summarizePinnedArtifact(artifact, 3),
			]),
		) as PersistedFieldValues,
		fields,
	};
}

export function buildResolvedArtifactPreview(
	lesson: LessonConfig,
	fieldValues: FieldValuesSource,
	pinnedArtifacts: ArtifactPreview[] = [],
): ArtifactPreview {
	const stageUnlockSummary = buildStageUnlockSummary(lesson, pinnedArtifacts);
	if (stageUnlockSummary) {
		return stageUnlockSummary.preview as ArtifactPreview;
	}

	if (
		lesson.workbench === "brief_assembler" &&
		!hasOwnArtifactFields(lesson) &&
		pinnedArtifacts.length > 0
	) {
		return buildCompositeBriefPreview(lesson, pinnedArtifacts);
	}

	return buildArtifactPreview(lesson, fieldValues);
}

export function buildArtifactPreview(
	lesson: LessonConfig,
	fieldValues: FieldValuesSource,
): ArtifactPreview {
	if (lesson.artifact.key === "visual_direction") {
		return buildVisualDirectionPreview(
			lesson,
			normalizeLessonFieldValues(lesson, fieldValues),
		);
	}

	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const previewEntries: Array<[string, PersistedFieldValue]> = [];
	const usedFieldIds = new Set<string>();

	if (lesson.handoff?.mode === "select_candidate_problem") {
		for (const field of lesson.handoff.persistedFields ?? []) {
			const value = values[field.targetFieldId];
			if (!isFilled(value)) {
				continue;
			}

			previewEntries.push([
				field.previewLabel,
				typeof value === "string" ? value.trim() : value,
			]);
			usedFieldIds.add(field.targetFieldId);
		}
	}

	for (const field of lesson.workbenchFields ?? []) {
		if (
			field.id.startsWith(PRIVATE_FIELD_PREFIX) ||
			usedFieldIds.has(field.id)
		) {
			continue;
		}

		const value = values[field.id];
		if (!isFilled(value)) {
			continue;
		}

		previewEntries.push([
			field.artifactPreviewLabel ??
				field.label ??
				field.id.replaceAll("_", " "),
			field.kind === "table" ? formatTablePreview(value, field.columns) : value,
		]);
		usedFieldIds.add(field.id);
	}

	for (const [fieldId, value] of Object.entries(values)) {
		if (
			fieldId.startsWith(PRIVATE_FIELD_PREFIX) ||
			usedFieldIds.has(fieldId) ||
			!isFilled(value)
		) {
			continue;
		}

		previewEntries.push([fieldId.replaceAll("_", " "), value]);
	}

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		contextTitle: lesson.artifact.contextTitle,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: values,
		fields: previewEntries,
	};
}
