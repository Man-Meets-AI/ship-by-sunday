"use client";

import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type {
	ReferenceGalleryItem,
	ReferenceGalleryValue,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import { getReferenceGalleryCount } from "@/features/course/lesson/model/reference-gallery";
import { LayoutGrid } from "./layout-grid";
import { ReferenceGalleryAddControls } from "./reference-gallery-add-controls";
import {
	createRemoteReferenceGalleryItem,
	createUploadedReferenceGalleryItem,
	type ReferenceGalleryUploadState,
	normalizeReferenceGalleryControlValue,
	revokeReferenceGalleryPreviewUrl,
	validateReferenceImageUrl,
} from "./reference-gallery-field-model";
import { uploadFilesToLessonStorage } from "./upload-storage";

export function ReferenceGalleryFieldControl({
	field,
	value,
	onChange,
	showLabel = true,
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	showLabel?: boolean;
}) {
	const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const latestItemsRef = useRef<ReferenceGalleryItem[]>([]);
	const galleryValue = normalizeReferenceGalleryControlValue(value);
	const minItems = Math.max(field.minItems ?? 1, 1);
	const savedCount = getReferenceGalleryCount(galleryValue);
	const [urlInput, setUrlInput] = useState("");
	const [uploadState, setUploadState] = useState<ReferenceGalleryUploadState>({
		status: "idle",
	});
	const [dropActive, setDropActive] = useState(false);
	const [pasteArmed, setPasteArmed] = useState(false);
	const isUploading = uploadState.status === "uploading";

	useEffect(() => {
		latestItemsRef.current = galleryValue.items;
	}, [galleryValue.items]);

	useEffect(() => {
		return () => {
			for (const item of latestItemsRef.current) {
				revokeReferenceGalleryPreviewUrl(item);
			}
		};
	}, []);

	function updateItems(items: ReferenceGalleryItem[]) {
		onChange({
			kind: "reference_gallery",
			items,
		} satisfies ReferenceGalleryValue);
	}

	async function uploadFile(file: File): Promise<ReferenceGalleryItem> {
		const [upload] = await uploadFilesToLessonStorage({
			files: [file],
			generateUploadUrl,
		});
		if (!upload) {
			throw new Error("upload-failed");
		}

		return createUploadedReferenceGalleryItem(upload);
	}

	async function appendFiles(files: File[]) {
		if (files.length === 0) {
			return;
		}

		setUploadState({ status: "uploading" });

		try {
			const imageFiles = files.filter((file) => file.type.startsWith("image/"));
			if (imageFiles.length === 0) {
				throw new Error("images-only");
			}

			const uploadedItems = await Promise.all(imageFiles.map(uploadFile));
			updateItems([...galleryValue.items, ...uploadedItems]);
			setUploadState({ status: "idle" });
		} catch {
			setUploadState({
				status: "error",
				message:
					"Upload failed. Drop or paste image files only, then try again.",
			});
		}
	}

	async function addImageUrl(rawUrl?: string) {
		const nextUrl = (rawUrl ?? urlInput).trim();
		if (!nextUrl) {
			return;
		}

		setUploadState({ status: "uploading" });

		try {
			await validateReferenceImageUrl(nextUrl);
			updateItems([
				...galleryValue.items,
				createRemoteReferenceGalleryItem(nextUrl),
			]);
			setUrlInput("");
			setUploadState({ status: "idle" });
		} catch {
			setUploadState({
				status: "error",
				message:
					"That link is not a direct image. Use the Resources panel for site links.",
			});
		}
	}

	function removeItem(itemId: string) {
		const item = galleryValue.items.find((entry) => entry.id === itemId);
		if (item) {
			revokeReferenceGalleryPreviewUrl(item);
		}

		updateItems(galleryValue.items.filter((entry) => entry.id !== itemId));
	}

	const addControls = (
		<ReferenceGalleryAddControls
			urlInput={urlInput}
			isUploading={isUploading}
			onBrowse={() => inputRef.current?.click()}
			onUrlInputChange={setUrlInput}
			onAddImageUrl={() => void addImageUrl()}
		/>
	);

	return (
		<div className="space-y-3">
			<div>
				{showLabel ? (
					<Label className="text-sm font-medium">{field.label}</Label>
				) : null}
				<p className="mt-1 max-w-2xl text-balance text-xs font-medium leading-snug text-muted-foreground">
					Save at least {minItems} visual references you want to borrow from.
					Aim for 5-10 if you need more range.
				</p>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				multiple
				className="hidden"
				onChange={(event) => {
					const files = Array.from(event.target.files ?? []);
					void appendFiles(files);
					event.target.value = "";
				}}
			/>

			<div
				tabIndex={0}
				onFocus={() => setPasteArmed(true)}
				onBlur={() => setPasteArmed(false)}
				onDragOver={(event) => {
					event.preventDefault();
					setDropActive(true);
				}}
				onDragLeave={(event) => {
					event.preventDefault();
					setDropActive(false);
				}}
				onDrop={(event) => {
					event.preventDefault();
					setDropActive(false);
					void appendFiles(Array.from(event.dataTransfer.files));
				}}
				onPaste={(event) => {
					const target = event.target;
					if (
						target instanceof HTMLElement &&
						(target.tagName === "INPUT" || target.tagName === "TEXTAREA")
					) {
						return;
					}

					const clipboardItems = Array.from(event.clipboardData.items);
					const imageFiles = clipboardItems
						.map((item) => item.getAsFile())
						.filter((file): file is File => Boolean(file));

					if (imageFiles.length > 0) {
						event.preventDefault();
						void appendFiles(imageFiles);
						return;
					}

					const pastedText = event.clipboardData.getData("text");
					if (pastedText.trim().length > 0) {
						event.preventDefault();
						void addImageUrl(pastedText);
					}
				}}
				className={`rounded-xl border border-dashed px-4 py-4 outline-hidden transition-[border-color,background-color] ${
					savedCount === 0 ? "min-h-[22rem]" : ""
				} ${
					dropActive || pasteArmed
						? "border-primary/40 bg-muted/30"
						: "border-border/80 bg-card"
				}`}
			>
				<div className="flex h-full flex-col justify-between gap-4">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-1">
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
								Reference capture
							</p>
							<p className="text-sm font-medium tabular-nums text-foreground">
								{savedCount === 0
									? "Drop references here or click into the zone and paste."
									: `${savedCount} saved of ${minItems} minimum references.`}
							</p>
							<p className="max-w-2xl text-balance text-xs font-medium leading-snug text-muted-foreground">
								Use direct image files or direct image URLs only. Keep site
								discovery in Resources.
							</p>
						</div>
						{savedCount > 0 ? (
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
								{pasteArmed ? "Paste ready" : "Click zone to arm paste"}
							</p>
						) : null}
					</div>

					{savedCount === 0 ? (
						<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
							<Card className="gap-0 border-border/60 py-0 ring-0">
								<CardContent className="flex min-h-[13rem] flex-col items-center justify-center px-6 py-8 text-center">
									<div className="space-y-2">
										<p className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
											Build your visual direction first
										</p>
										<p className="mx-auto max-w-xl text-balance text-sm font-medium leading-relaxed text-muted-foreground">
											Collect screenshots that match the flow, hierarchy, and
											vibe you want before you open Figma for real work.
										</p>
									</div>
								</CardContent>
							</Card>
							<Card className="gap-0 border-border/60 py-0 ring-0">
								<CardContent className="space-y-3 p-3">
									<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
										Add references
									</p>
									{addControls}
								</CardContent>
							</Card>
						</div>
					) : (
						<div className="space-y-4">
							<Card className="gap-0 border-border/60 py-0 ring-0">
								<CardContent className="p-3">{addControls}</CardContent>
							</Card>
							<LayoutGrid
								items={galleryValue.items
									.filter(
										(
											item,
										): item is typeof item & {
											url: string;
										} => Boolean(item.url),
									)
									.map((item) => ({
										id: item.id,
										src: item.url,
										alt: item.fileName ?? "Saved reference",
										onRemove: () => removeItem(item.id),
									}))}
							/>
						</div>
					)}
				</div>
			</div>

			{uploadState.status === "error" ? (
				<p className="text-sm font-medium text-destructive">
					{uploadState.message}
				</p>
			) : null}
			{field.helpText ? (
				<p className="text-xs font-medium leading-snug text-muted-foreground">
					{field.helpText}
				</p>
			) : null}
		</div>
	);
}
