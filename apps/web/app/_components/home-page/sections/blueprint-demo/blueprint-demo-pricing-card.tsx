"use client";

import { LayoutGroup, motion } from "motion/react";

import { Input } from "@/components/ui/input";
import type { HomePageContent } from "@/app/_content/home-page";
import { cn } from "@/lib/utils";

import { useBlueprintDemoReducedMotion } from "./blueprint-demo-motion";
import { BlueprintDemoSavedLocally } from "./blueprint-demo-saved-locally";
import { BlueprintDemoSectionCard } from "./blueprint-demo-section-card";
import type {
	HomePageBlueprintDraftFields,
	HomePageBlueprintPricingModel,
} from "./home-page-blueprint-draft-storage";

const BLOCKED_NUMBER_KEYS = new Set(["e", "E", "+", "-"]);

type PricingContent = HomePageContent["productPreviewSection"]["pricing"];

const pricingModelLabelByValue: Record<HomePageBlueprintPricingModel, string> =
	{
		one_time: "What's the one-time price in USD?",
		monthly: "What's the monthly price in USD?",
		yearly: "What's the yearly price in USD?",
	};

export function BlueprintDemoPricingCard({
	sectionNumber,
	label,
	description,
	pricing,
	fields,
	lastSavedAt,
	onSelectPricingModel,
	onPricingChange,
}: {
	readonly sectionNumber: number;
	readonly label: string;
	readonly description: string;
	readonly pricing: PricingContent;
	readonly fields: HomePageBlueprintDraftFields;
	readonly lastSavedAt: number | null;
	readonly onSelectPricingModel: (model: HomePageBlueprintPricingModel) => void;
	readonly onPricingChange: (price: string) => void;
}) {
	const dynamicPricingLabel = pricingModelLabelByValue[fields.pricing_model];
	const priceInputId = "blueprint-demo-pricing-input";
	const priceHelperId = `${priceInputId}-help`;
	const prefersReducedMotion = useBlueprintDemoReducedMotion();
	return (
		<BlueprintDemoSectionCard
			sectionId="pricing"
			sectionNumber={sectionNumber}
			label={label}
			description={description}
		>
			<div className="space-y-4">
				<p className="text-sm leading-6 text-muted-foreground">
					{pricing.intro}
				</p>
				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">
						{pricing.modelLabel}
					</p>
					<LayoutGroup id="blueprint-demo-pricing-pill-group">
						<div
							className="inline-flex rounded-lg border border-border/70 bg-muted/30 p-1"
							role="radiogroup"
							aria-label={pricing.modelLabel}
						>
							{pricing.modelOptions.map((option) => {
								const isSelected = option.value === fields.pricing_model;
								return (
									<button
										key={option.value}
										type="button"
										role="radio"
										aria-checked={isSelected}
										aria-label={option.ariaLabel}
										data-testid={`blueprint-demo-pricing-model-${option.value}`}
										onClick={() => onSelectPricingModel(option.value)}
										className={cn(
											"relative rounded-md px-3 py-1.5 text-sm transition-colors",
											isSelected
												? "text-background"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										{isSelected ? (
											<motion.span
												layoutId={
													prefersReducedMotion
														? undefined
														: "blueprint-demo-pricing-pill"
												}
												aria-hidden="true"
												className="absolute inset-0 -z-0 rounded-md bg-foreground"
												transition={{
													type: "spring",
													stiffness: 420,
													damping: 36,
												}}
											/>
										) : null}
										<span className="relative z-10">{option.label}</span>
									</button>
								);
							})}
						</div>
					</LayoutGroup>
				</div>
				<div className="space-y-1.5">
					<label
						htmlFor={priceInputId}
						className="text-sm font-medium text-foreground"
						data-testid="blueprint-demo-pricing-label"
					>
						{dynamicPricingLabel}
					</label>
					<div className="relative w-full max-w-[12rem]">
						<span
							aria-hidden="true"
							className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground"
						>
							$
						</span>
						<Input
							id={priceInputId}
							data-testid="blueprint-demo-pricing-input"
							type="number"
							inputMode="decimal"
							min={0}
							step={1}
							value={fields.pricing}
							placeholder={pricing.pricePlaceholder}
							onChange={(event) => onPricingChange(event.target.value)}
							onKeyDown={(event) => {
								if (BLOCKED_NUMBER_KEYS.has(event.key)) {
									event.preventDefault();
								}
							}}
							aria-describedby={priceHelperId}
							className="pl-7"
						/>
					</div>
					<p
						id={priceHelperId}
						className="text-xs leading-5 text-muted-foreground"
					>
						{pricing.priceHelperText}
					</p>
				</div>
				<BlueprintDemoSavedLocally lastSavedAt={lastSavedAt} scope="pricing" />
			</div>
		</BlueprintDemoSectionCard>
	);
}
