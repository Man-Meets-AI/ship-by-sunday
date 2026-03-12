"use client";

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
				<article
					key={item.id}
					className={`group relative overflow-hidden border border-product-border bg-product-surface-strong ${getSpanClass(
						index,
						items.length,
					)}`}
				>
					<img
						src={item.src}
						alt={item.alt}
						className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
					/>
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
					{item.onRemove ? (
						<button
							type="button"
							onClick={item.onRemove}
							className="sbs-press-feedback absolute right-2 top-2 z-10 border border-white/65 bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
						>
							Remove
						</button>
					) : null}
				</article>
			))}
		</div>
	);
}
