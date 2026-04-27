import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MissionLoading() {
	return (
		<Card aria-busy="true">
			<span className="sr-only">Loading</span>
			<CardHeader className="space-y-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-8 w-48 max-w-full" />
				<Skeleton className="h-4 w-full max-w-md" />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-32 w-full rounded-lg" />
				<Skeleton className="h-2 w-full rounded-full" />
			</CardContent>
		</Card>
	);
}
