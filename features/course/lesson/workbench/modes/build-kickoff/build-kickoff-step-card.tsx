import { Button } from "@/components/ui/button";
import { WorkbenchCard } from "../../shared/workbench-card";

type BuildKickoffStepCardProps = {
	step: 1 | 2 | 3;
	title: string;
	helper: string;
	active: boolean;
	complete: boolean;
	summary?: string;
	lockedMessage?: string;
	onEdit?: () => void;
	children?: React.ReactNode;
};

export function BuildKickoffStepCard({
	step,
	title,
	helper,
	active,
	complete,
	summary,
	lockedMessage,
	onEdit,
	children,
}: BuildKickoffStepCardProps) {
	const statusLabel = active ? "Active" : complete ? "Done" : "Locked";

	return (
		<WorkbenchCard label={`Step ${step}: ${title}`}>
			<div className="flex items-start justify-between gap-3">
				<p className="max-w-2xl text-xs leading-relaxed text-product-muted">
					{helper}
				</p>
				<span
					className={`font-mono text-[9px] uppercase tracking-[0.18em] ${
						active
							? "text-product-accent"
							: complete
								? "text-product-text"
								: "text-product-muted"
					}`}
				>
					{statusLabel}
				</span>
			</div>
			{active ? <div className="mt-3">{children}</div> : null}
			{!active && complete ? (
				<div className="mt-3 flex items-center justify-between gap-3 border border-product-border/60 bg-product-surface px-3 py-2">
					<p className="text-[11px] leading-relaxed text-product-text">
						{summary}
					</p>
					{onEdit ? (
						<Button type="button" onClick={onEdit} variant="outline" size="xs">
							Edit
						</Button>
					) : null}
				</div>
			) : null}
			{!active && !complete ? (
				<div className="mt-3 border border-product-border/60 bg-product-surface px-3 py-2">
					<p className="text-[11px] leading-relaxed text-product-muted">
						{lockedMessage ?? "Complete the previous step to continue."}
					</p>
				</div>
			) : null}
		</WorkbenchCard>
	);
}
