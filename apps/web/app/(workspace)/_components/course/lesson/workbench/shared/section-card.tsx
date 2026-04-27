import type { WorkbenchSection } from "@/lib/course/lesson/model/manifest";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionCard({
	section,
	children,
	isComplete,
	blocked = false,
	blockedMessage,
}: {
	section: WorkbenchSection;
	children: React.ReactNode;
	isComplete: boolean;
	blocked?: boolean;
	blockedMessage?: string;
}) {
	const statusLabel = blocked ? "Locked" : isComplete ? "Ready" : "In progress";

	return (
		<Card className={cn(blocked && "bg-muted/30")}>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<CardTitle>{section.title}</CardTitle>
					<Badge variant="outline" className="text-xs font-normal">
						{statusLabel}
					</Badge>
				</div>
				{blocked && blockedMessage ? (
					<CardDescription>{blockedMessage}</CardDescription>
				) : null}
				{section.instruction ? (
					<CardDescription className={cn(blocked && blockedMessage && "mt-1")}>
						{section.instruction}
					</CardDescription>
				) : null}
			</CardHeader>
			<CardContent>
				<fieldset disabled={blocked} className={blocked ? "opacity-45" : ""}>
					{children}
				</fieldset>
			</CardContent>
		</Card>
	);
}
