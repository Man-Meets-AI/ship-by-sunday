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
					className={`group relative overflow-hidden border border-product-border/70 bg-product-surface-strong shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_10px_28px_rgba(15,23,42,0.08)] transition-shadow duration-200 ease-out hover:shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_14px_34px_rgba(15,23,42,0.12)] ${getSpanClass(
						index,
						items.length,
					)}`}
				>
					<img
						src={item.src}
						alt={item.alt}
						className="h-full w-full object-cover outline outline-1 outline-black/10 outline-offset-[-1px] transition-transform duration-200 ease-out group-hover:scale-[1.02]"
					/>
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-85" />
					{item.onRemove ? (
						<button
							type="button"
							onClick={item.onRemove}
							className="sbs-press-feedback absolute right-2 top-2 z-10 translate-y-1 border border-white/55 bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white opacity-0 shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
						>
							Remove
						</button>
					) : null}
				</article>
			))}
		</div>
	);
}
