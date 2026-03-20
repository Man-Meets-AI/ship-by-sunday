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
	ItemTitle,
} from "@/components/ui/item";

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
			<CardContent>
				<ItemGroup className="gap-3">
					{CORE_FLOW_SCREEN_REFERENCE.map((row) => (
						<Item key={row.label} variant="outline" size="sm">
							<ItemContent>
								<ItemTitle>{row.label}</ItemTitle>
								<ItemDescription>{row.hint}</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
