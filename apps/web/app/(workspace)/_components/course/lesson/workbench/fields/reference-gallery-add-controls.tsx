"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReferenceGalleryAddControls({
	urlInput,
	isUploading,
	onBrowse,
	onUrlInputChange,
	onAddImageUrl,
}: {
	urlInput: string;
	isUploading: boolean;
	onBrowse: () => void;
	onUrlInputChange: (value: string) => void;
	onAddImageUrl: () => void;
}) {
	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
			<div className="flex flex-wrap items-center gap-2.5">
				<Button
					type="button"
					onClick={onBrowse}
					disabled={isUploading}
					variant="secondary"
					size="default"
				>
					{isUploading ? "Uploading..." : "Browse images"}
				</Button>
				<div className="flex flex-wrap gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
					<span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1">
						Drag
					</span>
					<span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1">
						Paste
					</span>
					<span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1">
						Upload
					</span>
				</div>
			</div>
			<div className="flex w-full flex-1 flex-col gap-2 sm:flex-row lg:max-w-[29rem]">
				<Input
					type="url"
					value={urlInput}
					onChange={(event) => onUrlInputChange(event.target.value)}
					placeholder="Paste a direct image URL"
					className="min-w-0"
					disabled={isUploading}
				/>
				<Button
					type="button"
					onClick={onAddImageUrl}
					disabled={isUploading || urlInput.trim().length === 0}
					variant="outline"
					size="default"
				>
					Add image URL
				</Button>
			</div>
		</div>
	);
}
