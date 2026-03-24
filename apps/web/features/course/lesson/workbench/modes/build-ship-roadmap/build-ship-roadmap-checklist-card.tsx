"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Item } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { normalizeChecklistValue } from "@/features/course/lesson/workbench/fields/value-codecs";

import {
	type RoadmapTaskBadge,
	ROADMAP_TASK_BADGE_LABELS,
	ROADMAP_TASK_BADGE_VARIANTS,
} from "./build-ship-roadmap-constants";

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
			className={
				invalid ? "border-destructive/60 ring-1 ring-destructive/20" : ""
			}
		>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="space-y-2">
				{items.map((item, index) => {
					const badgeKind = badges[item.label] ?? "required";
					const controlId = `roadmap-check-${item.label}-${index}`;
					return (
						<Item key={item.label} asChild variant="outline" size="xs">
							<label className="flex cursor-pointer items-start gap-2">
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
								<div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
									<Label
										htmlFor={controlId}
										className="cursor-pointer text-sm font-medium"
									>
										{item.label}
									</Label>
									{badgeKind !== "required" ? (
										<Badge variant={ROADMAP_TASK_BADGE_VARIANTS[badgeKind]}>
											{ROADMAP_TASK_BADGE_LABELS[badgeKind]}
										</Badge>
									) : null}
								</div>
							</label>
						</Item>
					);
				})}
			</CardContent>
		</Card>
	);
}
