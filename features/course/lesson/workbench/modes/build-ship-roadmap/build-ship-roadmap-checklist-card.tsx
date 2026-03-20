"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { normalizeChecklistValue } from "@/features/course/lesson/workbench/fields/value-codecs";

import type { RoadmapTaskBadge } from "./build-ship-roadmap-constants";
import { BuildShipRoadmapTaskBadge } from "./build-ship-roadmap-badge";

type BuildShipRoadmapChecklistCardProps = {
	title: string;
	description?: string;
	options: readonly string[];
	badges: Record<string, RoadmapTaskBadge>;
	value: unknown;
	onChange: (next: ReturnType<typeof normalizeChecklistValue>) => void;
	invalid?: boolean;
};

export function BuildShipRoadmapChecklistCard({
	title,
	description,
	options,
	badges,
	value,
	onChange,
	invalid,
}: BuildShipRoadmapChecklistCardProps) {
	const optionList = [...options];
	const items = normalizeChecklistValue(value, optionList);

	return (
		<Card
			className={invalid ? "border-destructive/60 ring-1 ring-destructive/20" : ""}
		>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">{title}</CardTitle>
				{description ? (
					<CardDescription>{description}</CardDescription>
				) : null}
			</CardHeader>
			<CardContent className="space-y-3">
				{items.map((item, index) => {
					const badgeKind = badges[item.label] ?? "required";
					const controlId = `roadmap-check-${item.label}-${index}`;
					return (
						<div
							key={item.label}
							className="flex items-start gap-3 rounded-md border border-border/80 bg-muted/20 px-3 py-2.5"
						>
							<Checkbox
								id={controlId}
								checked={item.checked}
								onCheckedChange={(checked) => {
									const next = items.map((row, rowIndex) =>
										rowIndex === index
											? { ...row, checked: checked === true }
											: row,
									);
									onChange(next);
								}}
								className="mt-0.5"
							/>
							<div className="min-w-0 flex-1 space-y-1">
								<Label
									htmlFor={controlId}
									className="cursor-pointer text-sm font-medium leading-snug"
								>
									{item.label}
								</Label>
								<div>
									<BuildShipRoadmapTaskBadge kind={badgeKind} />
								</div>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
