import { ExternalLink, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { productConfig } from "@/config/product";
import { MissionSectionLabel } from "@/app/(app)/_components/course/mission/components/mission/mission-section-label";

export function MissionExtrasRow() {
	return (
		<div className="space-y-3">
			<MissionSectionLabel>Extras</MissionSectionLabel>
			<div className="grid gap-4">
				<BonusPlaylistItem />
			</div>
		</div>
	);
}

function BonusPlaylistItem() {
	return (
		<ItemGroup className="gap-0">
			<Item variant="outline" className="p-4">
				<ItemMedia variant="icon">
					<PlayCircle className="size-5 text-muted-foreground" />
				</ItemMedia>
				<ItemContent>
					<ItemTitle className="line-clamp-none text-sm">
						{productConfig.bonusName}
					</ItemTitle>
					<ItemDescription className="line-clamp-none">
						Optional AI course for practical workflows, prompting patterns, and
						build reps after the first sprint.
					</ItemDescription>
				</ItemContent>
				<Button asChild variant="ghost" size="sm" className="shrink-0">
					<a
						href={productConfig.bonusPlaylistUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<ExternalLink className="size-3.5" />
						Open
					</a>
				</Button>
			</Item>
		</ItemGroup>
	);
}
