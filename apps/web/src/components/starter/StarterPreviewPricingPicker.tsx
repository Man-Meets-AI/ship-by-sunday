"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { HomePageCodebasePricingModel } from "@/app/_components/home-page/sections/codebase-demo/home-page-codebase-draft-storage";

import type {
	StarterPreviewDraft,
	StarterPreviewSection,
} from "./StarterPreviewTypes";

const pricingModelLabelByValue: Record<HomePageCodebasePricingModel, string> = {
	one_time: "What's the one-time price in USD?",
	monthly: "What's the monthly price in USD?",
	yearly: "What's the yearly price in USD?",
};

const BLOCKED_NUMBER_KEYS = new Set(["e", "E", "+", "-"]);

export function StarterPreviewPricingPicker({
	section,
	draft,
}: {
	readonly section: StarterPreviewSection;
	readonly draft: StarterPreviewDraft;
}) {
	return (
		<div className="space-y-3">
			<div>
				<p className="text-sm font-medium text-foreground">
					{section.pricing.modelLabel}
				</p>
				<p className="mt-1 text-xs leading-5 text-muted-foreground">
					{section.pricing.priceHelperText}
				</p>
			</div>
			<div
				className="inline-flex rounded-lg border border-border/70 bg-muted/30 p-1"
				role="radiogroup"
				aria-label={section.pricing.modelLabel}
			>
				{section.pricing.modelOptions.map((option) => {
					const isSelected = option.value === draft.fields.pricing_model;
					return (
						<button
							key={option.value}
							type="button"
							role="radio"
							aria-checked={isSelected}
							aria-label={option.ariaLabel}
							data-testid={`codebase-demo-pricing-model-${option.value}`}
							onClick={() => draft.setPricingModel(option.value)}
							className={cn(
								"rounded-md px-3 py-1.5 text-sm transition-colors",
								isSelected
									? "bg-foreground text-background"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
			<label className="block">
				<span
					className="text-sm font-medium text-foreground"
					data-testid="codebase-demo-pricing-label"
				>
					{pricingModelLabelByValue[draft.fields.pricing_model]}
				</span>
				<span className="relative mt-1 block max-w-48">
					<span
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground"
					>
						$
					</span>
					<Input
						data-testid="codebase-demo-pricing-input"
						type="number"
						inputMode="decimal"
						min={0}
						step={0.01}
						value={draft.fields.pricing}
						placeholder={section.pricing.pricePlaceholder}
						onChange={(event) => draft.setPricing(event.target.value)}
						onKeyDown={(event) => {
							if (BLOCKED_NUMBER_KEYS.has(event.key)) {
								event.preventDefault();
							}
						}}
						inputClassName="pl-7"
					/>
				</span>
			</label>
		</div>
	);
}
