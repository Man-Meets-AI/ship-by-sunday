import { WorkbenchCard } from "../../shared/workbench-card";

type ScopeContextCardProps = {
	chosenUser: string | null;
	chosenProblem: string | null;
	promisedOutcome: string | null;
	coreFlowImageUrl: string | null;
};

export function ScopeContextCard({
	chosenUser,
	chosenProblem,
	promisedOutcome,
	coreFlowImageUrl,
}: ScopeContextCardProps) {
	if (!chosenUser && !promisedOutcome && !coreFlowImageUrl) {
		return null;
	}

	return (
		<WorkbenchCard label="Scope against this">
			<div className="space-y-3">
				<p className="text-sm leading-relaxed text-foreground">
					Use the saved user, promise, and core flow as the cut line. If a
					feature does not help this exact flow happen by Sunday, cut it.
				</p>
				<div className="grid gap-2 lg:grid-cols-2">
					<div className="border border-border bg-muted/30 px-3 py-3">
						<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
							User
						</p>
						<p className="mt-1 text-sm leading-snug text-foreground">
							{chosenUser ?? "Use your saved user from 1.2."}
						</p>
						{chosenProblem ? (
							<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
								Problem: {chosenProblem}
							</p>
						) : null}
					</div>
					<div className="border border-border bg-muted/30 px-3 py-3">
						<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
							Promise
						</p>
						<p className="mt-1 text-sm leading-snug text-foreground">
							{promisedOutcome ?? "Use your saved outcome from 1.3."}
						</p>
					</div>
				</div>
				{coreFlowImageUrl ? (
					<div className="border border-border bg-muted/30 p-2">
						<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
							<div>
								<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
									Saved core flow
								</p>
								<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
									Keep only what this flow needs to reach the promised win.
								</p>
							</div>
							<span className="inline-flex items-center border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
								Use 1.5 as the cut line
							</span>
						</div>
						<img
							src={coreFlowImageUrl}
							alt="Saved core flow from lesson 1.5"
							className="w-full border border-input bg-background object-contain"
							loading="lazy"
						/>
					</div>
				) : null}
			</div>
		</WorkbenchCard>
	);
}
