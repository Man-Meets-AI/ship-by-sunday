import { Check } from "lucide-react";

export function PricingIncludesList({ items }: { items: readonly string[] }) {
	return (
		<ul className="grid gap-3">
			{items.map((item) => (
				<li key={item} className="flex items-start gap-2.5">
					<Check className="mt-0.5 size-4 shrink-0 text-primary" />
					<span className="text-sm leading-relaxed">{item}</span>
				</li>
			))}
		</ul>
	);
}
