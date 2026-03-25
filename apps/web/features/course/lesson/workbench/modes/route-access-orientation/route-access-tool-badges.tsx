import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const TOOL_BADGES = ["Codex", "Clerk", "product access", "page.tsx"] as const;

export function RouteAccessToolBadges() {
	return (
		<Card>
			<CardHeader className="space-y-3 pb-3">
				<CardTitle className="text-base font-semibold">
					Anchors in this template
				</CardTitle>
				<CardDescription>
					Use these hooks when you read code or talk to Codex.
				</CardDescription>
				<div className="flex flex-wrap gap-2">
					{TOOL_BADGES.map((label) => (
						<Badge key={label} variant="secondary" className="font-normal">
							{label}
						</Badge>
					))}
				</div>
				<p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
					<KbdGroup className="inline-flex gap-1">
						<Kbd>Ctrl</Kbd>
						<Kbd>M</Kbd>
					</KbdGroup>
					<span>
						toggles the agent sidebar in many setups—use your editor’s shortcut
						if different.
					</span>
				</p>
			</CardHeader>
		</Card>
	);
}
