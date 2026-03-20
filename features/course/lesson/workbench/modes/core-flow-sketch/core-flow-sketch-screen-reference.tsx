import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CORE_FLOW_SCREEN_REFERENCE } from "./core-flow-sketch-copy";

export function CoreFlowSketchScreenReference() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Named screens (reference)</CardTitle>
				<CardDescription>
					States the instructor names—use your own labels, keep this sequence in
					mind.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{CORE_FLOW_SCREEN_REFERENCE.map((row) => (
					<div key={row.label} className="space-y-1">
						<Badge variant="secondary" className="font-normal">
							{row.label}
						</Badge>
						<p className="text-sm text-muted-foreground">{row.hint}</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
