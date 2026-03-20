import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FreshTemplatePlanTabsPanel() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">How you ask</CardTitle>
				<CardDescription>
					Same intent, two entry points—pick the one you are using in Codex.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="plan_mode">
					<TabsList variant="line" className="w-full justify-start">
						<TabsTrigger value="plan_mode">Plan mode</TabsTrigger>
						<TabsTrigger value="manual">Manual plan</TabsTrigger>
					</TabsList>
					<TabsContent value="plan_mode" className="mt-3 text-sm text-muted-foreground">
						<ul className="list-inside list-disc space-y-1.5">
							<li>Switch Codex to Plan mode so it proposes a plan before edits.</li>
							<li>
								Set reasoning depth in the composer (match the level you chose
								below).
							</li>
							<li>
								Paste the assembled prompt from the copy button, or type the same
								constraints inline.
							</li>
						</ul>
					</TabsContent>
					<TabsContent value="manual" className="mt-3 text-sm text-muted-foreground">
						<ul className="list-inside list-disc space-y-1.5">
							<li>
								In a normal thread, paste the assembled prompt from the copy
								button.
							</li>
							<li>
								Keep the “no code until approved” line in the body—you can edit
								the textarea to match how you talk.
							</li>
						</ul>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
