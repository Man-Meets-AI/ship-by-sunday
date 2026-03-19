import { Check } from "lucide-react";

export function PricingIncludesList({ items }: { items: readonly string[] }) {
	return (
		<ul
			className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm"
			role="list"
		>
			{items.map((item) => (
				<li
					key={item}
					className="flex gap-3.5 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4"
				>
					<span
						className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary ring-1 ring-primary/15"
						aria-hidden
					>
						<Check className="size-3.5 stroke-[2.5]" />
					</span>
					<span className="min-w-0 flex-1 text-base font-medium leading-relaxed text-foreground sm:text-[1.0625rem]">
						{item}
					</span>
				</li>
			))}
		</ul>
	);
}
