"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PacketStageProgressItem } from "@/features/packet-flow/lib/packet-stage-progress";
import {
	getPacketStageStepHref,
	type RoutedPacketStageId,
} from "@/features/packet-flow/lib/packet-stage-routes";
import { cn } from "@/lib/utils";

function getPacketStepTone(item: PacketStageProgressItem) {
	if (item.state === "active") {
		return "border-foreground bg-foreground text-background";
	}
	if (item.state === "complete") {
		return "border-border/70 bg-muted/35 text-foreground";
	}
	return "border-border/60 bg-background text-muted-foreground hover:text-foreground";
}

export function PacketStageStepStrip({
	stageId,
	activeStepId,
	progressItems,
}: {
	stageId: RoutedPacketStageId;
	activeStepId: string;
	progressItems: PacketStageProgressItem[];
}) {
	const router = useRouter();

	return (
		<div className="space-y-4">
			<div className="sm:hidden">
				<label htmlFor={`${stageId}-packet-page-select`} className="sr-only">
					Page
				</label>
				<select
					id={`${stageId}-packet-page-select`}
					value={activeStepId}
					onChange={(event) =>
						router.push(getPacketStageStepHref(stageId, event.target.value))
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

			<div
				className="hidden gap-2 sm:grid"
				style={{
					gridTemplateColumns: `repeat(${progressItems.length}, minmax(0, 1fr))`,
				}}
			>
				{progressItems.map((item) => (
					<Link
						key={item.id}
						href={getPacketStageStepHref(stageId, item.id)}
						aria-current={item.state === "active" ? "page" : undefined}
						className={cn(
							"group relative min-w-0 rounded-2xl border px-4 py-4 transition-colors",
							getPacketStepTone(item),
						)}
					>
						<span
							className={cn(
								"text-[0.72rem] tracking-[0.2em]",
								item.state === "active"
									? "text-background/70"
									: "text-muted-foreground",
							)}
						>
							{String(item.stepNumber).padStart(2, "0")}
						</span>
						<p className="mt-2 text-base font-semibold leading-tight">
							{item.label}
						</p>
						{item.stepNumber < progressItems.length ? (
							<span
								aria-hidden="true"
								className={cn(
									"absolute top-1/2 left-full hidden h-px w-2 -translate-y-1/2 sm:block",
									item.state === "active" ? "bg-foreground" : "bg-border/60",
								)}
							/>
						) : null}
					</Link>
				))}
			</div>
		</div>
	);
}
