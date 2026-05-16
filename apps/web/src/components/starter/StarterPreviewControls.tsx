"use client";

import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { StarterPreviewDesignPicker } from "./StarterPreviewDesignPicker";
import { StarterPreviewFoundationFields } from "./StarterPreviewFoundationFields";
import { StarterPreviewPricingPicker } from "./StarterPreviewPricingPicker";
import type {
	StarterPreviewDraft,
	StarterPreviewSection,
	StarterPreviewSectionRow,
} from "./StarterPreviewTypes";

export function StarterPreviewControls({
	section,
	draft,
	generatedPreviewSection,
}: {
	readonly section: StarterPreviewSection;
	readonly draft: StarterPreviewDraft;
	readonly generatedPreviewSection: StarterPreviewSectionRow | null;
}) {
	return (
		<div
			className="overflow-hidden rounded-lg border border-border/70 bg-background/80 text-card-foreground shadow-xs/5"
			data-testid="starter-preview-controls"
		>
			<div className="flex items-start gap-3 border-b border-border/60 px-3 py-3 sm:justify-between sm:px-4">
				<div>
					<p className="text-sm font-semibold text-foreground">
						Answer the first brief
					</p>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						Three answers become the source truth Starter carries into the
						workspace.
					</p>
				</div>
				<span className="mt-0.5 w-fit shrink-0 rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
					2 min
				</span>
			</div>
			<div>
				<PreviewControlGroup
					index={1}
					title="Product facts"
					className="border-b border-border/60"
				>
					<StarterPreviewFoundationFields section={section} draft={draft} />
				</PreviewControlGroup>
				<div className="grid border-b border-border/60 lg:grid-cols-2 lg:divide-x lg:divide-border/60">
					<PreviewControlGroup index={2} title="Design DNA">
						<StarterPreviewDesignPicker section={section} draft={draft} />
					</PreviewControlGroup>
					<PreviewControlGroup index={3} title="Pricing first pass">
						<StarterPreviewPricingPicker section={section} draft={draft} />
					</PreviewControlGroup>
				</div>
				{generatedPreviewSection ? (
					<div
						className="hidden bg-muted/15 px-3 py-3 sm:block sm:px-4"
						data-testid="codebase-demo-section-generated-preview"
					>
						<div className="flex items-start gap-3">
							<span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-border/70 font-mono text-xs text-muted-foreground">
								4
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold text-foreground">
									{generatedPreviewSection.label}
								</p>
								<p
									className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted-foreground"
									data-testid="codebase-demo-locked-generated-preview"
								>
									<LockKeyhole
										className="mt-0.5 size-3.5 shrink-0"
										aria-hidden
									/>
									<span>
										<span className="font-medium text-foreground/75">
											After checkout:
										</span>{" "}
										{generatedPreviewSection.description}
									</span>
								</p>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

function PreviewControlGroup({
	index,
	title,
	className,
	children,
}: {
	readonly index: number;
	readonly title: string;
	readonly className?: string;
	readonly children: ReactNode;
}) {
	return (
		<section className={cn("min-w-0 px-3 py-3 sm:px-4", className)}>
			<div className="mb-3 flex items-center gap-2">
				<span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border/70 font-mono text-[0.7rem] text-muted-foreground">
					{index}
				</span>
				<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			</div>
			{children}
		</section>
	);
}
