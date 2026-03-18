import type { LessonConfig, UploadFieldValue } from "../manifest";
import {
	isReferenceGalleryValue,
	toPersistedReferenceGalleryValue,
} from "../reference-gallery";
import { getFilledTableRows } from "../table";
import { getFieldShapeVersion } from "./progression";
import {
	FIELD_SHAPE_VERSION_FIELD_ID,
	type FieldValuesSource,
	isUploadFieldValue,
	isUploadFieldValueArray,
	normalizeFieldValues,
	type PersistedFieldValues,
} from "./shared";

export function prepareFieldValuesForPersistence(
	lesson: LessonConfig,
	fieldValues: FieldValuesSource,
) {
	const values = normalizeFieldValues(fieldValues);
	const fieldsById = new Map(
		(lesson.workbenchFields ?? []).map((field) => [field.id, field]),
	);

	return {
		...Object.fromEntries(
			Object.entries(values).map(([fieldId, value]) => {
				const field = fieldsById.get(fieldId);
				if (field?.kind === "table") {
					return [fieldId, getFilledTableRows(value, field.columns)];
				}

				if (
					field?.kind === "reference_gallery" &&
					isReferenceGalleryValue(value)
				) {
					return [fieldId, toPersistedReferenceGalleryValue(value)];
				}

				if (field?.kind === "image_uploads" && isUploadFieldValueArray(value)) {
					return [
						fieldId,
						value
							.filter((item) => Boolean(item.storageId))
							.map(
								(item) =>
									({
										kind: "upload",
										status: item.storageId ? "stored" : item.status,
										fileName: item.fileName,
										mimeType: item.mimeType,
										size: item.size,
										storageId: item.storageId,
									}) satisfies UploadFieldValue,
							),
					];
				}

				if (!isUploadFieldValue(value)) {
					return [fieldId, value];
				}

				return [
					fieldId,
					{
						kind: "upload",
						status: value.storageId ? "stored" : value.status,
						fileName: value.fileName,
						mimeType: value.mimeType,
						size: value.size,
						storageId: value.storageId,
					} satisfies UploadFieldValue,
				];
			}),
		),
		[FIELD_SHAPE_VERSION_FIELD_ID]: getFieldShapeVersion(lesson),
	} as PersistedFieldValues;
}
