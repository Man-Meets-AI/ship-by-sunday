import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";

import type { CeoSkillExample } from "./ceo-skills-lesson-constants";

export function CeoSkillsCodexSkillExamplesList({
	examples,
}: {
	examples: readonly CeoSkillExample[];
}) {
	return (
		<ItemGroup className="gap-3">
			{examples.map((item) => (
				<Item key={item.id} variant="outline" size="sm">
					<ItemContent>
						<ItemHeader>
							<ItemTitle>{item.title}</ItemTitle>
							<ItemActions className="flex flex-wrap gap-1">
								{item.badges.map((b) => (
									<Badge key={b} variant="secondary" className="text-[10px]">
										{b}
									</Badge>
								))}
							</ItemActions>
						</ItemHeader>
						<ItemDescription className="line-clamp-none text-xs leading-relaxed">
							{item.body}
						</ItemDescription>
					</ItemContent>
				</Item>
			))}
		</ItemGroup>
	);
}
