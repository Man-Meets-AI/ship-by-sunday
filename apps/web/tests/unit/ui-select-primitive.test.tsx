import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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

const selectSource = readFileSync(
	new URL("../../src/components/ui/select.tsx", import.meta.url),
	"utf8",
);

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
	});

	it("keeps content, item, and group slots usable with T3 tokens", () => {
		expect(selectSource).toContain('data-slot="select-content"');
		expect(selectSource).toContain('data-slot="select-list"');
		expect(selectSource).toContain('data-slot="select-item"');
		expect(selectSource).toContain('data-slot="select-item-indicator"');
		expect(selectSource).toContain('data-slot="select-item-text"');
		expect(selectSource).toContain('data-slot="select-group"');
		expect(selectSource).toContain('data-slot="select-group-label"');
		expect(selectSource).toContain("not-dark:bg-clip-padding");
		expect(selectSource).toContain(
			"before:shadow-[0_1px_--theme(--color-black/4%)]",
		);
		expect(selectSource).toContain("min-w-(--radix-select-trigger-width)");
		expect(selectSource).toContain("data-highlighted:bg-accent");
		expect(selectSource).toContain("hideIndicator");
	});
});
