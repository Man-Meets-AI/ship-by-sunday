import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CeoSkillsCodexAnatomyCard() {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="space-y-1 border-b border-border pb-3">
				<CardTitle className="text-base font-semibold">
					What you should see in Codex
				</CardTitle>
				<CardDescription className="text-pretty text-sm">
					Match these spots while the video moves—names can vary slightly by version.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-3 pb-4">
				<ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
					<li>
						<span className="font-medium text-foreground">Left:</span> thread
						list and history
					</li>
					<li>
						<span className="font-medium text-foreground">New Thread</span> to
						start a fresh run
					</li>
					<li>
						<span className="font-medium text-foreground">Projects / folders</span>{" "}
						area for workspaces
					</li>
					<li>
						Example project such as{" "}
						<span className="font-medium text-foreground">Team Wiki</span> to
						orient the layout
					</li>
				</ul>
			</CardContent>
		</Card>
	);
}
