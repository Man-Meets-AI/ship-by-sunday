"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
	LessonConfig,
	LessonLayoutMode,
} from "@/features/course/lesson/model/manifest";

function SkeletonPanel({
	label,
	className,
}: {
	label: string;
	className?: string;
}) {
	return (
		<Card className={cn("min-w-0 gap-0 py-0", className)}>
			<CardHeader className="border-b py-3">
				<CardDescription>{label}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2 pt-4">
				<Skeleton className="h-3 w-3/4" />
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-20 w-full" />
			</CardContent>
		</Card>
	);
}

export function LessonPageSkeleton({
	shell,
	layoutMode,
}: {
	shell: LessonConfig["shell"];
	layoutMode: LessonLayoutMode;
}) {
	if (shell === "watch") {
		return (
			<Card className="gap-0 py-0">
				<CardContent className="space-y-5 px-4 py-4 xl:px-6 xl:py-6">
					<CardHeader className="border-b p-0 pb-4">
						<div className="flex gap-2">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-3 w-14" />
						</div>
						<Skeleton className="mt-3 h-10 w-2/3" />
						<Skeleton className="mt-2 h-4 w-3/4" />
					</CardHeader>
					<Skeleton className="aspect-video w-full" />
				</CardContent>
			</Card>
		);
	}

	if (layoutMode === "focus") {
		return (
			<div className="xl:h-full xl:min-h-0">
				<SkeletonPanel label="Workbench" className="xl:h-full" />
			</div>
		);
	}

	return (
		<div className="grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)_minmax(280px,320px)]">
			<SkeletonPanel label="Objective" className="xl:h-full" />
			<SkeletonPanel label="Workbench" className="xl:h-full" />
			<SkeletonPanel label="Coach" className="xl:h-full" />
		</div>
	);
}
