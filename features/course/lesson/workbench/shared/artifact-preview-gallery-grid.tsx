"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

export type GalleryGridItem = {
	key: string;
	src: string;
	alt: string;
};

export function ArtifactPreviewGalleryGrid({ items }: { items: GalleryGridItem[] }) {
	return (
		<div className="grid grid-cols-2 gap-2">
			{items.map((item) => (
				<Card
					key={item.key}
					className="gap-0 overflow-hidden p-0 py-0 shadow-none ring-1 ring-border"
				>
					<AspectRatio ratio={4 / 3}>
						<img
							src={item.src}
							alt={item.alt}
							className="h-full w-full object-cover"
						/>
					</AspectRatio>
				</Card>
			))}
		</div>
	);
}
