import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CodexMarketingSiteHandoffCard() {
	return (
		<Card className="border-dashed bg-muted/15">
			<CardHeader className="space-y-1">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					Next lesson (heads-up)
				</CardTitle>
				<CardDescription className="text-xs leading-relaxed">
					You will move into core UX work—expect to sketch flows on paper or a
					board before touching more product UI. Finish this marketing pass
					first.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
