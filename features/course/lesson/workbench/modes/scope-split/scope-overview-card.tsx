import { WorkbenchCard } from "../../shared/workbench-card";

type ScopeOverviewCardProps = {
	keepCount: number;
	cutCount: number;
	rationaleReady: boolean;
	draftStatus: {
		label: string;
		detail: string;
		tone: "neutral" | "accent";
	};
	boundaryStatus: {
		label: string;
		detail: string;
		isReady: boolean;
	};
};

export function ScopeOverviewCard({
	keepCount,
	cutCount,
	rationaleReady,
	draftStatus,
	boundaryStatus,
}: ScopeOverviewCardProps) {
	const steps = [
		{
			title: "Keep the essentials",
			body: "Ordered list. Limit the v1 to the capabilities that must exist for the promised win.",
			status: `${keepCount}/5 named`,
		},
		{
			title: "Cut the tempting extras",
			body: "Name the features you want later so they stop sneaking into the weekend build.",
			status: `${cutCount} cuts`,
		},
		{
			title: "Defend the smaller version",
			body: "Write the shortest believable argument for why this still works for the user.",
			status: rationaleReady ? "Rationale ready" : "Still needed",
		},
	];

	return (
		<WorkbenchCard label="What this step does">
			<div className="space-y-4">
				<div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
					<div className="space-y-2">
						<p className="text-sm leading-relaxed text-foreground">
							Cut the product down to one believable weekend v1 before you write
							the brief.
						</p>
						<p className="text-[11px] leading-relaxed text-muted-foreground">
							The next step should be obvious: decide what stays, decide what
							goes, then explain why this smaller version is still enough.
						</p>
					</div>
					<div className="border border-border bg-muted/30 px-3 py-3">
						<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
							Current draft
						</p>
						<p
							className={`mt-2 text-sm leading-snug ${
								draftStatus.tone === "accent"
									? "text-primary"
									: "text-foreground"
							}`}
						>
							{draftStatus.label}
						</p>
						<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
							{draftStatus.detail}
						</p>
					</div>
				</div>

				<ol className="grid gap-2 md:grid-cols-3">
					{steps.map((step, index) => (
						<li
							key={step.title}
							className="border border-border bg-background px-3 py-3"
						>
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
								{String(index + 1).padStart(2, "0")}
							</p>
							<p className="mt-2 text-sm leading-snug text-foreground">
								{step.title}
							</p>
							<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
								{step.body}
							</p>
							<p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
								{step.status}
							</p>
						</li>
					))}
				</ol>

				<div className="flex flex-wrap items-start justify-between gap-3 border border-border bg-muted/30 px-3 py-3">
					<div>
						<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
							Next up in 1.7 Brief
						</p>
						<p className="mt-1 text-sm leading-snug text-foreground">
							These three fields become the saved scope boundary for the brief.
						</p>
						<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
							1.7 should read like one coherent v1, not another brainstorm.
						</p>
					</div>
					<div className="max-w-xs">
						<p
							className={`text-sm leading-snug ${
								boundaryStatus.isReady ? "text-primary" : "text-foreground"
							}`}
						>
							{boundaryStatus.label}
						</p>
						<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
							{boundaryStatus.detail}
						</p>
					</div>
				</div>
			</div>
		</WorkbenchCard>
	);
}
