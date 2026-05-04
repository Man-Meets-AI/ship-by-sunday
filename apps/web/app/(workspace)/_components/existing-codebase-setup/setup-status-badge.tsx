import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SetupCheckStatus } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";

const statusConfig = {
	blocked: {
		label: "blocked",
		icon: AlertTriangle,
		className: "border-destructive/30 bg-destructive/10 text-destructive",
	},
	warning: {
		label: "warning",
		icon: CircleDashed,
		className:
			"border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
	},
	ready: {
		label: "ready",
		icon: CheckCircle2,
		className:
			"border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
	},
} as const;

export function SetupStatusBadge({
	status,
	className,
}: {
	status: SetupCheckStatus;
	className?: string;
}) {
	const config = statusConfig[status];
	const Icon = config.icon;

	return (
		<span
			className={cn(
				"inline-flex h-6 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium",
				config.className,
				className,
			)}
		>
			<Icon className="size-3.5" aria-hidden />
			{config.label}
		</span>
	);
}
