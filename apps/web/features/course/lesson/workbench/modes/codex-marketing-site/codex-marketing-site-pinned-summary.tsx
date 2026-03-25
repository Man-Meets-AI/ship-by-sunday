import type { PinnedArtifact } from "@/features/course/lesson/shells";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";

import { formatArtifactValue } from "../../shared/artifact-format";

export function CodexMarketingSitePinnedSummary({
	pinnedArtifacts,
}: {
	pinnedArtifacts: PinnedArtifact[];
}) {
	if (pinnedArtifacts.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			{pinnedArtifacts.map((artifact) => (
				<Card key={artifact.artifactKey}>
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{artifact.contextTitle ?? artifact.artifactLabel}
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<ItemGroup className="gap-3">
							{artifact.fields.map(([key, value]) => (
								<Item key={key} variant="muted" size="sm" className="flex-col">
									<ItemContent className="w-full gap-1">
										<ItemTitle className="text-xs font-normal text-muted-foreground">
											{key}
										</ItemTitle>
										<ItemDescription className="line-clamp-none text-foreground">
											{formatArtifactValue(value)}
										</ItemDescription>
									</ItemContent>
								</Item>
							))}
						</ItemGroup>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
