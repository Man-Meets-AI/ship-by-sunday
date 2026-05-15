import {
	EdgeRouteContainer,
	EdgeRoutePage,
} from "@/components/layout/edge-route-surface";

import { CheckoutSuccessHelpPanel } from "./checkout-success-help-panel";
import { CheckoutSuccessMainPanel } from "./checkout-success-main-panel";
import type { CheckoutViewModel } from "../_lib/checkout-success-view-model";

export function CheckoutSuccessSurface({
	viewModel,
	canAutoRedirect,
	fixtureSlug,
}: {
	viewModel: CheckoutViewModel;
	canAutoRedirect: boolean;
	fixtureSlug?: string;
}) {
	return (
		<EdgeRoutePage
			className="flex items-start justify-center pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center sm:py-10"
			data-checkout-fixture={fixtureSlug}
		>
			<EdgeRouteContainer className="flex max-w-xl flex-col gap-4">
				<CheckoutSuccessMainPanel
					viewModel={viewModel}
					canAutoRedirect={canAutoRedirect}
				/>
				<CheckoutSuccessHelpPanel viewModel={viewModel} />
			</EdgeRouteContainer>
		</EdgeRoutePage>
	);
}
