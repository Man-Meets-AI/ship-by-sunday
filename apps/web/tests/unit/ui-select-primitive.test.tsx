/** @vitest-environment jsdom */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import "../setup/jsdom";

import {
	Select,
	SelectButton,
	SelectContent,
	SelectGroup,
	SelectGroupLabel,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
	selectTriggerVariants,
} from "@/components/ui/select";

describe("T3 Code Select primitive recipe", () => {
	it("keeps existing Select exports compileable", () => {
		expect(Select).toBeTypeOf("function");
		expect(SelectContent).toBeTypeOf("function");
		expect(SelectGroup).toBeTypeOf("function");
		expect(SelectItem).toBeTypeOf("function");
		expect(SelectLabel).toBeTypeOf("function");
		expect(SelectScrollDownButton).toBeTypeOf("function");
		expect(SelectScrollUpButton).toBeTypeOf("function");
		expect(SelectSeparator).toBeTypeOf("function");
		expect(SelectTrigger).toBeTypeOf("function");
		expect(SelectValue).toBeTypeOf("function");
		expect(SelectButton).toBeTypeOf("function");
		expect(SelectGroupLabel).toBeTypeOf("function");
		expect(selectTriggerVariants).toBeTypeOf("function");
	});

	it("renders SelectTrigger with current size and className behavior", () => {
		const markup = renderToStaticMarkup(
			<Select defaultValue="inter">
				<SelectTrigger
					aria-label="Font"
					className="w-full rounded-xl"
					size="sm"
				>
					<SelectValue placeholder="Font" />
				</SelectTrigger>
			</Select>,
		);

		expect(markup).toContain('data-slot="select-trigger"');
		expect(markup).toContain('data-size="sm"');
		expect(markup).toContain('data-variant="default"');
		expect(markup).toContain("w-full");
		expect(markup).toContain("rounded-xl");
		expect(markup).toContain("sm:min-h-7");
		expect(markup).toContain("not-dark:bg-clip-padding");
		expect(markup).toContain("before:shadow-[0_1px_--theme(--color-black/4%)]");
		expect(markup).toContain("not-data-[state=open]:before:shadow");
		expect(markup).toContain("data-[state=open]:shadow-none");
		expect(markup).toContain('data-slot="select-icon"');
	});

	it("renders the T3-compatible SelectButton helper", () => {
		const markup = renderToStaticMarkup(
			<SelectButton className="w-44" size="xs" variant="ghost">
				Theme
			</SelectButton>,
		);

		expect(markup).toContain('data-slot="select-button"');
		expect(markup).toContain('data-size="xs"');
		expect(markup).toContain('data-variant="ghost"');
		expect(markup).toContain('type="button"');
		expect(markup).toContain("w-44");
		expect(markup).toContain("min-w-none");
		expect(markup).toContain("border-transparent");
		expect(markup).toContain("data-pressed:bg-accent");
		expect(markup).toContain("data-[state=open]:bg-accent");
	});

	it("renders real content and items with Radix popper positioning", async () => {
		render(
			<Select defaultOpen defaultValue="vercel">
				<SelectTrigger aria-invalid aria-label="Design" className="w-full">
					<SelectValue placeholder="Design" />
				</SelectTrigger>
				<SelectContent className="w-[min(36rem,var(--radix-select-trigger-width))]">
					<SelectGroup>
						<SelectGroupLabel>Design systems</SelectGroupLabel>
						<SelectItem value="vercel">Vercel</SelectItem>
						<SelectItem disabled value="stripe">
							Stripe
						</SelectItem>
						<SelectSeparator />
					</SelectGroup>
				</SelectContent>
			</Select>,
		);

		const trigger = document.querySelector('[data-slot="select-trigger"]');
		expect(trigger).toBeTruthy();
		const triggerClassName = trigger?.getAttribute("class") ?? "";
		expect(triggerClassName).toContain("aria-invalid:border-destructive/36");
		expect(triggerClassName).toContain("data-[state=open]:shadow-none");

		await waitFor(() => {
			expect(
				document.querySelector('[data-slot="select-content"]'),
			).toBeTruthy();
		});

		const content = document.querySelector('[data-slot="select-content"]');
		const list = document.querySelector('[data-slot="select-list"]');
		const group = document.querySelector('[data-slot="select-group"]');
		const groupLabel = document.querySelector(
			'[data-slot="select-group-label"]',
		);
		const separator = document.querySelector('[data-slot="select-separator"]');
		const items = document.querySelectorAll('[data-slot="select-item"]');

		expect(content?.getAttribute("data-align-trigger")).toBe("false");
		expect(content?.getAttribute("data-side")).toBeTruthy();
		expect(content?.getAttribute("class")).toContain(
			"min-w-(--radix-select-trigger-width)",
		);
		expect(content?.getAttribute("class")).toContain(
			"w-[min(36rem,var(--radix-select-trigger-width))]",
		);
		expect(content?.getAttribute("class")).toContain(
			"data-[state=open]:animate-in",
		);
		expect(list?.getAttribute("data-position")).toBe("popper");
		expect(list?.getAttribute("class")).toContain(
			"data-[position=popper]:min-w-(--radix-select-trigger-width)",
		);
		expect(group).toBeTruthy();
		expect(groupLabel?.textContent).toBe("Design systems");
		expect(separator).toBeTruthy();
		expect(items).toHaveLength(2);
		expect(items[0]?.getAttribute("class")).toContain(
			"data-highlighted:bg-accent",
		);
		expect(
			items[0]?.querySelector('[data-slot="select-item-indicator"]'),
		).toBeTruthy();
		expect(
			items[0]?.querySelector('[data-slot="select-item-text"]')?.textContent,
		).toBe("Vercel");
		expect(items[1]?.hasAttribute("data-disabled")).toBe(true);
		expect(items[1]?.getAttribute("class")).toContain(
			"data-disabled:pointer-events-none",
		);
	});
});
