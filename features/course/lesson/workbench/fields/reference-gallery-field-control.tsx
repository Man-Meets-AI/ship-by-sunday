"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type {
	ReferenceGalleryItem,
	ReferenceGalleryValue,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import {
	getReferenceGalleryCount,
	isReferenceGalleryValue,
} from "@/features/course/lesson/model/reference-gallery";
import { LayoutGrid } from "@/shared/ui/layout-grid";

import { fieldLabelClass, inputBaseClass } from "./field-styles";

function getEmptyGalleryValue(): ReferenceGalleryValue {
	return {
		kind: "reference_gallery",
		items: [],
	};
}

function normalizeGalleryValue(value: unknown): ReferenceGalleryValue {
	return isReferenceGalleryValue(value) ? value : getEmptyGalleryValue();
}

function createGalleryItemId() {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	return `reference-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function revokePreviewUrl(item: ReferenceGalleryItem) {
	if (item.previewUrl?.startsWith("blob:")) {
		URL.revokeObjectURL(item.previewUrl);
	}
}

async function validateImageUrl(url: string) {
	await new Promise<void>((resolve, reject) => {
		const image = new Image();

		image.onload = () => resolve();
		image.onerror = () => reject(new Error("invalid-image-url"));
		image.src = url;
	});
}

function getRemoteImageLabel(url: string) {
	try {
		const parsed = new URL(url);
		const lastSegment = parsed.pathname.split("/").filter(Boolean).at(-1);
		return lastSegment || parsed.hostname;
	} catch {
		return "Reference image";
	}
}

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
	const galleryValue = normalizeGalleryValue(value);
	const minItems = Math.max(field.minItems ?? 1, 1);
	const savedCount = getReferenceGalleryCount(galleryValue);
	const [urlInput, setUrlInput] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [dropActive, setDropActive] = useState(false);
	const [pasteArmed, setPasteArmed] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		latestItemsRef.current = galleryValue.items;
	}, [galleryValue.items]);

	useEffect(() => {
		return () => {
			for (const item of latestItemsRef.current) {
				revokePreviewUrl(item);
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
		const uploadUrl = await generateUploadUrl();
		const response = await fetch(uploadUrl, {
			method: "POST",
			headers: {
				"Content-Type": file.type || "application/octet-stream",
			},
			body: file,
		});

		if (!response.ok) {
			throw new Error("upload-failed");
		}

		const result = (await response.json()) as { storageId?: string };
		if (!result.storageId) {
			throw new Error("missing-storage-id");
		}

		const previewUrl = URL.createObjectURL(file);

		return {
			id: createGalleryItemId(),
			source: "upload",
			fileName: file.name,
			mimeType: file.type,
			size: file.size,
			storageId: result.storageId,
			url: previewUrl,
			previewUrl,
		};
	}

	async function appendFiles(files: File[]) {
		if (files.length === 0) {
			return;
		}

		setErrorMessage(null);
		setIsUploading(true);

		try {
			const imageFiles = files.filter((file) => file.type.startsWith("image/"));
			if (imageFiles.length === 0) {
				throw new Error("images-only");
			}

			const uploadedItems = await Promise.all(imageFiles.map(uploadFile));
			updateItems([...galleryValue.items, ...uploadedItems]);
		} catch {
			setErrorMessage(
				"Upload failed. Drop or paste image files only, then try again.",
			);
		} finally {
			setIsUploading(false);
		}
	}

	async function addImageUrl(rawUrl?: string) {
		const nextUrl = (rawUrl ?? urlInput).trim();
		if (!nextUrl) {
			return;
		}

		setErrorMessage(null);
		setIsUploading(true);

		try {
			await validateImageUrl(nextUrl);
			updateItems([
				...galleryValue.items,
				{
					id: createGalleryItemId(),
					source: "remote_url",
					url: nextUrl,
					fileName: getRemoteImageLabel(nextUrl),
				},
			]);
			setUrlInput("");
		} catch {
			setErrorMessage(
				"That link is not a direct image. Use the Resources panel for site links.",
			);
		} finally {
			setIsUploading(false);
		}
	}

	function removeItem(itemId: string) {
		const item = galleryValue.items.find((entry) => entry.id === itemId);
		if (item) {
			revokePreviewUrl(item);
		}

		updateItems(galleryValue.items.filter((entry) => entry.id !== itemId));
	}

	const addControls = (
		<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
			<div className="flex flex-wrap items-center gap-2.5">
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={isUploading}
					className="sbs-press-feedback border border-product-accent/70 bg-product-chip px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
				>
					{isUploading ? "Uploading..." : "Browse images"}
				</button>
				<div className="flex flex-wrap gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-product-muted">
					<span className="border border-product-border/70 bg-product-surface/70 px-2 py-1">
						Drag
					</span>
					<span className="border border-product-border/70 bg-product-surface/70 px-2 py-1">
						Paste
					</span>
					<span className="border border-product-border/70 bg-product-surface/70 px-2 py-1">
						Upload
					</span>
				</div>
			</div>
			<div className="flex w-full flex-1 flex-col gap-2 sm:flex-row lg:max-w-[29rem]">
				<input
					type="url"
					value={urlInput}
					onChange={(event) => setUrlInput(event.target.value)}
					placeholder="Paste a direct image URL"
					className={`${inputBaseClass.replace("mt-1.5 ", "")} min-w-0`}
					disabled={isUploading}
				/>
				<button
					type="button"
					onClick={() => void addImageUrl()}
					disabled={isUploading || urlInput.trim().length === 0}
					className="sbs-press-feedback border border-product-border/80 bg-product-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:text-product-muted"
				>
					Add image URL
				</button>
			</div>
		</div>
	);

	return (
		<div className="space-y-3">
			<div>
				{showLabel ? (
					<span className={fieldLabelClass}>{field.label}</span>
				) : null}
				<p className="mt-1 max-w-2xl text-balance text-xs font-medium leading-snug text-product-muted">
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
				role="button"
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
					void appendFiles(Array.from(event.dataTransfer.files ?? []));
				}}
				onPaste={(event) => {
					const target = event.target;
					if (
						target instanceof HTMLElement &&
						(target.tagName === "INPUT" || target.tagName === "TEXTAREA")
					) {
						return;
					}

					const clipboardItems = Array.from(event.clipboardData.items ?? []);
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
				className={`border border-dashed px-4 py-4 outline-hidden transition-[border-color,background-color,box-shadow] ${
					savedCount === 0 ? "min-h-[22rem]" : ""
				} ${
					dropActive || pasteArmed
						? "border-product-accent bg-product-surface shadow-[0_0_0_1px_rgba(var(--product-accent),0.18),0_8px_24px_rgba(15,23,42,0.08)]"
						: "border-product-border/80 bg-product-surface-strong/65 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(15,23,42,0.05)]"
				}`}
			>
				<div className="flex h-full flex-col justify-between gap-4">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-1">
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
								Reference capture
							</p>
							<p className="text-sm font-medium tabular-nums text-product-text">
								{savedCount === 0
									? "Drop references here or click into the zone and paste."
									: `${savedCount} saved of ${minItems} minimum references.`}
							</p>
							<p className="max-w-2xl text-balance text-xs font-medium leading-snug text-product-muted">
								Use direct image files or direct image URLs only. Keep site
								discovery in Resources.
							</p>
						</div>
						{savedCount > 0 ? (
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
								{pasteArmed ? "Paste ready" : "Click zone to arm paste"}
							</p>
						) : null}
					</div>

					{savedCount === 0 ? (
						<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
							<div className="flex min-h-[13rem] items-center justify-center border border-product-border/60 bg-product-surface/70 px-6 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_22px_rgba(15,23,42,0.04)]">
								<div className="space-y-2">
									<p className="font-display text-3xl uppercase tracking-[0.04em] text-balance text-product-text">
										Build your visual direction first
									</p>
									<p className="mx-auto max-w-xl text-balance text-sm font-medium leading-relaxed text-product-muted">
										Collect screenshots that match the flow, hierarchy, and vibe
										you want before you open Figma for real work.
									</p>
								</div>
							</div>
							<div className="space-y-3 border border-product-border/60 bg-product-surface/70 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_22px_rgba(15,23,42,0.04)]">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
									Add references
								</p>
								{addControls}
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="border border-product-border/60 bg-product-surface/75 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_22px_rgba(15,23,42,0.04)]">
								{addControls}
							</div>
							<LayoutGrid
								items={galleryValue.items
									.filter((item) => Boolean(item.url))
									.map((item) => ({
										id: item.id,
										src: item.url!,
										alt: item.fileName ?? "Saved reference",
										onRemove: () => removeItem(item.id),
									}))}
							/>
						</div>
					)}
				</div>
			</div>

			{errorMessage ? (
				<p className="text-sm font-medium text-danger">{errorMessage}</p>
			) : null}
			{field.helpText ? (
				<p className="text-xs font-medium leading-snug text-product-muted">
					{field.helpText}
				</p>
			) : null}
		</div>
	);
}
