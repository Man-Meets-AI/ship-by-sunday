import { Check, Circle, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LessonChromeChipStatus = "completed" | "active" | "ready" | "locked";

const statusVariant: Record<
	LessonChromeChipStatus,
	"default" | "secondary" | "outline"
> = {
	completed: "secondary",
	active: "default",
	ready: "outline",
	locked: "outline",
};

function LessonChromeChipIcon({ status }: { status: LessonChromeChipStatus }) {
	if (status === "completed") {
		return <Check className="size-3" aria-hidden />;
	}
	if (status === "active") {
		return (
			<span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
		);
	}
	if (status === "ready") {
		return <Circle className="size-2.5 stroke-2" aria-hidden />;
	}
	return <Lock className="size-3 opacity-70" aria-hidden />;
}

export function LessonChromeChip({
	status,
	label,
	className,
}: {
	status: LessonChromeChipStatus;
	label: string;
	className?: string;
}) {
	return (
		<Badge
			variant={statusVariant[status]}
			className={cn(
				"h-auto min-h-5 rounded-md py-0.5 font-mono text-[9px] uppercase tracking-wider",
				status === "active" &&
					"border-primary/30 bg-primary/10 text-primary ring-1 ring-primary/20",
				status === "ready" && "border-border bg-muted/40",
				status === "locked" &&
					"border-border bg-muted/30 text-muted-foreground opacity-80",
				className,
			)}
		>
			<span>{label}</span>
			<LessonChromeChipIcon status={status} />
		</Badge>
	);
}
