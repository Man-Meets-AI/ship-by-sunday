import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

describe("T3 Code form scaffold and control recipes", () => {
	it("renders Field scaffold typography and error compatibility", () => {
		const markup = renderToStaticMarkup(
			<FieldGroup>
				<Field data-invalid>
					<FieldLabel htmlFor="project-name">Project</FieldLabel>
					<FieldDescription>Short helper copy</FieldDescription>
					<FieldTitle>Scale</FieldTitle>
					<FieldError errors={[{ message: "Required" }]} />
					<FieldSeparator>or</FieldSeparator>
				</Field>
			</FieldGroup>,
		);

		expect(markup).toContain('data-slot="field-group"');
		expect(markup).toContain('data-slot="field-label"');
		expect(markup).toContain("text-base/4.5");
		expect(markup).toContain("sm:text-sm/4");
		expect(markup).toContain('data-slot="field-description"');
		expect(markup).toContain("text-xs");
		expect(markup).toContain('data-slot="field-error"');
		expect(markup).toContain('role="alert"');
		expect(markup).toContain("text-destructive-foreground");
		expect(markup).toContain('data-slot="field-separator"');
	});

	it("renders Label and Separator with T3 Code recipes", () => {
		const labelMarkup = renderToStaticMarkup(
			<Label htmlFor="email">Email</Label>,
		);
		const separatorMarkup = renderToStaticMarkup(
			<Separator orientation="vertical" decorative />,
		);

		expect(labelMarkup).toContain('data-slot="label"');
		expect(labelMarkup).toContain("text-base/4.5");
		expect(labelMarkup).toContain("text-foreground");
		expect(separatorMarkup).toContain('data-slot="separator"');
		expect(separatorMarkup).toContain('data-orientation="vertical"');
		expect(separatorMarkup).toContain("data-[orientation=vertical]:w-px");
		expect(separatorMarkup).toContain("not-[[class^=&#x27;h-&#x27;]]");
		expect(separatorMarkup).toContain("self-stretch");
	});

	it("renders Checkbox and Switch with T3 Code control surfaces", () => {
		const checkboxMarkup = renderToStaticMarkup(
			<Checkbox defaultChecked aria-invalid />,
		);
		const switchMarkup = renderToStaticMarkup(<Switch defaultChecked size="sm" />);

		expect(checkboxMarkup).toContain('data-slot="checkbox"');
		expect(checkboxMarkup).toContain("not-dark:bg-clip-padding");
		expect(checkboxMarkup).toContain("focus-visible:ring-offset-background");
		expect(checkboxMarkup).toContain('data-slot="checkbox-indicator"');
		expect(checkboxMarkup).toContain("M5.252 12.7 10.2 18.63 18.748 5.37");
		expect(switchMarkup).toContain('data-slot="switch"');
		expect(switchMarkup).toContain('data-size="sm"');
		expect(switchMarkup).toContain("[--thumb-size:--spacing(5)]");
		expect(switchMarkup).toContain('data-slot="switch-thumb"');
		expect(switchMarkup).toContain("data-checked:translate-x");
	});

	it("renders Radio and RadioGroupItem compatibility aliases", () => {
		const radioMarkup = renderToStaticMarkup(
			<RadioGroup defaultValue="yes">
				<Radio value="yes" />
				<RadioGroupItem value="no" />
			</RadioGroup>,
		);

		expect(radioMarkup).toContain('data-slot="radio-group"');
		expect(radioMarkup).toContain("flex flex-col gap-3");
		expect(radioMarkup).toContain('data-slot="radio"');
		expect(radioMarkup).toContain("not-dark:bg-clip-padding");
		expect(radioMarkup).toContain('data-slot="radio-indicator"');
		expect(radioMarkup).toContain("before:bg-primary-foreground");
	});
});
