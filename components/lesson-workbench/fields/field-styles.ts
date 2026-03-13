import type { WorkbenchField } from "@/lib/course/manifest";

export const fieldLabelClass =
	"text-[13px] font-semibold leading-[1.35] text-product-text";

export const inputBaseClass =
	"mt-2 w-full rounded-none border border-product-border/65 bg-product-surface px-4 py-3 text-[15px] leading-[1.6] text-product-text outline-hidden transition-colors placeholder:text-product-muted/55 focus:border-product-accent";

export function inputWidthClass(field: WorkbenchField) {
	if (field.inputWidth === "compact") {
		return "max-w-xl";
	}

	if (field.inputWidth === "wide") {
		return "max-w-none";
	}

	return "max-w-3xl";
}
