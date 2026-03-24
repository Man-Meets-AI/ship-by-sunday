import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
	WorkspaceHomeModel,
	WorkspaceHomeQuickAction,
} from "@/features/workspace-home/lib/workspace-home-model";

export function WorkspaceHomeHero({
	model,
}: {
	model: Pick<
		WorkspaceHomeModel,
		| "title"
		| "eyebrow"
		| "description"
		| "enabledModuleCount"
		| "totalModuleCount"
		| "moduleCompletionPercent"
		| "quickActions"
	>;
}) {
	return (
		<Card>
			<CardHeader>
				<CardDescription>{model.eyebrow}</CardDescription>
				<CardTitle className="text-3xl">{model.title}</CardTitle>
				<CardDescription className="max-w-3xl text-sm leading-relaxed">
					{model.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between gap-3 text-sm">
					<p className="font-medium text-foreground">Enabled starter modules</p>
					<p className="text-muted-foreground">
						{model.enabledModuleCount} of {model.totalModuleCount}
					</p>
				</div>
				<Progress
					value={model.moduleCompletionPercent}
					aria-label="Enabled starter modules"
				/>
			</CardContent>
			<CardFooter className="flex flex-wrap gap-3">
				{model.quickActions.map((action) => (
					<WorkspaceHomeQuickActionButton key={action.id} action={action} />
				))}
			</CardFooter>
		</Card>
	);
}

function WorkspaceHomeQuickActionButton({
	action,
}: {
	action: WorkspaceHomeQuickAction;
}) {
	return (
		<Button asChild variant={action.variant ?? "default"}>
			<Link href={action.href}>{action.label}</Link>
		</Button>
	);
}
