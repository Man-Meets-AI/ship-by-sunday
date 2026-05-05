import type { WorkspaceSetupSection } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";
import { SetupCheckRow } from "./setup-check-row";
import { SetupStatusBadge } from "./setup-status-badge";

export function SetupReadinessSection({
	section,
}: {
	section: WorkspaceSetupSection;
}) {
	return (
		<section
			aria-labelledby={`setup-section-${section.id}`}
			className="overflow-hidden rounded-xl border border-border/60 bg-background"
		>
			<div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
				<div>
					<h2
						id={`setup-section-${section.id}`}
						className="text-base font-semibold text-foreground"
					>
						{section.title}
					</h2>
					<p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
						{section.summary}
					</p>
				</div>
				<SetupStatusBadge status={section.status} />
			</div>
			<ul>
				{section.rows.map((row) => (
					<SetupCheckRow key={row.id} row={row} />
				))}
			</ul>
		</section>
	);
}
