"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
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
import {
	getReferenceGalleryField,
	getUploadGalleryField,
} from "./artifact-preview-fields";
import { ArtifactPreviewGalleryGrid } from "./artifact-preview-gallery-grid";

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

	const referenceGridItems = galleryItems.map((item) => ({
		key: item.id,
		src: getReferenceGalleryItemImageUrl(item) ?? "",
		alt: item.fileName ?? "Saved reference",
	}));

	const uploadGridItems = uploadGalleryItems.map((item) => {
		const keyBase =
			item.storageId ??
			item.fileName ??
			item.previewUrl ??
			item.url ??
			"upload";
		const occurrence = uploadGalleryKeyCounts.get(keyBase) ?? 0;
		uploadGalleryKeyCounts.set(keyBase, occurrence + 1);
		return {
			key: `${keyBase}-${occurrence}`,
			src: item.previewUrl ?? item.url ?? "",
			alt: item.fileName ?? "Saved upload",
		};
	});

	const hasGalleries = Boolean(galleryField || uploadGalleryField);
	const hasTextFields = textFields.length > 0;

	return (
		<Card className="gap-0 border-0 bg-transparent p-0 shadow-none ring-0">
			<CardContent className="space-y-3 px-0 text-sm leading-relaxed text-muted-foreground">
				{galleryField ? (
					<Item variant="outline" className="flex-col items-stretch gap-2">
						<Label className="text-xs font-normal text-muted-foreground">
							{galleryField.label}
						</Label>
						<ArtifactPreviewGalleryGrid items={referenceGridItems} />
						<CardDescription className="max-w-prose text-foreground">
							{formatArtifactValue(galleryField.value)}
						</CardDescription>
					</Item>
				) : null}
				{galleryField && uploadGalleryField ? <Separator /> : null}
				{uploadGalleryField ? (
					<Item variant="outline" className="flex-col items-stretch gap-2">
						<Label className="text-xs font-normal text-muted-foreground">
							{uploadGalleryField.label}
						</Label>
						<ArtifactPreviewGalleryGrid items={uploadGridItems} />
						<CardDescription className="max-w-prose text-foreground">
							{formatArtifactValue(uploadGalleryField.value)}
						</CardDescription>
					</Item>
				) : null}
				{hasGalleries && hasTextFields ? <Separator /> : null}
				{!hasGalleries && !hasTextFields ? (
					<Alert className="py-2">
						<AlertDescription>No preview details attached.</AlertDescription>
					</Alert>
				) : null}
				{hasTextFields ? (
					<ItemGroup className="gap-3">
						{textFields.map(([key, value]) => (
							<Item key={key} variant="muted" size="sm" className="flex-col">
								<ItemContent className="w-full gap-1">
									<ItemTitle className="text-xs font-normal text-muted-foreground">
										{key}
									</ItemTitle>
									<ItemDescription className="line-clamp-none text-foreground">
										{formatArtifactValue(value)}
									</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				) : null}
			</CardContent>
		</Card>
	);
}
