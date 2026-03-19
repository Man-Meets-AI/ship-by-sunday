import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
	CAPTURE_ITEMS,
	FEATURE_LANGUAGE_PATTERN,
	getTextValue,
	type DefineOutcomePreviewLine,
} from "./define-outcome-support-helpers";

export function DefineOutcomeSupport({
	fieldValues,
}: {
	fieldValues: Record<string, unknown>;
}) {
	const outcome = getTextValue(fieldValues, "outcome");
	const successLooksLike = getTextValue(fieldValues, "success_looks_like");
	const differenceForUser = getTextValue(fieldValues, "difference_for_user");
	const outcomeLooksFeatureHeavy =
		outcome.length > 0 && FEATURE_LANGUAGE_PATTERN.test(outcome);
	const previewLines: DefineOutcomePreviewLine[] = [
		{
			label: "Promised outcome",
			filled: Boolean(outcome),
			value:
				outcome || "State the changed condition for the user in one sentence.",
		},
		{
			label: "Observable proof",
			filled: Boolean(successLooksLike),
			value:
				successLooksLike ||
				"Show what the user can now do or finish when this works.",
		},
		{
			label: "Pain removed",
			filled: Boolean(differenceForUser),
			value:
				differenceForUser ||
				"Describe what becomes easier or stops hurting for them.",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Outcomes, not features</CardTitle>
				<CardDescription>
					Define one promise you can pressure-test in{" "}
					<Badge variant="outline" className="mx-0.5 font-mono text-xs">
						1.6
					</Badge>
					. Aim for the user&apos;s changed state, not an app inventory.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-lg border bg-muted/30 p-4">
						<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
							Weak example
						</p>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							AI app that summarizes meetings, organizes notes, and generates
							next steps.
						</p>
					</div>
					<div className="rounded-lg border p-4">
						<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
							Stronger rewrite
						</p>
						<p className="mt-2 text-sm leading-relaxed text-foreground">
							Startup operators leave a meeting with a clean action summary they
							can review and send in minutes.
						</p>
					</div>
				</div>

				<Separator />

				<ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
					{CAPTURE_ITEMS.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>

				{outcomeLooksFeatureHeavy ? (
					<Alert>
						<AlertDescription>
							This draft still reads feature-heavy. Rewrite it as what changes
							for the user after the product works.
						</AlertDescription>
					</Alert>
				) : null}

				<Separator />

				<div>
					<h3 className="text-base font-medium">Your outcome preview</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						This is the promise{" "}
						<Badge variant="outline" className="mx-0.5 font-mono text-xs">
							1.6
						</Badge>{" "}
						will pressure-test next.
					</p>
					<div className="mt-4 divide-y rounded-lg border">
						{previewLines.map((line) => (
							<div key={line.label} className="space-y-1 p-4">
								<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
									{line.label}
								</p>
								<p
									className={
										line.filled
											? "text-sm leading-relaxed text-foreground"
											: "text-sm leading-relaxed text-muted-foreground"
									}
								>
									{line.value}
								</p>
							</div>
						))}
					</div>
					<p className="mt-3 text-xs text-muted-foreground">
						Next step: find evidence that this outcome matters in the real
						world, not just on paper.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
