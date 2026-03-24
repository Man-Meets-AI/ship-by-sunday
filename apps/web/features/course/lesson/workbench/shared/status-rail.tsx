"use client";

import type { LessonContent } from "@/features/course/lesson/model/manifest";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function StatusRailItem({
	label,
	children,
	className,
}: {
	label: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Item
			variant="outline"
			size="sm"
			role="listitem"
			className={cn(
				"h-full min-h-0 flex-col items-stretch gap-0 py-3",
				className,
			)}
		>
			<ItemContent className="min-w-0 gap-1.5">
				<ItemTitle className="w-full text-xs font-semibold tracking-tight text-muted-foreground">
					{label}
				</ItemTitle>
				{children}
			</ItemContent>
		</Item>
	);
}

export function StatusRail({
	lessonContent,
	completedTaskCount,
	totalTaskCount,
}: {
	lessonContent: LessonContent;
	completedTaskCount: number;
	totalTaskCount: number;
}) {
	const progressValue =
		totalTaskCount > 0
			? Math.round((completedTaskCount / totalTaskCount) * 100)
			: 0;

	return (
		<div
			role="list"
			className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
		>
			<StatusRailItem label="Do this now">
				<ItemDescription className="line-clamp-4 text-foreground">
					{lessonContent.actionCard.jobNow}
				</ItemDescription>
			</StatusRailItem>
			<StatusRailItem label="Timebox">
				<ItemDescription className="text-foreground">
					{lessonContent.actionCard.timebox}
				</ItemDescription>
			</StatusRailItem>
			<StatusRailItem label="Finish with">
				<ItemDescription className="line-clamp-4 text-foreground">
					{lessonContent.actionCard.comeBackWith}
				</ItemDescription>
			</StatusRailItem>
			<StatusRailItem label="Progress">
				<div className="flex flex-col gap-2">
					<p className="text-sm font-medium tabular-nums text-foreground">
						{completedTaskCount}/{totalTaskCount}
					</p>
					<Progress value={progressValue} className="h-1.5" />
				</div>
			</StatusRailItem>
		</div>
	);
}
