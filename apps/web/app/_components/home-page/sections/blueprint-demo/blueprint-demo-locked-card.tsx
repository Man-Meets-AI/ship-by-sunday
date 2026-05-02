import { LockKeyhole } from "lucide-react";

import { BlueprintDemoSectionCard } from "./blueprint-demo-section-card";

export function BlueprintDemoLockedCard({
	sectionId,
	sectionNumber,
	label,
	description,
}: {
	readonly sectionId: string;
	readonly sectionNumber: number;
	readonly label: string;
	readonly description: string;
}) {
	return (
		<BlueprintDemoSectionCard
			sectionId={sectionId}
			sectionNumber={sectionNumber}
			label={label}
			description={description}
			tone="locked"
			hideDescription
		>
			<div
				className="flex items-start gap-2.5 rounded-lg border border-dashed border-border/60 bg-background/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground"
				data-testid={`blueprint-demo-locked-${sectionId}`}
				role="group"
				aria-label={`${label} (locked)`}
			>
				<LockKeyhole
					className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/80"
					aria-hidden
				/>
				<span>
					<span className="font-medium text-foreground/70">
						After checkout:
					</span>{" "}
					{description}
				</span>
			</div>
		</BlueprintDemoSectionCard>
	);
}
