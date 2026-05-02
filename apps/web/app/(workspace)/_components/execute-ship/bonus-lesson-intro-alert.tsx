"use client";

import Link from "next/link";
import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BonusLessonIntroAlert({
	onOpenLessonMap,
	recommendedBuildLessonHref,
}: {
	onOpenLessonMap: () => void;
	recommendedBuildLessonHref: string;
}) {
	return (
		<Alert>
			<AlertCircleIcon aria-hidden />
			<AlertTitle>Video-first bonus lesson</AlertTitle>
			<AlertDescription>
				Use the blueprint as the brief and keep BUILD as the default path.
				Browse bonus lessons from{" "}
				<button
					type="button"
					className="font-medium text-foreground underline"
					onClick={onOpenLessonMap}
				>
					the Lesson Map
				</button>
				, and if you need to restart, jump back to{" "}
				<Link
					className="font-medium text-foreground underline"
					href={recommendedBuildLessonHref}
				>
					3.1
				</Link>
				.
			</AlertDescription>
		</Alert>
	);
}
