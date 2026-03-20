"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { CompletionIssue } from "@/features/course/lesson/model/registry";

export function LessonPageFooterCompletionAlert({
	serverCompletionMessage,
	displayedCompletionIssues,
	className,
}: {
	serverCompletionMessage: string | null;
	displayedCompletionIssues: CompletionIssue[];
	className?: string;
}) {
	return (
		<Alert variant="destructive" className={cn("py-2", className)}>
			<AlertTitle className="text-xs font-medium">
				{serverCompletionMessage ?? "Finish these before continuing:"}
			</AlertTitle>
			{displayedCompletionIssues.length > 0 ? (
				<AlertDescription className="text-xs font-medium text-destructive">
					<div className="mt-1 space-y-1">
						{displayedCompletionIssues.map((issue) => (
							<p key={`${issue.id}-${issue.label}`}>
								{issue.message ?? issue.label}
							</p>
						))}
					</div>
				</AlertDescription>
			) : null}
		</Alert>
	);
}
