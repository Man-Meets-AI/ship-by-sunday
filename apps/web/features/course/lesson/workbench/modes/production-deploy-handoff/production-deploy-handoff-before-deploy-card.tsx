"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { DEPLOY_SERVICES } from "./production-deploy-handoff-constants";

export function ProductionDeployHandoffBeforeDeployCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Before you deploy</CardTitle>
				<CardDescription>
					You need these services lined up for a production handoff.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				{DEPLOY_SERVICES.map((name) => (
					<Badge key={name} variant="secondary">
						{name}
					</Badge>
				))}
				<Badge variant="outline">Prod</Badge>
				<Badge variant="outline">Required</Badge>
			</CardContent>
		</Card>
	);
}
