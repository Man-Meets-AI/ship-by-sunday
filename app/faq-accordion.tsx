"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
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
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-xl font-medium leading-tight sm:text-2xl"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() =>
                setOpenQuestion((current) =>
                  current === item.question ? null : item.question
                )
              }
            >
              <span>{item.question}</span>
              <span
                className={`grid size-12 place-items-center border border-line text-lg transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            {isOpen ? (
              <div
                id={panelId}
                className="border-t border-line px-5 py-5 text-base leading-relaxed text-ink/75 sm:text-lg"
              >
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
