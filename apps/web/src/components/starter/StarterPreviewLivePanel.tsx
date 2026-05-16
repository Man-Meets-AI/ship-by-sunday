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
			className="rounded-lg bg-foreground text-background shadow-xs/10"
			data-testid="starter-preview-live-panel"
		>
			<div className="border-b border-background/10 p-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-sm font-semibold text-background">
							Starter source truth
						</p>
						<p className="mt-1 text-sm leading-6 text-background/65">
							What your checkout hands to the workspace.
						</p>
					</div>
					<div className="rounded-full border border-background/15 bg-background/10 px-2.5 py-1 text-xs font-medium text-background">
						{offerPriceDisplay}
					</div>
				</div>
			</div>
			<div className="space-y-4 p-4">
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-background/55">
						Idea
					</p>
					<h3
						className="mt-2 text-2xl font-semibold leading-tight text-background"
						data-testid="starter-preview-live-product-name"
					>
						{productName}
					</h3>
					<p className="mt-2 text-sm leading-6 text-background/65">
						{productSummary}
					</p>
				</div>
				<div className="divide-y divide-background/10 overflow-hidden rounded-lg border border-background/10 bg-background/8">
					<LiveMetric label="Primary user" value={primaryUser} />
					<LiveMetric
						label="Pricing"
						value={`$${price} ${pricingModelSuffix[draft.fields.pricing_model]}`}
					/>
					<LiveMetric
						label="Design DNA"
						value={selectedPreset?.label ?? "T3 Code"}
					/>
					<LiveMetric
						label="Visual system"
						value={selectedPreset?.category ?? "Software"}
					/>
				</div>
				<div className="rounded-lg border border-background/10 bg-background/8 p-3">
					<div className="flex items-start gap-3">
						<FileCode2 className="mt-0.5 size-4 shrink-0 text-background/60" />
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-background">
								Repo promise
							</p>
							<p className="mt-1 text-xs leading-5 text-background/65">
								Source facts, Program, ExecPlans, template app, and guided
								videos unlock after checkout.
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2 rounded-lg border border-background/10 bg-background/8 px-3 py-2 text-xs leading-5 text-background/65">
					<Database className="size-3.5 shrink-0" aria-hidden />
					<span className="min-w-0 flex-1">
						Saved locally before Stripe opens.
					</span>
					<ArrowRight className="size-3.5 shrink-0" aria-hidden />
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
		<div className="grid min-w-0 gap-1 px-3 py-2.5">
			<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-background/55">
				{label}
			</p>
			<p className="text-sm font-medium leading-5 text-background">{value}</p>
		</div>
	);
}
