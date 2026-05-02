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
		>
			<div
				className="flex items-center gap-2 text-xs text-muted-foreground"
				data-testid={`blueprint-demo-locked-${sectionId}`}
			>
				<LockKeyhole className="size-3.5" aria-hidden />
				<span>Unlocks after checkout in the full Blueprint workspace.</span>
			</div>
		</BlueprintDemoSectionCard>
	);
}
