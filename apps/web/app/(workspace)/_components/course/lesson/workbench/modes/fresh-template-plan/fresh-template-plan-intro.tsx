import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FreshTemplatePlanIntro() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Goal</CardTitle>
				<CardDescription>
					Create a fresh-template implementation plan in Codex before you write
					production code. The artifact for this lesson is the plan—not a built
					app.
				</CardDescription>
				<div className="flex flex-wrap gap-2 border-t border-border pt-4">
					<Badge variant="secondary">Codex</Badge>
					<Badge variant="secondary">Convex</Badge>
					<Badge variant="secondary">Next.js</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert>
					<AlertTitle>Plan first</AlertTitle>
					<AlertDescription>
						This lesson&apos;s output is a reviewed plan—not application code.
						Don&apos;t implement until you approve the plan with your agent.
					</AlertDescription>
				</Alert>
				<Separator />
				<div className="space-y-3">
					<div className="space-y-1">
						<div className="text-base font-semibold leading-none">
							How you ask
						</div>
						<p className="text-sm text-muted-foreground">
							Same intent, two entry points—pick the one you are using in Codex.
						</p>
					</div>
					<Tabs defaultValue="plan_mode">
						<TabsList className="w-full justify-start">
							<TabsTrigger value="plan_mode">Plan mode</TabsTrigger>
							<TabsTrigger value="manual">Manual plan</TabsTrigger>
						</TabsList>
						<TabsContent
							value="plan_mode"
							className="mt-3 text-sm text-muted-foreground"
						>
							<ul className="list-inside list-disc space-y-1.5">
								<li>
									Switch Codex to Plan mode so it proposes a plan before edits.
								</li>
								<li>
									Set reasoning depth in the composer (match the level you chose
									below).
								</li>
								<li>
									Paste the assembled prompt from the copy button, or type the
									same constraints inline.
								</li>
							</ul>
						</TabsContent>
						<TabsContent
							value="manual"
							className="mt-3 text-sm text-muted-foreground"
						>
							<ul className="list-inside list-disc space-y-1.5">
								<li>
									In a normal thread, paste the assembled prompt from the copy
									button.
								</li>
								<li>
									Keep the “no code until approved” line in the body—you can
									edit the textarea to match how you talk.
								</li>
							</ul>
						</TabsContent>
					</Tabs>
				</div>
				<Separator />
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="mac-path">
						<AccordionTrigger className="text-sm font-medium">
							Copy a folder path on macOS
						</AccordionTrigger>
						<AccordionContent className="text-sm text-muted-foreground">
							In Finder, right-click the folder, hold{" "}
							<kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs">
								Option
							</kbd>
							, then choose <strong>Copy … as Pathname</strong>. Paste that path
							into Reference codebase path above.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}
