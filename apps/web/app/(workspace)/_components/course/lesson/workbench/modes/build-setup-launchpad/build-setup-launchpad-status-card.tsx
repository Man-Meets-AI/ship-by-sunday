"use client";

import { CheckCircle2Icon } from "lucide-react";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function BuildSetupLaunchpadStatusCard() {
	return (
		<Card>
			<CardHeader className="space-y-2">
				<div className="flex items-center gap-2">
					<CheckCircle2Icon className="size-4 text-muted-foreground" />
					<CardTitle className="text-base">Local preview = success</CardTitle>
				</div>
				<CardDescription className="text-pretty">
					When the dev server is running, you should still see the
					starter&apos;s default marketing page—that means the app boots.
					Customizing the headline comes in a later lesson.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
