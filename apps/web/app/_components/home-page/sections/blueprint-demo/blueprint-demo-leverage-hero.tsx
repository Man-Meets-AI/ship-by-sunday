"use client";

import { useState } from "react";

import type { HomePageContent } from "@/app/_content/home-page";
import { cn } from "@/lib/utils";

type BlueprintDemoLeverageHeroContent =
	HomePageContent["productPreviewSection"]["leverageHero"];
type LeverageHeroOptionId =
	BlueprintDemoLeverageHeroContent["options"][number]["id"];

export function BlueprintDemoLeverageHero({
	leverageHero,
}: {
	readonly leverageHero: BlueprintDemoLeverageHeroContent;
}) {
	const [selectedOptionId, setSelectedOptionId] =
		useState<LeverageHeroOptionId>(leverageHero.defaultOptionId);
	const accessibleHeadline = [
		leverageHero.headline,
		leverageHero.sublineLead,
		leverageHero.sublineBody,
		leverageHero.sublineEmphasis,
	].join(" ");

	return (
		<div className="flex flex-1 items-center justify-center py-16 text-center sm:py-20 lg:py-24">
			<div className="w-full">
				<h1
					aria-label={accessibleHeadline}
					className="mx-auto flex max-w-[82rem] flex-col items-center text-white"
				>
					<span className="font-home-instrument-serif block text-balance text-[4.5rem] leading-[0.8] font-normal italic sm:text-[7rem] md:text-[9rem] lg:whitespace-nowrap lg:text-[11rem] xl:text-[13rem] 2xl:text-[14rem]">
						{leverageHero.headline}
					</span>
					<span className="mt-1 flex flex-col items-center justify-center gap-x-3 leading-none sm:mt-0 sm:flex-row lg:mt-1 lg:gap-x-4">
						<span className="font-home-instrument-serif text-[2rem] font-normal italic sm:text-[3rem] lg:text-[3.9375rem]">
							{leverageHero.sublineLead}
						</span>
						<span className="font-home-inter text-[2.125rem] font-normal sm:text-[3rem] lg:text-[4rem]">
							{leverageHero.sublineBody}
						</span>
						<span className="font-home-inter text-[2.125rem] font-normal sm:text-[3rem] lg:translate-y-2 lg:text-[4rem]">
							{leverageHero.sublineEmphasis}
						</span>
					</span>
				</h1>
				<div className="mx-auto mt-12 w-full max-w-[53.0625rem] bg-[#d9d9d9] p-2 sm:mt-14 sm:p-3.5 lg:mt-16">
					<div
						role="group"
						aria-label={leverageHero.optionGroupLabel}
						className="grid gap-0 sm:grid-cols-2"
					>
						{leverageHero.options.map((option) => {
							const isSelected = option.id === selectedOptionId;

							return (
								<button
									key={option.id}
									type="button"
									aria-pressed={isSelected}
									onClick={() => setSelectedOptionId(option.id)}
									className={cn(
										"font-home-instrument-serif flex min-h-24 items-center justify-center px-5 py-5 text-center text-[1.75rem] leading-none font-normal text-[#111111] transition-colors duration-200 sm:min-h-[8.375rem] sm:whitespace-nowrap sm:px-6 sm:text-[2rem] lg:text-[2.5rem]",
										isSelected
											? "bg-[#f5f5f5] lg:text-[2.75rem]"
											: "bg-[#d9d9d9] hover:bg-[#e7e7e7]",
									)}
								>
									{option.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
