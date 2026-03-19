import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import { productConfig } from "@/config/product";

export function BonusCourseCard() {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="min-w-0 space-y-2">
						<CardDescription className="text-xs font-medium uppercase tracking-wide">
							Included bonus
						</CardDescription>
						<CardTitle className="text-xl font-semibold tracking-tight">
							{productConfig.bonusName}
						</CardTitle>
						<CardDescription className="text-base leading-relaxed text-foreground">
							Use this optional playlist when product judgment feels shaky: what
							to build first, what to cut, and how to keep the v1 small enough
							to ship.
						</CardDescription>
					</div>
					<Badge variant="secondary" className="shrink-0">
						Optional
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<ItemGroup className="gap-0">
					<Item variant="muted" className="p-4">
						<ItemContent>
							<ItemTitle className="line-clamp-none text-sm">
								Best used for
							</ItemTitle>
							<div className="space-y-2 text-sm leading-relaxed text-foreground">
								<p>
									Open it if you are second-guessing scope, user,
									prioritization, or how to decide what the real v1 should be.
								</p>
								<p>
									Do not pause the sprint to binge it. Start Here still comes
									first.
								</p>
							</div>
						</ItemContent>
					</Item>
				</ItemGroup>
				<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
					<Button asChild variant="outline" size="sm">
						<a
							href={productConfig.bonusPlaylistUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							Open YouTube playlist
						</a>
					</Button>
					<p className="text-sm leading-relaxed text-foreground/85">
						Keep moving through the sprint. This is here when you need clearer
						product judgment.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
