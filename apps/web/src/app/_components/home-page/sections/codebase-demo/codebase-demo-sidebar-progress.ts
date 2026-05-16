import type { CodebaseDemoSidebarProgressEntry } from "./codebase-demo-sidebar";
import type { HomePageCodebaseDraftFields } from "./home-page-codebase-draft-storage";

export function buildCodebaseDemoSidebarProgress(
	fields: HomePageCodebaseDraftFields,
	defaultPresetId: string,
	defaultPricingModel: string,
	defaultPrice: string,
): readonly CodebaseDemoSidebarProgressEntry[] {
	const foundationValues = [
		fields.product_name,
		fields.product_summary,
		fields.primary_user,
	].map((value) => value.trim());
	const filledFoundationCount = foundationValues.filter(
		(value) => value.length > 0,
	).length;
	const foundationStatus =
		filledFoundationCount === 0
			? "empty"
			: filledFoundationCount === foundationValues.length
				? "complete"
				: "started";

	const designStatus =
		fields.design_preset_id !== defaultPresetId ? "complete" : "empty";

	const pricingValueChanged = fields.pricing.trim() !== defaultPrice;
	const pricingModelChanged = fields.pricing_model !== defaultPricingModel;
	const pricingHasUserValue = fields.pricing.trim().length > 0;
	const pricingStatus = !pricingHasUserValue
		? "empty"
		: pricingValueChanged || pricingModelChanged
			? "complete"
			: "started";

	return [
		{ id: "foundation", status: foundationStatus },
		{ id: "design", status: designStatus },
		{ id: "pricing", status: pricingStatus },
	];
}
