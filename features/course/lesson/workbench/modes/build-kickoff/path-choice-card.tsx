"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getChoiceClass(selected: boolean, invalid: boolean, disabled = false) {
	if (disabled) {
		return "border-border/60 bg-muted/30 text-muted-foreground opacity-80";
	}

	if (selected) {
		return "border-primary/40 bg-primary/5 text-foreground";
	}

	if (invalid) {
		return "border-destructive/40 bg-destructive/5 text-foreground";
	}

	return "border-border bg-card text-foreground";
}

export function PathChoiceCard({
	currentPath,
	invalid,
	templateRepoUrl,
	templateLockedReason,
	onChoosePath,
}: {
	currentPath: string | null;
	invalid: boolean;
	templateRepoUrl: string | null;
	templateLockedReason: string | null;
	onChoosePath: (path: "Use template" | "Custom path") => void;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card
				className={cn(
					"gap-0 border py-0 ring-0",
					getChoiceClass(
						currentPath === "Use template",
						invalid,
						!templateRepoUrl,
					),
				)}
			>
				<CardContent className="px-4 py-4">
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Use template repo
					</CardTitle>
					<p className="mt-3 text-[15px] font-semibold leading-[1.4] text-foreground">
						Start from the shared setup and move straight into implementation.
					</p>
					<p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
						Best when you want setup handled so you can focus on the first real
						slice.
					</p>
					<div className="mt-3 flex flex-wrap items-center gap-2">
						<Button
							type="button"
							onClick={() => onChoosePath("Use template")}
							disabled={!templateRepoUrl}
							variant="secondary"
							size="sm"
						>
							Choose template
						</Button>
						{templateRepoUrl ? (
							<Button asChild variant="outline" size="sm">
								<a
									href={templateRepoUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									Open template
								</a>
							</Button>
						) : null}
					</div>
					{!templateRepoUrl ? (
						<p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
							{templateLockedReason}
						</p>
					) : null}
				</CardContent>
			</Card>
			<Card
				className={cn(
					"gap-0 border py-0 ring-0",
					getChoiceClass(currentPath === "Custom path", invalid),
				)}
			>
				<CardContent className="px-4 py-4">
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Use your current repo
					</CardTitle>
					<p className="mt-3 text-[15px] font-semibold leading-[1.4] text-foreground">
						Keep your existing stack and scope the prompt to your current
						codebase.
					</p>
					<p className="mt-3 text-[13px] leading-[1.7] text-muted-foreground">
						Best when you already have a starter, an existing repo, or a stack
						you need to preserve.
					</p>
					<div className="mt-3">
						<Button
							type="button"
							onClick={() => onChoosePath("Custom path")}
							variant="outline"
							size="sm"
						>
							Choose custom path
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function PathChoiceValidationMessage({ invalid }: { invalid: boolean }) {
	if (!invalid) {
		return null;
	}

	return (
		<p className="mt-3 text-[12px] font-medium leading-[1.6] text-destructive">
			Choose a starting path before continuing.
		</p>
	);
}
