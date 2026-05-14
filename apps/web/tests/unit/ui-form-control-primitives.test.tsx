import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

describe("T3 Code form-control primitive recipes", () => {
	it("renders Input with a T3 Code control wrapper and native input props", () => {
		const markup = renderToStaticMarkup(
			<Input
				id="repo-url"
				type="url"
				defaultValue="https://example.com"
				className="h-10 max-w-48"
				inputClassName="pl-7"
				aria-invalid
			/>,
		);

		expect(markup).toContain('data-slot="input-control"');
		expect(markup).toContain('data-size="default"');
		expect(markup).toContain("not-dark:bg-clip-padding");
		expect(markup).toContain("has-focus-visible:ring-[3px]");
		expect(markup).toContain("before:shadow-[0_1px_--theme(--color-black/4%)]");
		expect(markup).toContain('data-slot="input"');
		expect(markup).toContain('id="repo-url"');
		expect(markup).toContain('type="url"');
		expect(markup).toContain("h-10 max-w-48");
		expect(markup).toContain("pl-7");
	});

	it("supports T3 Code Input sizes and native numeric size attributes", () => {
		const smallMarkup = renderToStaticMarkup(<Input size="sm" />);
		const numericMarkup = renderToStaticMarkup(<Input size={12} />);

		expect(smallMarkup).toContain('data-size="sm"');
		expect(smallMarkup).toContain("sm:h-6.5");
		expect(numericMarkup).toContain('data-size="12"');
		expect(numericMarkup).toContain('size="12"');
	});

	it("renders Textarea with a T3 Code control wrapper and native textarea props", () => {
		const markup = renderToStaticMarkup(
			<Textarea
				id="prompt"
				defaultValue="Ship it"
				rows={6}
				className="min-h-24"
				textareaClassName="min-h-24 resize-y font-mono"
				aria-invalid
			/>,
		);

		expect(markup).toContain('data-slot="textarea-control"');
		expect(markup).toContain("not-dark:bg-clip-padding");
		expect(markup).toContain("has-focus-visible:ring-[3px]");
		expect(markup).toContain('data-slot="textarea"');
		expect(markup).toContain('id="prompt"');
		expect(markup).toContain('rows="6"');
		expect(markup).toContain("min-h-24");
		expect(markup).toContain("resize-y");
		expect(markup).toContain("font-mono");
	});

	it("supports Textarea sizes and unstyled wrapper mode", () => {
		const largeMarkup = renderToStaticMarkup(<Textarea size="lg" />);
		const unstyledMarkup = renderToStaticMarkup(
			<Textarea unstyled className="rounded-none" />,
		);

		expect(largeMarkup).toContain('data-size="lg"');
		expect(largeMarkup).toContain("min-h-18.5");
		expect(unstyledMarkup).toContain('data-slot="textarea-control"');
		expect(unstyledMarkup).toContain("rounded-none");
		expect(unstyledMarkup).not.toContain("not-dark:bg-clip-padding");
	});
});
