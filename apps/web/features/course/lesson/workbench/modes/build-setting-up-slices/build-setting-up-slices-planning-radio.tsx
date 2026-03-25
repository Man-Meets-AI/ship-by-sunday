"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
	BUILD_SLICES_PLAN_SKILL,
	BUILD_SLICES_TRADITIONAL,
} from "./build-setting-up-slices-constants";

export function BuildSettingUpSlicesPlanningRadio({
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
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Use the plan skill in your copied repo, or normal planning mode in your
				agent—both are valid.
			</p>
			<RadioGroup value={selected} onValueChange={(next) => onChange(next)}>
				<div className="flex items-center gap-2">
					<RadioGroupItem value={BUILD_SLICES_PLAN_SKILL} id="bss-plan-skill" />
					<Label
						htmlFor="bss-plan-skill"
						className="cursor-pointer font-normal"
					>
						Plan skill
					</Label>
				</div>
				<div className="flex items-center gap-2">
					<RadioGroupItem
						value={BUILD_SLICES_TRADITIONAL}
						id="bss-traditional"
					/>
					<Label
						htmlFor="bss-traditional"
						className="cursor-pointer font-normal"
					>
						Traditional planning
					</Label>
				</div>
			</RadioGroup>
			<Alert>
				<AlertTitle>Copied repository</AlertTitle>
				<AlertDescription>
					The bundled <strong>plan skill</strong> lives in the course repository
					you copied—open that repo in your editor when you use it.
				</AlertDescription>
			</Alert>
		</div>
	);
}
