import { Check } from "lucide-react";

export function PricingIncludesList({ items }: { items: readonly string[] }) {
	return (
		<ul className="space-y-3">
			{items.map((item) => (
				<li key={item} className="flex items-start gap-3">
					<Check className="mt-0.5 size-4 shrink-0 text-primary" />
					<span className="text-sm sm:text-base">{item}</span>
				</li>
			))}
		</ul>
	);
}
