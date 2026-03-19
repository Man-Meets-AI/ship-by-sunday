"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const spanPattern = [
	"lg:col-span-2 lg:row-span-2",
	"",
	"",
	"lg:col-span-2",
	"",
	"lg:col-span-2",
];

export type LayoutGridItem = {
	id: string;
	src: string;
	alt: string;
	onRemove?: () => void;
};

function getSpanClass(index: number, total: number) {
	if (total === 1) {
		return "lg:col-span-4 lg:row-span-2";
	}

	if (total === 2) {
		return "lg:col-span-2 lg:row-span-2";
	}

	return spanPattern[index % spanPattern.length];
}

export function LayoutGrid({ items }: { items: LayoutGridItem[] }) {
	return (
		<div className="grid auto-rows-[160px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{items.map((item, index) => (
				<Card
					key={item.id}
					className={cn(
						"group relative gap-0 overflow-hidden p-0 py-0",
						getSpanClass(index, items.length),
					)}
				>
					<CardContent className="relative h-full min-h-[160px] p-0">
						<img
							src={item.src}
							alt={item.alt}
							className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
						/>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-85" />
						{item.onRemove ? (
							<button
								type="button"
								onClick={item.onRemove}
								className="absolute right-2 top-2 z-10 translate-y-1 rounded-md border border-input bg-background/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
							>
								Remove
							</button>
						) : null}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
