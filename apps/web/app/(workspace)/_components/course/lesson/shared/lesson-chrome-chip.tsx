import { Check, Circle, CircleDot, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type LessonChromeChipStatus = "completed" | "active" | "ready" | "locked";

const statusVariant: Record<
	LessonChromeChipStatus,
	"default" | "secondary" | "outline"
> = {
	completed: "secondary",
	active: "default",
	ready: "outline",
	locked: "secondary",
};

function LessonChromeChipIcon({ status }: { status: LessonChromeChipStatus }) {
	if (status === "completed") {
		return <Check aria-hidden />;
	}
	if (status === "active") {
		return <CircleDot aria-hidden />;
	}
	if (status === "ready") {
		return <Circle aria-hidden />;
	}
	return <Lock aria-hidden />;
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
		<Badge variant={statusVariant[status]} className={className}>
			{label}
			<LessonChromeChipIcon status={status} />
		</Badge>
	);
}
