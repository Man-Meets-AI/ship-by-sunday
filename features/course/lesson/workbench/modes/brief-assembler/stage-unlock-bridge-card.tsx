import type { StageUnlockBridge } from "@/features/course/lesson/model/stage-unlock";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function StageUnlockBridgeCard({
	bridge,
}: {
	bridge: StageUnlockBridge;
}) {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 pb-4">
				<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{bridge.eyebrow}
				</CardTitle>
			</CardHeader>
			<CardContent className="py-4">
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.9fr)] lg:items-start">
					<div className="space-y-2">
						<CardTitle className="max-w-3xl text-balance text-lg font-semibold leading-6 sm:text-xl">
							{bridge.title}
						</CardTitle>
						<CardDescription className="max-w-prose text-sm leading-relaxed">
							{bridge.body}
						</CardDescription>
					</div>
					<div className="flex flex-wrap gap-2.5 lg:justify-end">
						{bridge.highlights.map((highlight) => (
							<Badge
								key={highlight}
								variant="outline"
								className="text-xs font-medium"
							>
								{highlight}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
