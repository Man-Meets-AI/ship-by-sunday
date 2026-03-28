"use client";

import Link from "next/link";
import type { PacketStageProgressItem } from "@/features/packet-flow/lib/packet-stage-progress";
import {
	getPacketStageStepHref,
	type RoutedPacketStageId,
} from "@/features/packet-flow/lib/packet-stage-routes";
import { cn } from "@/lib/utils";

export function PacketStageStepStrip({
	stageId,
	activeStepId,
	progressItems,
	onLinkNavigate,
	onNavigate,
}: {
	stageId: RoutedPacketStageId;
	activeStepId: string;
	progressItems: PacketStageProgressItem[];
	onLinkNavigate: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate: (href: string) => void;
}) {
	return (
		<div className="space-y-3">
			<div className="sm:hidden">
				<label htmlFor={`${stageId}-packet-page-select`} className="sr-only">
					Page
				</label>
				<select
					id={`${stageId}-packet-page-select`}
					value={activeStepId}
					onChange={(event) =>
						onNavigate(getPacketStageStepHref(stageId, event.target.value))
					}
					className="h-12 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm font-medium outline-none transition-colors focus:border-foreground/50"
				>
					{progressItems.map((item) => (
						<option key={item.id} value={item.id}>
							{`${item.stepNumber}. ${item.label}`}
						</option>
					))}
				</select>
			</div>

			<div className="hidden items-center gap-5 sm:flex">
				{progressItems.map((item, index) => (
					<div key={item.id} className="flex items-center gap-5">
						<Link
							href={getPacketStageStepHref(stageId, item.id)}
							aria-current={item.state === "active" ? "page" : undefined}
							onNavigate={(event) =>
								onLinkNavigate(event, getPacketStageStepHref(stageId, item.id))
							}
							onClick={(event) => {
								if (event.defaultPrevented) {
									return;
								}

								event.preventDefault();
								onNavigate(getPacketStageStepHref(stageId, item.id));
							}}
							className={cn(
								"group flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] transition-all",
								item.state === "active"
									? "text-foreground"
									: "text-muted-foreground/40 hover:text-foreground/70",
							)}
						>
							<span
								className={cn(
									"flex size-5 items-center justify-center rounded-md border text-[0.6rem] transition-colors",
									item.state === "active"
										? "border-foreground bg-foreground text-background shadow-sm"
										: item.state === "complete"
											? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
											: "border-border bg-muted/30 text-muted-foreground/60 group-hover:border-foreground/30",
								)}
							>
								{item.state === "complete" ? "✓" : item.stepNumber}
							</span>
							<span
								className={cn(
									"underline-offset-4 group-hover:underline",
									item.state === "active" ? "underline" : "",
								)}
							>
								{item.label}
							</span>
						</Link>
						{index < progressItems.length - 1 && (
							<div className="h-px w-4 bg-border/40" />
						)}
					</div>
				))}
			</div>
		</div>
	);
}
