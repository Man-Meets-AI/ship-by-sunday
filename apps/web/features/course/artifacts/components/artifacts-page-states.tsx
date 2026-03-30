import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLessonMapHref } from "@/features/workspace-navigation/lib/lesson-map-href";

export function ArtifactsLoadingState() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-36" />
				<Skeleton className="mt-2 h-4 w-full max-w-md" />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-28 w-full rounded-md" />
				<Skeleton className="h-28 w-full rounded-md" />
			</CardContent>
		</Card>
	);
}

export function ArtifactsEmptyState() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>No saved work yet</CardTitle>
				<CardDescription>
					Finish a lesson and your outputs show up here, grouped by course
					block.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button asChild>
					<Link href={getLessonMapHref()}>Open Lesson Map</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
