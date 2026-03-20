"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { BUILD_SLICES_LOOP_STEPS } from "./build-setting-up-slices-constants";

export function BuildSettingUpSlicesLoopCard() {
	return (
		<Card>
			<CardHeader className="space-y-2 pb-3">
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-base">Build loop</CardTitle>
					<Badge variant="secondary">Reference</Badge>
				</div>
				<CardDescription>
					Run this loop whenever you move from UX to planning and back.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ol className="flex flex-col gap-2 text-sm text-muted-foreground">
					{BUILD_SLICES_LOOP_STEPS.map((label, index) => (
						<li key={label} className="flex gap-3">
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-xs font-medium text-foreground">
								{index + 1}
							</span>
							<span className="pt-0.5 leading-snug">{label}</span>
						</li>
					))}
				</ol>
			</CardContent>
		</Card>
	);
}
