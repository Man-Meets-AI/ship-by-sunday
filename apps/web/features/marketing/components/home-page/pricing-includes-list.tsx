import { Check } from "lucide-react";

export function PricingIncludesList({ items }: { items: readonly string[] }) {
	return (
		<ul className="space-y-2.5">
			{items.map((item) => (
				<li key={item} className="flex items-center gap-2.5">
					<Check className="size-4 shrink-0 text-primary" />
					<span className="text-sm">{item}</span>
				</li>
			))}
		</ul>
	);
}
