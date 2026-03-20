"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
	BUILD_SLICES_PLAN_SKILL,
	BUILD_SLICES_TRADITIONAL,
} from "./build-setting-up-slices-constants";

export function BuildSettingUpSlicesPlanningPanel({
	value,
	onChange,
}: {
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const raw = typeof value === "string" ? value : "";

	useEffect(() => {
		if (raw.trim() === "") {
			onChange(BUILD_SLICES_PLAN_SKILL);
		}
	}, [raw, onChange]);

	const selected =
		raw === BUILD_SLICES_TRADITIONAL
			? BUILD_SLICES_TRADITIONAL
			: BUILD_SLICES_PLAN_SKILL;

	return (
		<Card>
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base">Planning mode</CardTitle>
				<CardDescription>
					Use the plan skill in your copied repo, or normal planning mode in
					your agent—both are valid.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<ToggleGroup
					type="single"
					value={selected}
					onValueChange={(next) => {
						if (next) {
							onChange(next);
						}
					}}
					variant="outline"
					spacing={0}
					className="w-full sm:w-auto"
				>
					<ToggleGroupItem
						value={BUILD_SLICES_PLAN_SKILL}
						aria-label="Plan skill"
						className="flex-1 px-4 sm:flex-initial"
					>
						Plan skill
					</ToggleGroupItem>
					<ToggleGroupItem
						value={BUILD_SLICES_TRADITIONAL}
						aria-label="Traditional planning mode"
						className="flex-1 px-4 sm:flex-initial"
					>
						Traditional planning
					</ToggleGroupItem>
				</ToggleGroup>
				<Alert>
					<AlertTitle>Copied repository</AlertTitle>
					<AlertDescription>
						The bundled <strong>plan skill</strong> lives in the course
						repository you copied—open that repo in your editor when you use it.
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
}
