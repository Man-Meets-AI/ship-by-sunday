import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import type { WorkspaceHomeModuleState } from "@/features/workspace-home/lib/workspace-home-model";

export function WorkspaceHomeModuleList({
	modules,
}: {
	modules: WorkspaceHomeModuleState[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Enabled in this starter</CardTitle>
				<CardDescription>
					Each module stays visible here so you can tell what this starter
					instance actually includes before you build on top of it.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup className="gap-3">
					{modules.map((module) => (
						<Item key={module.id} variant="outline" className="gap-3 p-4">
							<ItemContent>
								<ItemTitle className="line-clamp-none">
									{module.label}
								</ItemTitle>
								<ItemDescription className="line-clamp-none">
									{module.description}
								</ItemDescription>
							</ItemContent>
							<ItemActions className="ml-auto flex-wrap justify-end">
								<Badge variant={module.enabled ? "secondary" : "outline"}>
									{module.statusLabel}
								</Badge>
								{module.actionHref && module.actionLabel ? (
									<Link
										href={module.actionHref}
										className="text-sm font-medium text-primary underline-offset-4 hover:underline"
									>
										{module.actionLabel}
									</Link>
								) : null}
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
