import type { WorkbenchField } from "@/lib/course/manifest";

export const fieldLabelClass =
	"text-[11px] font-medium leading-snug text-product-text";

export const inputBaseClass =
	"mt-1.5 w-full rounded-none border border-product-border/80 bg-product-surface px-3 py-2 text-sm leading-relaxed text-product-text outline-hidden transition-colors placeholder:text-product-muted/55 focus:border-product-accent";

export function inputWidthClass(field: WorkbenchField) {
	if (field.inputWidth === "compact") {
		return "max-w-xl";
	}

	if (field.inputWidth === "wide") {
		return "max-w-none";
	}

	return "max-w-3xl";
}
