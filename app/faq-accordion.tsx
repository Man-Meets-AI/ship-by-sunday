"use client";

import { useState } from "react";

type FAQItem = {
	question: string;
	answer: string;
};

export default function FAQAccordion({ items }: { items: readonly FAQItem[] }) {
	const [openQuestion, setOpenQuestion] = useState<string | null>(null);

	return (
		<div className="grid gap-[1px] border border-line bg-line">
			{items.map((item, index) => {
				const isOpen = openQuestion === item.question;
				const panelId = `faq-panel-${index}`;

				return (
					<div key={item.question} className="bg-white">
						<button
							type="button"
							className="sbs-press-feedback flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-xl font-medium leading-tight transition-colors duration-150 ease-out hover:bg-paper/50 motion-reduce:transition-none sm:text-2xl"
							aria-expanded={isOpen}
							aria-controls={panelId}
							onClick={() =>
								setOpenQuestion((current) =>
									current === item.question ? null : item.question,
								)
							}
						>
							<span>{item.question}</span>
							<span
								className={`grid size-12 place-items-center border border-line text-lg transition-transform duration-200 ease-out motion-reduce:transition-none ${
									isOpen ? "rotate-45" : "rotate-0"
								}`}
								aria-hidden="true"
							>
								+
							</span>
						</button>

						<div
							className={`grid overflow-hidden transition-[grid-template-rows] motion-reduce:transition-none ${
								isOpen
									? "grid-rows-[1fr] duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
									: "grid-rows-[0fr] duration-[160ms] ease-[cubic-bezier(0.4,0,1,1)]"
							}`}
						>
							<div className="overflow-hidden">
								<div
									id={panelId}
									aria-hidden={!isOpen}
									className={`border-t border-line px-5 py-5 text-base leading-relaxed text-ink/75 transition-all duration-200 ease-out motion-reduce:transition-none sm:text-lg ${
										isOpen
											? "translate-y-0 opacity-100 delay-[40ms]"
											: "pointer-events-none -translate-y-1 opacity-0"
									}`}
								>
									{item.answer}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
