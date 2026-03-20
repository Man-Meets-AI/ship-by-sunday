import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const TOOL_BADGES = [
	"Codex",
	"Clerk",
	"entitlements",
	"page.tsx",
	"Control+M",
] as const;

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
				<p className="text-xs text-muted-foreground">
					<code className="rounded bg-muted px-1">Control+M</code> toggles the
					agent sidebar in many setups—use your editor’s shortcut if different.
				</p>
			</CardHeader>
		</Card>
	);
}
