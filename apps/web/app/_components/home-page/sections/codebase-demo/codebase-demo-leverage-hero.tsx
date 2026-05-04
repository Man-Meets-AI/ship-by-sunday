"use client";

import type { HomePageContent } from "@/app/_content/home-page";
import { cn } from "@/lib/utils";

type CodebaseDemoLeverageHeroContent =
	HomePageContent["productPreviewSection"]["leverageHero"];
export type LeverageHeroOptionId =
	CodebaseDemoLeverageHeroContent["options"][number]["id"];

export function CodebaseDemoLeverageHero({
	leverageHero,
	selectedOptionId,
	onSelectedOptionChange,
}: {
	readonly leverageHero: CodebaseDemoLeverageHeroContent;
	readonly selectedOptionId: LeverageHeroOptionId;
	readonly onSelectedOptionChange: (optionId: LeverageHeroOptionId) => void;
}) {
	const accessibleHeadline = [
		leverageHero.headline,
		leverageHero.sublineLead,
		leverageHero.sublineBody,
		leverageHero.sublineEmphasis,
	].join(" ");

	return (
		<div className="flex flex-1 justify-center px-0 pt-[clamp(6rem,18vh,10rem)] pb-10 text-center lg:pt-[clamp(5rem,13vh,8rem)]">
			<div className="w-full">
				<h1
					aria-label={accessibleHeadline}
					className="font-heading-serif mx-auto flex max-w-[82rem] flex-col items-center text-white"
				>
					<span className="font-heading-serif block text-balance text-[4.5rem] leading-[0.8] font-normal italic sm:text-[6rem] md:text-[8.5rem] lg:whitespace-nowrap lg:text-[8.5rem] xl:text-[12rem] 2xl:text-[13rem]">
						{leverageHero.headline}
					</span>
					<span className="mt-2 flex flex-col items-center justify-center gap-y-1 leading-none lg:mt-1 lg:flex-row lg:gap-x-4 lg:gap-y-0">
						<span className="font-heading-serif text-[2rem] font-normal italic sm:text-[2.5rem] md:text-[3rem] lg:text-[3.4rem] xl:text-[3.9375rem]">
							{leverageHero.sublineLead}
						</span>
						<span className="font-home-inter text-[2.125rem] leading-[0.92] font-normal sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] lg:whitespace-nowrap xl:text-[4rem]">
							{leverageHero.sublineBody}
						</span>
						<span className="font-home-inter text-[2.125rem] leading-[0.92] font-normal sm:text-[2.5rem] md:text-[3rem] lg:translate-y-2 lg:text-[3.5rem] lg:whitespace-nowrap xl:text-[4rem]">
							{leverageHero.sublineEmphasis}
						</span>
					</span>
				</h1>
				<div className="mx-auto mt-10 w-full max-w-[53.0625rem] bg-[#d9d9d9] p-2 sm:mt-12 sm:p-2.5 lg:mt-14 lg:p-3.5">
					<div
						role="group"
						aria-label={leverageHero.optionGroupLabel}
						className="grid gap-0 lg:grid-cols-2"
					>
						{leverageHero.options.map((option) => {
							const isSelected = option.id === selectedOptionId;

							return (
								<button
									key={option.id}
									type="button"
									aria-pressed={isSelected}
									onClick={() => onSelectedOptionChange(option.id)}
									className={cn(
										"font-home-option-serif flex min-h-20 items-center justify-center px-5 py-4 text-center text-[1.75rem] leading-none font-normal text-[#111111] transition-colors duration-200 sm:min-h-24 sm:px-6 sm:text-[2rem] lg:min-h-[8.375rem] lg:whitespace-nowrap lg:text-[2.5rem]",
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
