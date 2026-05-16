import { ArrowRight, Database, FileCode2 } from "lucide-react";

import type {
	StarterPreviewDraft,
	StarterPreviewSection,
} from "./StarterPreviewTypes";

const pricingModelSuffix = {
	one_time: "one-time",
	monthly: "per month",
	yearly: "per year",
} as const;

export function StarterPreviewLivePanel({
	section,
	draft,
	offerPriceDisplay,
}: {
	readonly section: StarterPreviewSection;
	readonly draft: StarterPreviewDraft;
	readonly offerPriceDisplay: string;
}) {
	const selectedPreset =
		section.design.presets.find(
			(preset) => preset.id === draft.fields.design_preset_id,
		) ??
		section.design.presets.find(
			(preset) => preset.id === section.design.defaultPresetId,
		) ??
		section.design.presets[0];
	const productName =
		draft.fields.product_name.trim() ||
		section.foundation.fields.productName.placeholder ||
		"Your product";
	const productSummary =
		draft.fields.product_summary.trim() ||
		section.foundation.fields.productSummary.placeholder ||
		"A tight product promise goes here.";
	const primaryUser =
		draft.fields.primary_user.trim() ||
		section.foundation.fields.primaryUser.placeholder ||
		"First buyer";
	const price = draft.fields.pricing.trim() || section.pricing.defaultPrice;

	return (
		<aside
			className="overflow-hidden rounded-lg border border-border/70 bg-background text-foreground shadow-xs/5"
			data-testid="starter-preview-live-panel"
		>
			<div className="border-b border-border/60 bg-muted/30 px-3 py-3">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-sm font-semibold text-foreground">
							Live Starter preview
						</p>
						<p className="mt-1 text-xs leading-5 text-muted-foreground">
							What checkout hands to the workspace.
						</p>
					</div>
					<div className="whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
						{offerPriceDisplay}
					</div>
				</div>
			</div>
			<div className="p-3">
				<div className="overflow-hidden rounded-lg border border-border/70 bg-card">
					<div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-3 py-2">
						<div className="flex items-center gap-1.5">
							<span className="size-2 rounded-full bg-destructive/60" />
							<span className="size-2 rounded-full bg-warning/70" />
							<span className="size-2 rounded-full bg-success/70" />
						</div>
						<div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
							<span
								className="size-2.5 shrink-0 rounded-full"
								style={{
									backgroundColor: selectedPreset?.accentColor ?? undefined,
								}}
								aria-hidden
							/>
							<span className="truncate">
								{selectedPreset?.label ?? "T3 Code"} preview
							</span>
						</div>
					</div>
					<div className="p-3">
						<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
							Idea
						</p>
						<h3
							className="mt-2 text-xl font-semibold leading-tight text-foreground"
							data-testid="starter-preview-live-product-name"
						>
							{productName}
						</h3>
						<p className="mt-2 text-sm leading-5 text-muted-foreground">
							{productSummary}
						</p>
					</div>
				</div>
				<div className="mt-3 divide-y divide-border/60 overflow-hidden rounded-lg border border-border/70 bg-card">
					<LiveMetric label="Primary user" value={primaryUser} />
					<LiveMetric
						label="Pricing"
						value={`$${price} ${pricingModelSuffix[draft.fields.pricing_model]}`}
					/>
					<LiveMetric
						label="Design"
						value={`${selectedPreset?.label ?? "T3 Code"} / ${selectedPreset?.category ?? "Software"}`}
					/>
				</div>
				<div className="mt-3 grid gap-2">
					<div className="rounded-lg border border-border/70 bg-muted/15 px-3 py-2.5">
						<div className="flex items-start gap-2.5">
							<FileCode2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-foreground">
									Repo promise
								</p>
								<p className="mt-1 text-xs leading-5 text-muted-foreground max-sm:hidden">
									Source facts, Program, ExecPlans, template app, and guided
									videos unlock after checkout.
								</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/15 px-3 py-2 text-xs leading-5 text-muted-foreground">
						<Database className="size-3.5 shrink-0" aria-hidden />
						<span className="min-w-0 flex-1">
							Saved locally before Stripe opens.
						</span>
						<ArrowRight className="size-3.5 shrink-0" aria-hidden />
					</div>
				</div>
			</div>
		</aside>
	);
}

function LiveMetric({
	label,
	value,
}: {
	readonly label: string;
	readonly value: string;
}) {
	return (
		<div className="grid min-w-0 gap-1 px-3 py-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center">
			<p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
				{label}
			</p>
			<p className="break-words text-sm font-medium leading-5 text-foreground">
				{value}
			</p>
		</div>
	);
}
