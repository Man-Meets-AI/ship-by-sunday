"use client";

import { CheckCircle2, MessageSquareText, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { HomePageContent } from "@/app/_content/home-page";

type ProductPreviewLoopPacket =
	HomePageContent["productPreviewSection"]["loopPacket"];

export function ProductPreviewLoopPacketBlock({
	loopPacket,
}: {
	readonly loopPacket: ProductPreviewLoopPacket;
}) {
	return (
		<div className="grid gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
			<div className="rounded-lg border border-border/60 bg-muted/25 p-4">
				<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
					<MessageSquareText className="size-3.5" aria-hidden />
					{loopPacket.input.label}
				</div>
				<p className="mt-3 text-base font-semibold leading-tight text-foreground">
					{loopPacket.input.title}
				</p>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					{loopPacket.input.body}
				</p>
			</div>
			<div className="rounded-lg border border-border/60 bg-background p-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
							<Workflow className="size-3.5" aria-hidden />
							{loopPacket.role.label}
						</div>
						<p className="mt-3 text-base font-semibold text-foreground">
							{loopPacket.role.title}
						</p>
					</div>
					<Badge variant="outline">{loopPacket.role.status}</Badge>
				</div>
				<ul className="mt-4 space-y-2">
					{loopPacket.role.items.map((item) => (
						<li key={item} className="flex gap-2 text-sm leading-5">
							<CheckCircle2
								className="mt-0.5 size-4 shrink-0 text-foreground"
								aria-hidden
							/>
							<span className="text-muted-foreground">{item}</span>
						</li>
					))}
				</ul>
			</div>
			<div className="rounded-lg border border-border/60 bg-background p-4 lg:col-span-2">
				<p className="text-xs font-semibold text-muted-foreground uppercase">
					{loopPacket.output.label}
				</p>
				<div className="mt-3 grid gap-3 sm:grid-cols-3">
					{loopPacket.output.items.map((item) => (
						<div key={item.label} className="border-t border-border/50 pt-3">
							<p className="text-sm font-semibold text-foreground">
								{item.label}
							</p>
							<p className="mt-1 text-xs leading-5 text-muted-foreground">
								{item.detail}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
