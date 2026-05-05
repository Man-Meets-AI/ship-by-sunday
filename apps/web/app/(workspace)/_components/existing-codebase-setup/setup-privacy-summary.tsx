import { ShieldCheck } from "lucide-react";

import type { setupPrivacyDefaults } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";

type PrivacyDefault = (typeof setupPrivacyDefaults)[number];

export function SetupPrivacySummary({
	defaults,
}: {
	defaults: readonly PrivacyDefault[];
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-4">
			<div className="flex items-start gap-3">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
					<ShieldCheck className="size-4" aria-hidden />
				</span>
				<div>
					<h2 className="text-sm font-semibold text-foreground">
						Privacy and sync defaults
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						Local mode runs against your repo on your machine. Ship by Sunday
						only stores approved structured state.
					</p>
				</div>
			</div>
			<div className="mt-4 divide-y divide-border/60">
				{defaults.map((item) => (
					<div
						key={item.id}
						className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8rem_minmax(0,1fr)]"
					>
						<div>
							<div className="text-sm font-medium text-foreground">
								{item.label}
							</div>
							<div className="mt-1 text-xs font-medium text-muted-foreground">
								{item.value}
							</div>
						</div>
						<p className="text-sm leading-6 text-muted-foreground">
							{item.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
