import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

export const fieldLabelClass =
	"text-[13px] font-semibold leading-[1.35] text-product-text";

export function inputWidthClass(field: WorkbenchField) {
	if (field.inputWidth === "compact") {
		return "max-w-xl";
	}

	if (field.inputWidth === "wide") {
		return "max-w-none";
	}

	return "max-w-3xl";
}
