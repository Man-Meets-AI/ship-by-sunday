"use client";

import { Check, Circle, CircleDot, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AppShellBlock } from "@/features/course/shared/utils/app-shell-navigation";
import { getAppShellBlockNavigationTarget } from "@/features/course/shared/utils/app-shell-navigation";

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

type AppShellMissionRailShadcnProps = {
	blocks: Array<AppShellBlock & { label: string }>;
	blockStatuses: Map<string, AppShellBlockStatus>;
	activeBlockId: string | undefined;
};

export function AppShellMissionRailShadcn({
	blocks,
	blockStatuses,
	activeBlockId,
}: AppShellMissionRailShadcnProps) {
	const router = useRouter();
	const toggleValue =
		typeof activeBlockId === "string" &&
		blocks.some((b) => b.id === activeBlockId)
			? activeBlockId
			: undefined;

	return (
		<div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
			<Card className="pointer-events-auto relative z-0 gap-0 rounded-full border-0 bg-muted/30 py-1.5 pr-2 pl-2.5 shadow-none ring-1 ring-border/60 dark:bg-muted/20">
				<span
					aria-hidden
					className="absolute top-1/2 right-4 left-4 -z-10 h-px -translate-y-1/2 bg-border/45"
				/>
				<ToggleGroup
					type="single"
					variant="outline"
					size="sm"
					spacing={0}
					value={toggleValue}
					onValueChange={(value) => {
						if (!value) {
							return;
						}
						const block = blocks.find((b) => b.id === value);
						if (!block) {
							return;
						}
						const target = getAppShellBlockNavigationTarget(block);
						if (target) {
							router.push(target.href, { scroll: false });
						}
					}}
					className="relative z-10 flex flex-wrap items-center justify-center gap-x-0.5 rounded-full border-0 bg-transparent p-0 shadow-none"
					aria-label="Course blocks"
				>
					{blocks.map((block) => {
						const status = (blockStatuses.get(block.id) ??
							"locked") as AppShellBlockStatus;
						const target = getAppShellBlockNavigationTarget(block);
						const label = (
							<span
								className={`inline-flex items-center gap-1.5 ${stepLabelClass}`}
							>
								{block.label}
								<BlockStatusIcon status={status} />
							</span>
						);

						return (
							<ToggleGroupItem
								key={block.id}
								value={block.id}
								disabled={!target}
								aria-label={`Open ${block.label}`}
								aria-current={block.id === activeBlockId ? "page" : undefined}
								className="h-7 gap-1.5 rounded-full px-2.5 data-[state=on]:border-primary/35 data-[state=on]:bg-primary/5 data-[state=on]:shadow-none data-[state=off]:border-transparent data-[state=off]:bg-transparent data-[state=off]:shadow-none"
							>
								{label}
							</ToggleGroupItem>
						);
					})}
				</ToggleGroup>
			</Card>
		</div>
	);
}
