import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import type { WorkspaceHomeStep } from "@/features/workspace-home/lib/workspace-home-model";

export function WorkspaceHomeNextSteps({
	nextSteps,
}: {
	nextSteps: WorkspaceHomeStep[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Next steps</CardTitle>
				<CardDescription>
					Use these in order if you want a clean first pass through starter mode
					without touching the fragile access and billing path.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup className="gap-3">
					{nextSteps.map((step, index) => (
						<Item key={step.id} variant="outline" className="gap-3 p-4">
							<ItemMedia>
								<span className="flex size-7 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground">
									{index + 1}
								</span>
							</ItemMedia>
							<ItemContent>
								<ItemTitle className="line-clamp-none">{step.title}</ItemTitle>
								<ItemDescription className="line-clamp-none">
									{step.description}
								</ItemDescription>
								<Link
									href={step.actionHref}
									className="text-sm font-medium text-primary underline-offset-4 hover:underline"
								>
									{step.actionLabel}
								</Link>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
