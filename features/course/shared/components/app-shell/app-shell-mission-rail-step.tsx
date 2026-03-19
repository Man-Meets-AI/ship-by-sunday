import { Check, Circle, CircleDot, Lock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
	AppShellBlock,
	AppShellBlockNavigationTarget,
} from "@/features/course/shared/utils/app-shell-navigation";

import type { AppShellBlockStatus } from "./app-shell-block-status";

function BlockStatusIcon({ status }: { status: AppShellBlockStatus }) {
	switch (status) {
		case "completed":
			return (
				<Check
					className="size-3 shrink-0 text-primary"
					strokeWidth={2.5}
					aria-hidden
				/>
			);
		case "active":
			return (
				<CircleDot className="size-3.5 shrink-0 text-primary" aria-hidden />
			);
		case "ready":
			return (
				<Circle
					className="size-3 shrink-0 text-muted-foreground"
					strokeWidth={2}
					aria-hidden
				/>
			);
		default:
			return (
				<Lock
					className="size-3 shrink-0 text-muted-foreground/70"
					strokeWidth={2}
					aria-hidden
				/>
			);
	}
}

const stepLabelClass =
	"text-[10px] font-semibold uppercase tracking-wider leading-none";

type AppShellMissionRailStepProps = {
	block: AppShellBlock & { label: string };
	status: AppShellBlockStatus;
	target: AppShellBlockNavigationTarget | null;
	activeBlockId: string | undefined;
};

export function AppShellMissionRailStep({
	block,
	status,
	target,
	activeBlockId,
}: AppShellMissionRailStepProps) {
	const label = (
		<>
			<span className={stepLabelClass}>{block.label}</span>
			<BlockStatusIcon status={status} />
		</>
	);

	const linkProps = {
		href: target?.href ?? "#",
		scroll: false as const,
		title: `Open ${block.label}`,
		"aria-label": `Open ${block.label}`,
		"aria-current": (block.id === activeBlockId ? "page" : undefined) as
			| "page"
			| undefined,
	};

	if (target) {
		if (status === "active") {
			return (
				<Badge
					asChild
					variant="outline"
					className="h-7 gap-1.5 rounded-full border-primary/35 bg-primary/5 px-2.5 shadow-none hover:bg-primary/10"
				>
					<Link {...linkProps} className="inline-flex items-center gap-1.5">
						{label}
					</Link>
				</Badge>
			);
		}

		if (status === "completed") {
			return (
				<Badge
					asChild
					variant="secondary"
					className="h-7 gap-1.5 rounded-full px-2.5 shadow-none"
				>
					<Link {...linkProps} className="inline-flex items-center gap-1.5">
						{label}
					</Link>
				</Badge>
			);
		}

		return (
			<Button
				asChild
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-foreground shadow-none"
			>
				<Link {...linkProps} className="inline-flex items-center gap-1.5">
					{label}
				</Link>
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled
			className="h-7 gap-1.5 px-2 text-muted-foreground shadow-none"
		>
			<span className="inline-flex items-center gap-1.5">{label}</span>
		</Button>
	);
}
