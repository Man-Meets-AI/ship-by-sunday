"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function ThemeKnobLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="text-[13px] font-medium text-foreground">{children}</span>
	);
}

export function ThemeDropdownKnob({
	label,
	value,
	options,
	onSelect,
	formatLabel,
}: {
	label: string;
	value: string;
	options: string[];
	onSelect: (v: string) => void;
	formatLabel?: (v: string) => string;
}) {
	const fmt =
		formatLabel ?? ((v: string) => v.charAt(0).toUpperCase() + v.slice(1));
	return (
		<div className="flex flex-col gap-2">
			<ThemeKnobLabel>{label}</ThemeKnobLabel>
			<Select value={value} onValueChange={onSelect}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => (
						<SelectItem key={opt} value={opt}>
							{fmt(opt)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
