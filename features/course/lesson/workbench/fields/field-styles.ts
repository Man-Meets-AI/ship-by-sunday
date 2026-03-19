import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

export function inputWidthClass(field: WorkbenchField) {
	if (field.inputWidth === "compact") {
		return "max-w-xl";
	}

	if (field.inputWidth === "wide") {
		return "max-w-none";
	}

	return "max-w-3xl";
}
