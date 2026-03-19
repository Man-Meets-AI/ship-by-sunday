"use client";

import {
	getReferenceGalleryItemImageUrl,
	isReferenceGalleryValue,
} from "@/features/course/lesson/model/reference-gallery";
import type { ArtifactPreview } from "@/features/course/lesson/model/registry";

import {
	formatArtifactValue,
	getReferenceGalleryPreviewItems,
	getUploadPreviewItems,
	hasUploadGalleryValue,
} from "./artifact-format";

function getReferenceGalleryField(artifact: ArtifactPreview) {
	for (const [label, value] of artifact.fields) {
		if (isReferenceGalleryValue(value)) {
			return { label, value };
		}
	}

	for (const [fieldId, value] of Object.entries(artifact.fieldValues)) {
		if (isReferenceGalleryValue(value)) {
			return { label: fieldId.replaceAll("_", " "), value };
		}
	}

	return null;
}

function getUploadGalleryField(artifact: ArtifactPreview) {
	for (const [label, value] of artifact.fields) {
		if (hasUploadGalleryValue(value)) {
			return { label, value };
		}
	}

	for (const [fieldId, value] of Object.entries(artifact.fieldValues)) {
		if (hasUploadGalleryValue(value)) {
			return { label: fieldId.replaceAll("_", " "), value };
		}
	}

	return null;
}

export function ArtifactPreviewContent({
	artifact,
	maxTextFields = 3,
}: {
	artifact: ArtifactPreview;
	maxTextFields?: number;
}) {
	const galleryField = getReferenceGalleryField(artifact);
	const uploadGalleryField = getUploadGalleryField(artifact);
	const textFields = artifact.fields
		.filter(
			([, value]) =>
				!isReferenceGalleryValue(value) && !hasUploadGalleryValue(value),
		)
		.slice(0, maxTextFields);
	const galleryItems = galleryField
		? getReferenceGalleryPreviewItems(galleryField.value).slice(0, 4)
		: [];
	const uploadGalleryItems = uploadGalleryField
		? getUploadPreviewItems(uploadGalleryField.value).slice(0, 4)
		: [];
	const uploadGalleryKeyCounts = new Map<string, number>();

	return (
		<div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
			{galleryField ? (
				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">
						{galleryField.label}
					</p>
					<div className="grid grid-cols-2 gap-2">
						{galleryItems.map((item) => (
							<div
								key={item.id}
								className="aspect-[4/3] overflow-hidden rounded-lg border border-input bg-card"
							>
								<img
									src={getReferenceGalleryItemImageUrl(item) ?? ""}
									alt={item.fileName ?? "Saved reference"}
									className="h-full w-full object-cover"
								/>
							</div>
						))}
					</div>
					<p className="max-w-prose text-foreground">
						{formatArtifactValue(galleryField.value)}
					</p>
				</div>
			) : null}
			{uploadGalleryField ? (
				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">
						{uploadGalleryField.label}
					</p>
					<div className="grid grid-cols-2 gap-2">
						{uploadGalleryItems.map((item) => {
							const keyBase =
								item.storageId ??
								item.fileName ??
								item.previewUrl ??
								item.url ??
								"upload";
							const occurrence = uploadGalleryKeyCounts.get(keyBase) ?? 0;
							uploadGalleryKeyCounts.set(keyBase, occurrence + 1);

							return (
								<div
									key={`${keyBase}-${occurrence}`}
									className="aspect-[4/3] overflow-hidden rounded-lg border border-input bg-card"
								>
									<img
										src={item.previewUrl ?? item.url ?? ""}
										alt={item.fileName ?? "Saved upload"}
										className="h-full w-full object-cover"
									/>
								</div>
							);
						})}
					</div>
					<p className="max-w-prose text-foreground">
						{formatArtifactValue(uploadGalleryField.value)}
					</p>
				</div>
			) : null}
			{textFields.length === 0 && !galleryField && !uploadGalleryField ? (
				<p>No preview details attached.</p>
			) : (
				textFields.map(([key, value]) => (
					<div key={key}>
						<p className="text-xs font-medium text-muted-foreground">{key}</p>
						<p className="mt-1 max-w-prose text-foreground">
							{formatArtifactValue(value)}
						</p>
					</div>
				))
			)}
		</div>
	);
}
