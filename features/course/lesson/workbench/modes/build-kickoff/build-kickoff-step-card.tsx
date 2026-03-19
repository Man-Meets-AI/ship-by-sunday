import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
				<p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
					{helper}
				</p>
				<Badge
					variant="outline"
					className={cn(
						"shrink-0 font-mono text-[9px] uppercase tracking-wider",
						active && "border-primary/30 text-primary",
						complete && !active && "text-foreground",
						!active && !complete && "text-muted-foreground",
					)}
				>
					{statusLabel}
				</Badge>
			</div>
			{active ? <div className="mt-3">{children}</div> : null}
			{!active && complete ? (
				<Card className="mt-3 gap-0 py-0">
					<CardContent className="flex items-center justify-between gap-3 py-3">
						<p className="text-xs leading-relaxed text-foreground">{summary}</p>
						{onEdit ? (
							<Button
								type="button"
								onClick={onEdit}
								variant="outline"
								size="sm"
							>
								Edit
							</Button>
						) : null}
					</CardContent>
				</Card>
			) : null}
			{!active && !complete ? (
				<Alert className="mt-3">
					<AlertDescription className="text-xs leading-relaxed">
						{lockedMessage ?? "Complete the previous step to continue."}
					</AlertDescription>
				</Alert>
			) : null}
		</WorkbenchCard>
	);
}
